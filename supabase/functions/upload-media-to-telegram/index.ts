

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface UploadRequest {
  bot_id: string;
  file: string;
  file_name: string;
  file_type: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    console.log("Upload media endpoint called");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "apikey": supabaseAnonKey,
      },
    });

    if (!userResponse.ok) {
      console.error("User authentication failed:", userResponse.status);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const user = await userResponse.json();
    console.log("User authenticated:", user.id);

    const { bot_id, file, file_name, file_type }: UploadRequest = await req.json();
    console.log("Upload request:", { bot_id, file_name, file_type });

    const botResponse = await fetch(
      `${supabaseUrl}/rest/v1/telegram_bots?id=eq.${bot_id}&user_id=eq.${user.id}&select=bot_token,user_id,support_channel_id`,
      {
        headers: {
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "apikey": supabaseServiceKey,
          "Content-Type": "application/json",
        },
      }
    );

    const bots = await botResponse.json();
    console.log("Bot query result:", bots);
    
    if (!bots || bots.length === 0) {
      console.error("Bot not found for user:", user.id, "bot_id:", bot_id);
      return new Response(
        JSON.stringify({ error: "Bot not found or unauthorized" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const bot = bots[0];
    console.log("Bot found with support_channel_id:", bot.support_channel_id);

    if (!bot.support_channel_id) {
      console.error("No support channel configured for bot:", bot_id);
      return new Response(
        JSON.stringify({
          error: "Support channel not configured",
          message: "Please configure the support channel in Config tab first",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Using support channel as registry:", bot.support_channel_id);

    const base64Data = file.includes(",") ? file.split(",")[1] : file;
    const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    const formData = new FormData();
    const blob = new Blob([binaryData], { type: file_type });
    formData.append("chat_id", bot.support_channel_id);

    const isImage = file_type.startsWith("image/");
    const isVideo = file_type.startsWith("video/");

    let sendMethod = "sendDocument";
    let fileField = "document";

    if (isImage) {
      sendMethod = "sendPhoto";
      fileField = "photo";
    } else if (isVideo) {
      sendMethod = "sendVideo";
      fileField = "video";
    }

    formData.append(fileField, blob, file_name);
    formData.append("caption", `📁 ${file_name}\n👤 User: ${user.id}\n📅 ${new Date().toISOString()}`);

    if (isVideo) {
      formData.append("supports_streaming", "true");
    }

    console.log(`Uploading ${file_type} to Telegram using ${sendMethod}`);

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${bot.bot_token}/${sendMethod}`,
      {
        method: "POST",
        body: formData,
      }
    );

    const telegramData = await telegramResponse.json();

    console.log("Telegram response:", JSON.stringify(telegramData));

    if (!telegramData.ok) {
      console.error("Telegram error:", telegramData.description);
      throw new Error(`Telegram API error: ${telegramData.description || "Unknown error"}`);
    }

    let fileId = "";
    if (isImage && telegramData.result.photo) {
      fileId = telegramData.result.photo[telegramData.result.photo.length - 1].file_id;
    } else if (isVideo && telegramData.result.video) {
      fileId = telegramData.result.video.file_id;
    } else if (telegramData.result.document) {
      fileId = telegramData.result.document.file_id;
    }

    if (!fileId) {
      console.error("No file_id found in response:", telegramData);
      throw new Error("Failed to get file_id from Telegram");
    }

    return new Response(
      JSON.stringify({
        success: true,
        file_id: fileId,
        media_type: isImage ? "photo" : isVideo ? "video" : "document",
        message_id: telegramData.result.message_id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error uploading to Telegram:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});