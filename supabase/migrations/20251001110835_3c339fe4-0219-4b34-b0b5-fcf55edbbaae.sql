-- Create table for scheduled messages
CREATE TABLE IF NOT EXISTS public.scheduled_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID NOT NULL REFERENCES public.telegram_bots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message_text TEXT NOT NULL,
  delay_minutes INTEGER NOT NULL,
  media_url TEXT,
  media_type TEXT,
  button_text TEXT,
  button_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scheduled_messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage their scheduled messages"
ON public.scheduled_messages
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create table for tracking user interactions
CREATE TABLE IF NOT EXISTS public.user_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID NOT NULL REFERENCES public.telegram_bots(id) ON DELETE CASCADE,
  chat_id BIGINT NOT NULL,
  telegram_user_id BIGINT NOT NULL,
  last_start_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(bot_id, chat_id, telegram_user_id)
);

-- Enable RLS
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;

-- Policy for service role to manage interactions
CREATE POLICY "Service role can manage user interactions"
ON public.user_interactions
FOR ALL
USING (true)
WITH CHECK (true);

-- Policy for bot owners to view interactions
CREATE POLICY "Bot owners can view interactions"
ON public.user_interactions
FOR SELECT
USING (
  bot_id IN (
    SELECT id FROM public.telegram_bots WHERE user_id = auth.uid()
  )
);

-- Create table for scheduled message queue
CREATE TABLE IF NOT EXISTS public.message_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID NOT NULL REFERENCES public.telegram_bots(id) ON DELETE CASCADE,
  scheduled_message_id UUID NOT NULL REFERENCES public.scheduled_messages(id) ON DELETE CASCADE,
  chat_id BIGINT NOT NULL,
  telegram_user_id BIGINT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.message_queue ENABLE ROW LEVEL SECURITY;

-- Policy for service role
CREATE POLICY "Service role can manage message queue"
ON public.message_queue
FOR ALL
USING (true)
WITH CHECK (true);

-- Policy for bot owners to view queue
CREATE POLICY "Bot owners can view message queue"
ON public.message_queue
FOR SELECT
USING (
  bot_id IN (
    SELECT id FROM public.telegram_bots WHERE user_id = auth.uid()
  )
);

-- Indexes
CREATE INDEX idx_scheduled_messages_bot_id ON public.scheduled_messages(bot_id);
CREATE INDEX idx_user_interactions_bot_chat ON public.user_interactions(bot_id, chat_id);
CREATE INDEX idx_message_queue_scheduled_for ON public.message_queue(scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_message_queue_status ON public.message_queue(status);

-- Trigger for updated_at
CREATE TRIGGER update_scheduled_messages_updated_at
BEFORE UPDATE ON public.scheduled_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_interactions_updated_at
BEFORE UPDATE ON public.user_interactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();