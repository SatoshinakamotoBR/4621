-- Add fields to telegram_bots for welcome image and default channels
ALTER TABLE public.telegram_bots 
ADD COLUMN welcome_image_url TEXT,
ADD COLUMN vip_channel_id TEXT,
ADD COLUMN support_channel_id TEXT;

-- Create index for faster channel lookups
CREATE INDEX idx_telegram_bots_channels ON public.telegram_bots(vip_channel_id, support_channel_id);