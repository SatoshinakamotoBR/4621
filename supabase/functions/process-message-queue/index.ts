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

    console.log('⏰ Processing message queue...');

    // Get pending messages that should be sent now
    const { data: pendingMessages, error: fetchError } = await supabaseClient
      .from('message_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .limit(50);

    if (fetchError) {
      console.error('❌ Error fetching messages:', fetchError);
      throw fetchError;
    }

    if (!pendingMessages || pendingMessages.length === 0) {
      console.log('✅ No messages to process');
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`📬 Processing ${pendingMessages.length} messages`);

    let successCount = 0;
    let failCount = 0;

    for (const item of pendingMessages) {
      try {
        console.log(`📤 Sending message ${item.id} to chat ${item.chat_id}`);

        // Fetch bot data
        const { data: botRow, error: botErr } = await supabaseClient
          .from('telegram_bots')
          .select('bot_token')
          .eq('id', item.bot_id)
          .maybeSingle();

        if (botErr || !botRow) {
          throw new Error('Bot not found for queued message');
        }

        // Fetch scheduled message data
        const { data: message, error: msgErr } = await supabaseClient
          .from('scheduled_messages')
          .select('*')
          .eq('id', item.scheduled_message_id)
          .maybeSingle();

        if (msgErr || !message) {
          throw new Error('Scheduled message not found');
        }

        const botToken = botRow.bot_token;

        // Build buttons from message and linked plans
        const { data: planLinks } = await supabaseClient
          .from('scheduled_message_plans')
          .select('bot_plan_id, discount_percentage')
          .eq('scheduled_message_id', item.scheduled_message_id);

        const inlineButtons: any[] = [];
        if (message.button_text && message.button_url) {
          inlineButtons.push([
            { text: message.button_text, url: message.button_url }
          ]);
        }
        if (planLinks && planLinks.length > 0) {
          for (const link of planLinks) {
            const { data: plan } = await supabaseClient
              .from('bot_plans')
              .select('*')
              .eq('id', link.bot_plan_id)
              .maybeSingle();
            if (plan) {
              const originalPrice = plan.price;
              const discount = link.discount_percentage || 0;
              const finalPrice = discount > 0 ? originalPrice * (1 - discount / 100) : originalPrice;
              const buttonText = discount > 0
                ? `${plan.plan_name} - R$ ${finalPrice.toFixed(2)} (${discount}% OFF)`
                : `${plan.plan_name} - R$ ${finalPrice.toFixed(2)}`;
              if (plan.payment_link) {
                inlineButtons.push([{ text: buttonText, url: plan.payment_link }]);
              }
            }
          }
        }
        const replyMarkup = inlineButtons.length > 0 ? { inline_keyboard: inlineButtons } : undefined;

        // Send as a single message: if media exists, send media WITH caption and buttons; else send text
        let sentOk = false;
        if (message.media_url && message.media_type) {
          const mediaMethod = message.media_type === 'photo' ? 'sendPhoto'
            : message.media_type === 'video' ? 'sendVideo'
            : message.media_type === 'audio' ? 'sendAudio'
            : 'sendDocument';
          const mediaField = message.media_type === 'photo' ? 'photo'
            : message.media_type === 'video' ? 'video'
            : message.media_type === 'audio' ? 'audio'
            : 'document';

          console.log(`🖼️ Sending media (${message.media_type}) with caption`);
          const mediaResponse = await fetch(
            `https://api.telegram.org/bot${botToken}/${mediaMethod}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: item.chat_id,
                [mediaField]: message.media_url,
                caption: message.message_text || undefined,
                parse_mode: 'HTML',
                ...(replyMarkup ? { reply_markup: replyMarkup } : {})
              }),
            }
          );
          const mediaResult = await mediaResponse.json();
          if (!mediaResult.ok) {
            console.error('❌ Media send failed:', mediaResult.description);
          } else {
            console.log('✅ Media+caption sent');
            sentOk = true;
          }
        }

        if (!sentOk) {
          console.log('💬 Sending text message');
          const textResponse = await fetch(
            `https://api.telegram.org/bot${botToken}/sendMessage`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: item.chat_id,
                text: message.message_text,
                parse_mode: 'HTML',
                ...(replyMarkup ? { reply_markup: replyMarkup } : {})
              }),
            }
          );
          const textResult = await textResponse.json();
          if (!textResult.ok) {
            throw new Error(textResult.description || 'Failed to send message');
          }
          console.log('✅ Text message sent');
        }

        // Mark as sent
        await supabaseClient
          .from('message_queue')
          .update({ 
            status: 'sent', 
            sent_at: new Date().toISOString() 
          })
          .eq('id', item.id);

        successCount++;
        console.log(`✅ Message ${item.id} sent successfully`);
      } catch (error) {
        console.error(`❌ Error sending message ${item.id}:`, error);
        
        // Mark as failed
        await supabaseClient
          .from('message_queue')
          .update({
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error',
          })
          .eq('id', item.id);

        failCount++;
      }
    }

    console.log(`📊 Processed: ${successCount} sent, ${failCount} failed`);

    return new Response(
      JSON.stringify({ 
        processed: pendingMessages.length,
        success: successCount,
        failed: failCount 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('💥 Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
