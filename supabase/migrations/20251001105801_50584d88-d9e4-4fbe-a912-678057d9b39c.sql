-- Create table for received messages
CREATE TABLE IF NOT EXISTS public.received_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID NOT NULL REFERENCES public.telegram_bots(id) ON DELETE CASCADE,
  chat_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  username TEXT,
  first_name TEXT,
  message_text TEXT,
  message_type TEXT DEFAULT 'text',
  telegram_message_id BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.received_messages ENABLE ROW LEVEL SECURITY;

-- Policy to allow bot owners to view messages
CREATE POLICY "Bot owners can view received messages"
ON public.received_messages
FOR SELECT
USING (
  bot_id IN (
    SELECT id FROM public.telegram_bots WHERE user_id = auth.uid()
  )
);

-- Policy to allow webhook to insert messages
CREATE POLICY "Service role can insert received messages"
ON public.received_messages
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_received_messages_bot_id ON public.received_messages(bot_id);
CREATE INDEX idx_received_messages_chat_id ON public.received_messages(chat_id);
CREATE INDEX idx_received_messages_created_at ON public.received_messages(created_at DESC);