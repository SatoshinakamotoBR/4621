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
        url:='https://gtkavkscbxyfjgovwoxn.supabase.co/functions/v1/process-message-queue',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0a2F2a3NjYnh5Zmpnb3Z3b3huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNzAyMDQsImV4cCI6MjA3NTY0NjIwNH0.W14rIpbAsnFv5TBAruCM48k-YZr8m-yUQTlBWaZ8yiM"}'::jsonb,
        body:=concat('{"triggered_at": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);