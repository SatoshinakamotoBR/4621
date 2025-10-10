-- Create bot_messages table for storing bot automation messages
CREATE TABLE public.bot_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID NOT NULL REFERENCES public.telegram_bots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('welcome', 'thank_you', 'expiration', 'upsell', 'downsell')),
  message_text TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video', 'audio')),
  button_text TEXT,
  button_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bot_plans table for subscription plans
CREATE TABLE public.bot_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID NOT NULL REFERENCES public.telegram_bots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  plan_name TEXT NOT NULL,
  plan_description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration_days INTEGER NOT NULL,
  payment_link TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bot_automation_config table for automation settings
CREATE TABLE public.bot_automation_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID NOT NULL REFERENCES public.telegram_bots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  send_welcome BOOLEAN DEFAULT true,
  send_thank_you BOOLEAN DEFAULT true,
  send_expiration_reminder BOOLEAN DEFAULT true,
  expiration_reminder_days INTEGER DEFAULT 3,
  auto_remove_expired BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(bot_id)
);

-- Enable RLS on bot_messages
ALTER TABLE public.bot_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bot messages"
  ON public.bot_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bot messages"
  ON public.bot_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bot messages"
  ON public.bot_messages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bot messages"
  ON public.bot_messages FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on bot_plans
ALTER TABLE public.bot_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bot plans"
  ON public.bot_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bot plans"
  ON public.bot_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bot plans"
  ON public.bot_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bot plans"
  ON public.bot_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on bot_automation_config
ALTER TABLE public.bot_automation_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bot automation config"
  ON public.bot_automation_config FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bot automation config"
  ON public.bot_automation_config FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bot automation config"
  ON public.bot_automation_config FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bot automation config"
  ON public.bot_automation_config FOR DELETE
  USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_bot_messages_updated_at
  BEFORE UPDATE ON public.bot_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bot_plans_updated_at
  BEFORE UPDATE ON public.bot_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bot_automation_config_updated_at
  BEFORE UPDATE ON public.bot_automation_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();