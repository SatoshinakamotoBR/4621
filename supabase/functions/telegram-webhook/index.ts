import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const update = await req.json();
    console.log('📨 Received update:', JSON.stringify(update));

    if (!update.message) {
      console.log('⚠️ No message in update, skipping');
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { chat: { id: chatId }, from: { id: userId, username, first_name: firstName }, text: messageText = '', message_id: messageId } = update.message;

    // Identify bot by bot_id param + validate secret
    const url = new URL(req.url);
    const botIdParam = url.searchParams.get('bot_id');
    const secretHeader = req.headers.get('x-telegram-bot-api-secret-token');

    if (!botIdParam) {
      console.error('❌ Missing bot_id parameter');
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: bot, error: botError } = await supabaseClient
      .from('telegram_bots')
      .select('id, bot_token, user_id, welcome_image_url, vip_channel_id, support_channel_id, webhook_secret')
      .eq('id', botIdParam)
      .eq('is_active', true)
      .maybeSingle();

    if (botError || !bot) {
      console.error('❌ Bot not found:', botIdParam, botError);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate secret if webhook_secret is set
    if (bot.webhook_secret && secretHeader !== bot.webhook_secret) {
      console.error('❌ Invalid webhook secret for bot:', botIdParam);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ Bot identified:', bot.id, 'Owner:', bot.user_id);

    // Save received message
    await supabaseClient
      .from('received_messages')
      .insert({
        bot_id: bot.id,
        chat_id: chatId,
        user_id: userId,
        username: username || null,
        first_name: firstName || 'User',
        message_text: messageText,
        telegram_message_id: messageId,
      });

    console.log('💾 Message saved from:', firstName, 'Text:', messageText);

    // Handle /start command
    if (messageText && messageText.startsWith('/start')) {
      console.log('🚀 Processing /start command');

      // Record user interaction
      await supabaseClient
        .from('user_interactions')
        .upsert({
          bot_id: bot.id,
          chat_id: chatId,
          telegram_user_id: userId,
          last_start_at: new Date().toISOString(),
        }, {
          onConflict: 'bot_id,chat_id,telegram_user_id'
        });

      // Queue scheduled messages (downsell/upsell)
      const { data: scheduledMessages } = await supabaseClient
        .from('scheduled_messages')
        .select('*')
        .eq('bot_id', bot.id)
        .eq('is_active', true)
        .order('delay_minutes', { ascending: true });

      if (scheduledMessages && scheduledMessages.length > 0) {
        const now = new Date();
        const queueItems = scheduledMessages.map(msg => ({
          bot_id: bot.id,
          scheduled_message_id: msg.id,
          chat_id: chatId,
          telegram_user_id: userId,
          scheduled_for: new Date(now.getTime() + msg.delay_minutes * 60000).toISOString(),
          status: 'pending'
        }));

        await supabaseClient.from('message_queue').insert(queueItems);
        console.log(`📅 Queued ${queueItems.length} scheduled messages`);
      }

      // Get welcome message configuration
      const { data: welcomeMessage } = await supabaseClient
        .from('bot_messages')
        .select('*')
        .eq('bot_id', bot.id)
        .eq('message_type', 'welcome')
        .eq('is_active', true)
        .maybeSingle();

      if (welcomeMessage) {
        console.log('📤 Sending welcome message with media');

        // 1️⃣ Send media first (priority: message media > bot welcome image)
        if (welcomeMessage.media_url && welcomeMessage.media_type) {
          const mediaMethod = welcomeMessage.media_type === 'photo' ? 'sendPhoto'
            : welcomeMessage.media_type === 'video' ? 'sendVideo'
            : welcomeMessage.media_type === 'audio' ? 'sendAudio'
            : 'sendDocument';
          
          const mediaField = welcomeMessage.media_type === 'photo' ? 'photo'
            : welcomeMessage.media_type === 'video' ? 'video'
            : welcomeMessage.media_type === 'audio' ? 'audio'
            : 'document';

          await fetch(
            `https://api.telegram.org/bot${bot.bot_token}/${mediaMethod}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                [mediaField]: welcomeMessage.media_url
              }),
            }
          );
          console.log('🖼️ Media sent');
        } else if (bot.welcome_image_url) {
          await fetch(
            `https://api.telegram.org/bot${bot.bot_token}/sendPhoto`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                photo: bot.welcome_image_url,
              }),
            }
          );
          console.log('🖼️ Bot welcome image sent');
        }

        // 2️⃣ Send text message with buttons
        const { data: messagePlans } = await supabaseClient
          .from('bot_message_plans')
          .select('bot_plan_id')
          .eq('bot_message_id', welcomeMessage.id);

        const replyMarkup: any = {};
        if (messagePlans && messagePlans.length > 0) {
          const planIds = messagePlans.map(mp => mp.bot_plan_id);
          const { data: plans } = await supabaseClient
            .from('bot_plans')
            .select('*')
            .in('id', planIds)
            .eq('is_active', true);

          if (plans && plans.length > 0) {
            replyMarkup.inline_keyboard = plans.map(plan => [{
              text: `${plan.plan_name} - R$ ${plan.price}`,
              url: plan.payment_link
            }]);
          }
        }

        const textResponse = await fetch(
          `https://api.telegram.org/bot${bot.bot_token}/sendMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: welcomeMessage.message_text,
              parse_mode: 'HTML',
              ...(Object.keys(replyMarkup).length > 0 ? { reply_markup: replyMarkup } : {})
            }),
          }
        );

        const result = await textResponse.json();
        console.log('💬 Welcome message sent:', result.ok ? '✅' : '❌', result.description || '');
      } else {
        console.log('⚠️ No welcome message configured, sending default');
        
        // Send default welcome if no configuration
        if (bot.welcome_image_url) {
          await fetch(
            `https://api.telegram.org/bot${bot.bot_token}/sendPhoto`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                photo: bot.welcome_image_url,
              }),
            }
          );
        }

        await fetch(
          `https://api.telegram.org/bot${bot.bot_token}/sendMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: '👋 Bem-vindo! Configure suas mensagens no dashboard.',
              parse_mode: 'HTML',
            }),
          }
        );
      }
    } else {
      // Echo other messages
      await fetch(
        `https://api.telegram.org/bot${bot.bot_token}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: `Você disse: ${messageText}`,
            parse_mode: 'HTML',
          }),
        }
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('💥 Error:', error);
    return new Response(JSON.stringify({ ok: true, error: error instanceof Error ? error.message : 'Unknown error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
