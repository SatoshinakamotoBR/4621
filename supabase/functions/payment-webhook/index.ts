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

    const webhookData = await req.json();
    console.log('Payment webhook received:', webhookData);

    const { bot_id, telegram_user_id, plan_id, payment_status } = webhookData;

    // Save webhook data
    await supabaseClient
      .from('payment_webhooks')
      .insert({
        bot_id,
        telegram_user_id,
        plan_id,
        payment_status,
        payment_data: webhookData,
        processed: false,
      });

    // If payment approved, add user to VIP channel
    if (payment_status === 'approved') {
      // Get bot info
      const { data: bot } = await supabaseClient
        .from('telegram_bots')
        .select('bot_token')
        .eq('id', bot_id)
        .single();

      if (!bot) {
        throw new Error('Bot not found');
      }

      // Get VIP channel configuration
      const { data: vipChannel } = await supabaseClient
        .from('bot_channels')
        .select('*')
        .eq('bot_id', bot_id)
        .eq('channel_type', 'vip')
        .eq('is_active', true)
        .maybeSingle();

      if (vipChannel) {
        // Add user to VIP channel
        const inviteResponse = await fetch(
          `https://api.telegram.org/bot${bot.bot_token}/createChatInviteLink`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: vipChannel.channel_id,
              member_limit: 1,
              expire_date: Math.floor(Date.now() / 1000) + 86400, // 24 hours
            }),
          }
        );

        const inviteData = await inviteResponse.json();
        console.log('VIP invite created:', inviteData);

        // Send invite link to user
        if (inviteData.ok) {
          await fetch(
            `https://api.telegram.org/bot${bot.bot_token}/sendMessage`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: telegram_user_id,
                text: `🎉 Pagamento aprovado! Bem-vindo ao Canal VIP!\n\nClique no link abaixo para entrar:\n${inviteData.result.invite_link}`,
                parse_mode: 'HTML',
              }),
            }
          );
        }
      }

      // Send notification to support channel
      const { data: supportChannel } = await supabaseClient
        .from('bot_channels')
        .select('*')
        .eq('bot_id', bot_id)
        .eq('channel_type', 'registry')
        .eq('is_active', true)
        .maybeSingle();

      if (supportChannel) {
        // Get plan details
        const { data: plan } = await supabaseClient
          .from('bot_plans')
          .select('*')
          .eq('id', plan_id)
          .maybeSingle();

        await fetch(
          `https://api.telegram.org/bot${bot.bot_token}/sendMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: supportChannel.channel_id,
              text: `💰 <b>Nova Venda Aprovada!</b>\n\n` +
                    `👤 User ID: ${telegram_user_id}\n` +
                    `📦 Plano: ${plan?.plan_name || 'N/A'}\n` +
                    `💵 Valor: R$ ${plan?.price.toFixed(2) || '0.00'}\n` +
                    `📅 Data: ${new Date().toLocaleString('pt-BR')}`,
              parse_mode: 'HTML',
            }),
          }
        );
      }

      // Mark webhook as processed
      await supabaseClient
        .from('payment_webhooks')
        .update({ processed: true })
        .eq('bot_id', bot_id)
        .eq('telegram_user_id', telegram_user_id)
        .eq('plan_id', plan_id)
        .order('created_at', { ascending: false })
        .limit(1);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing payment webhook:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
