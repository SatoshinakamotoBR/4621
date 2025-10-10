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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      console.error('❌ Unauthorized: no user');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('📁 File upload request from user:', user.id);

    const { bot_id, telegram_user_id, file_path, file_type, file_size } = await req.json();

    // Get bot info using service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data: bot, error: botErr } = await supabaseAdmin
      .from('telegram_bots')
      .select('bot_token, user_id, support_channel_id')
      .eq('id', bot_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (botErr || !bot) {
      console.error('❌ Bot not found or unauthorized:', bot_id);
      return new Response(JSON.stringify({ error: 'Bot not found or unauthorized' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ Bot found:', bot_id, 'Owner:', bot.user_id);

    // Record upload in database
    await supabaseAdmin
      .from('user_uploads')
      .insert({
        bot_id,
        telegram_user_id,
        file_path,
        file_type,
        file_size,
        sent_to_support: false,
      });

    console.log('💾 Upload recorded in database');

    // Send to support/registry channel if configured
    if (bot.support_channel_id) {
      console.log('📤 Sending file to support channel:', bot.support_channel_id);

      // Get file URL
      const { data: fileData, error: urlErr } = await supabaseAdmin
        .storage
        .from('bot-uploads')
        .createSignedUrl(file_path, 3600);

      if (urlErr || !fileData) {
        console.error('❌ Failed to get signed URL:', urlErr);
      } else {
        // Determine send method based on file type
        const sendMethod = file_type?.startsWith('image/') ? 'sendPhoto' 
          : file_type?.startsWith('video/') ? 'sendVideo'
          : file_type?.startsWith('audio/') ? 'sendAudio'
          : 'sendDocument';

        const fileField = sendMethod === 'sendPhoto' ? 'photo'
          : sendMethod === 'sendVideo' ? 'video'
          : sendMethod === 'sendAudio' ? 'audio'
          : 'document';

        const telegramResponse = await fetch(
          `https://api.telegram.org/bot${bot.bot_token}/${sendMethod}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: bot.support_channel_id,
              [fileField]: fileData.signedUrl,
              caption: `📎 <b>Novo arquivo recebido</b>\n\n` +
                      `👤 User ID: ${telegram_user_id}\n` +
                      `📁 Tipo: ${file_type || 'desconhecido'}\n` +
                      `📊 Tamanho: ${(file_size / 1024).toFixed(2)} KB\n` +
                      `📅 Data: ${new Date().toLocaleString('pt-BR')}`,
              parse_mode: 'HTML',
            }),
          }
        );

        const telegramResult = await telegramResponse.json();

        if (telegramResult.ok) {
          console.log('✅ File sent to support channel');

          // Mark as sent to support
          await supabaseAdmin
            .from('user_uploads')
            .update({ sent_to_support: true })
            .eq('bot_id', bot_id)
            .eq('telegram_user_id', telegram_user_id)
            .eq('file_path', file_path);
        } else {
          console.error('❌ Failed to send to support channel:', telegramResult.description);
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('💥 Error handling file upload:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
