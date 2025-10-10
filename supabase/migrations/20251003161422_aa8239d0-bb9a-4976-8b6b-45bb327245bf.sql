-- Add webhook_secret to telegram_bots if missing
ALTER TABLE public.telegram_bots
ADD COLUMN IF NOT EXISTS webhook_secret text;