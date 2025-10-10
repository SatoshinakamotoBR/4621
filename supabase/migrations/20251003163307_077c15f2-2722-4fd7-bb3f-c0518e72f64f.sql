-- Add unique constraint to bot_token to prevent duplicate bots
ALTER TABLE public.telegram_bots
ADD CONSTRAINT telegram_bots_bot_token_key UNIQUE (bot_token);

-- Create indexes for message_queue performance
CREATE INDEX IF NOT EXISTS idx_message_queue_status ON public.message_queue(status);
CREATE INDEX IF NOT EXISTS idx_message_queue_scheduled_for ON public.message_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_message_queue_bot_id ON public.message_queue(bot_id);

-- Add index for user_interactions lookup
CREATE INDEX IF NOT EXISTS idx_user_interactions_bot_telegram_user ON public.user_interactions(bot_id, telegram_user_id);