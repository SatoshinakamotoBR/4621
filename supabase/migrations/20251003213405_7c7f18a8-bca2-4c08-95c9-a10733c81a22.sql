-- Create table to link scheduled messages with plans and discounts
CREATE TABLE IF NOT EXISTS public.scheduled_message_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scheduled_message_id UUID NOT NULL REFERENCES public.scheduled_messages(id) ON DELETE CASCADE,
  bot_plan_id UUID NOT NULL REFERENCES public.bot_plans(id) ON DELETE CASCADE,
  discount_percentage INTEGER DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(scheduled_message_id, bot_plan_id)
);

-- Enable RLS
ALTER TABLE public.scheduled_message_plans ENABLE ROW LEVEL SECURITY;

-- Users can view their scheduled message plans
CREATE POLICY "Users can view their scheduled message plans"
ON public.scheduled_message_plans
FOR SELECT
USING (
  scheduled_message_id IN (
    SELECT id FROM public.scheduled_messages WHERE user_id = auth.uid()
  )
);

-- Users can insert their scheduled message plans
CREATE POLICY "Users can insert their scheduled message plans"
ON public.scheduled_message_plans
FOR INSERT
WITH CHECK (
  scheduled_message_id IN (
    SELECT id FROM public.scheduled_messages WHERE user_id = auth.uid()
  )
);

-- Users can delete their scheduled message plans
CREATE POLICY "Users can delete their scheduled message plans"
ON public.scheduled_message_plans
FOR DELETE
USING (
  scheduled_message_id IN (
    SELECT id FROM public.scheduled_messages WHERE user_id = auth.uid()
  )
);

-- Create index for performance
CREATE INDEX idx_scheduled_message_plans_scheduled_message_id ON public.scheduled_message_plans(scheduled_message_id);
CREATE INDEX idx_scheduled_message_plans_bot_plan_id ON public.scheduled_message_plans(bot_plan_id);