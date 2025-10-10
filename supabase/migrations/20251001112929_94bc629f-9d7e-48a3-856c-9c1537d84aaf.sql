-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the message queue processor to run every minute
SELECT cron.schedule(
  'process-telegram-message-queue',
  '* * * * *', -- Run every minute
  $$
  SELECT
    net.http_post(
        url:='https://ffhkukygnqejsivebimc.supabase.co/functions/v1/process-message-queue',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmaGt1a3lnbnFlanNpdmViaW1jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTIzOTQ2MCwiZXhwIjoyMDc0ODE1NDYwfQ.3s_VzIvPvVQd8-rRDMp3KVW9uaDLNtVxGHNYPjXVWNw"}'::jsonb,
        body:=concat('{"triggered_at": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);