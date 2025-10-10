-- Criar tabela de relacionamento entre mensagens e planos
CREATE TABLE public.bot_message_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_message_id UUID NOT NULL,
  bot_plan_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(bot_message_id, bot_plan_id)
);

-- Enable RLS
ALTER TABLE public.bot_message_plans ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their message plans"
ON public.bot_message_plans
FOR SELECT
USING (
  bot_message_id IN (
    SELECT id FROM public.bot_messages WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their message plans"
ON public.bot_message_plans
FOR INSERT
WITH CHECK (
  bot_message_id IN (
    SELECT id FROM public.bot_messages WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their message plans"
ON public.bot_message_plans
FOR DELETE
USING (
  bot_message_id IN (
    SELECT id FROM public.bot_messages WHERE user_id = auth.uid()
  )
);