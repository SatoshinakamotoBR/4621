import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function generateSecret(length = 32) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, botToken, message, channelId, botName, botId, vipChannelId, supportChannelId, welcomeImageUrl } = await req.json();

    if (!action) {
      return new Response(JSON.stringify({ error: 'Action is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ===== UPDATE WEBHOOK =====
    if (action === 'update_webhook') {
      if (!botId) {
        return new Response(JSON.stringify({ error: 'Bot ID is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('🔄 Updating webhook for bot:', botId);

      // Verify bot ownership
      const { data: botData, error: botError } = await supabaseClient
        .from('telegram_bots')
        .select('id, user_id')
        .eq('id', botId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (botError || !botData) {
        console.error('❌ Bot not found or unauthorized:', botId);
        return new Response(JSON.stringify({ error: 'Bot not found or unauthorized' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Generate and store webhook secret
      const secret = generateSecret(32);
      const { error: updErr } = await supabaseClient
        .from('telegram_bots')
        .update({ webhook_secret: secret })
        .eq('id', botId);

      if (updErr) {
        console.error('❌ Failed to store webhook secret:', updErr);
        return new Response(JSON.stringify({ error: 'Failed to store webhook secret' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Retrieve bot token securely via RPC
      const { data: tokenData, error: tokenErr } = await supabaseClient
        .rpc('get_bot_token', { bot_id_param: botId });

      if (tokenErr || !tokenData) {
        console.error('❌ Failed to retrieve bot token:', tokenErr);
        return new Response(JSON.stringify({ error: 'Failed to retrieve bot token' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Configure webhook URL with bot_id parameter
      const projectId = Deno.env.get('SUPABASE_URL')?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
      const webhookUrl = `https://${projectId}.supabase.co/functions/v1/telegram-webhook?bot_id=${botId}`;
      
      console.log('🔗 Setting webhook:', webhookUrl);
      
      const webhookResponse = await fetch(
        `https://api.telegram.org/bot${tokenData}/setWebhook`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: webhookUrl,
            allowed_updates: ['message', 'callback_query'],
            drop_pending_updates: true,
            secret_token: secret
          }),
        }
      );

      const webhookData = await webhookResponse.json();
      console.log('📡 Webhook response:', webhookData.ok ? '✅' : '❌', webhookData.description || '');

      if (!webhookData.ok) {
        return new Response(JSON.stringify({ error: 'Failed to update webhook', details: webhookData }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true, webhook: webhookData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ===== VERIFY BOT TOKEN AND CREATE BOT =====
    if (action === 'verify') {
      if (!botToken) {
        return new Response(JSON.stringify({ error: 'Bot token is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('🔍 Verifying bot token');

      const verifyResponse = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
      const verifyData = await verifyResponse.json();

      if (!verifyData.ok) {
        console.error('❌ Invalid bot token');
        return new Response(JSON.stringify({ error: 'Invalid bot token' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('✅ Bot verified:', verifyData.result.username);

      // Check if bot already exists (prevent duplicates)
      const { data: existingBot } = await supabaseClient
        .from('telegram_bots')
        .select('id')
        .eq('bot_token', botToken)
        .maybeSingle();

      if (existingBot) {
        console.log('⚠️ Bot already registered');
        return new Response(JSON.stringify({ error: 'Bot already registered' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Generate webhook secret
      const secret = generateSecret(32);

      // Save bot to database
      const { data: bot, error: botError } = await supabaseClient
        .from('telegram_bots')
        .insert({
          user_id: user.id,
          bot_name: botName || verifyData.result.first_name,
          bot_token: botToken,
          bot_username: verifyData.result.username,
          vip_channel_id: vipChannelId,
          support_channel_id: supportChannelId,
          welcome_image_url: welcomeImageUrl,
          webhook_secret: secret,
        })
        .select('id, user_id, bot_name, bot_username, is_active, created_at, updated_at')
        .single();

      if (botError) {
        console.error('❌ Failed to save bot:', botError);
        return new Response(JSON.stringify({ error: 'Failed to save bot' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('💾 Bot saved:', bot.id);

      // Configure webhook
      const projectId = Deno.env.get('SUPABASE_URL')?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
      const webhookUrl = `https://${projectId}.supabase.co/functions/v1/telegram-webhook?bot_id=${bot.id}`;
      
      console.log('🔗 Setting webhook:', webhookUrl);
      
      const webhookResponse = await fetch(
        `https://api.telegram.org/bot${botToken}/setWebhook`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: webhookUrl,
            allowed_updates: ['message', 'callback_query'],
            drop_pending_updates: true,
            secret_token: secret
          }),
        }
      );

      const webhookData = await webhookResponse.json();
      console.log('📡 Webhook setup:', webhookData.ok ? '✅' : '❌', webhookData.description || '');

      return new Response(JSON.stringify({ success: true, bot: verifyData.result, savedBot: bot, webhook: webhookData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ===== SEND MESSAGE TO CHANNEL =====
    if (action === 'send_message') {
      if (!botId || !message || !channelId) {
        return new Response(JSON.stringify({ error: 'Bot ID, message, and channel ID are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('📤 Sending message to channel:', channelId);

      // Retrieve bot token securely via RPC
      const { data: tokenData, error: tokenError } = await supabaseClient
        .rpc('get_bot_token', { bot_id_param: botId });

      if (tokenError || !tokenData) {
        console.error('❌ Failed to retrieve bot token:', tokenError);
        return new Response(JSON.stringify({ error: 'Failed to retrieve bot token or unauthorized' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const sendResponse = await fetch(
        `https://api.telegram.org/bot${tokenData}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: channelId,
            text: message,
            parse_mode: 'HTML',
          }),
        }
      );

      const sendData = await sendResponse.json();

      if (!sendData.ok) {
        console.error('❌ Telegram API error:', sendData.description);
        return new Response(JSON.stringify({ error: sendData.description || 'Failed to send message' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('✅ Message sent');

      return new Response(JSON.stringify({ success: true, result: sendData.result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('💥 Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
