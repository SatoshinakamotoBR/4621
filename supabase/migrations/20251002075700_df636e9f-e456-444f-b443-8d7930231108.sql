-- Create storage bucket for user uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('bot-uploads', 'bot-uploads', false);

-- Storage policies for bot uploads
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'bot-uploads' AND auth.uid() = (storage.foldername(name))[1]::uuid);

CREATE POLICY "Users can view their own uploads"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'bot-uploads' AND auth.uid() = (storage.foldername(name))[1]::uuid);

CREATE POLICY "Service role can manage all uploads"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'bot-uploads')
WITH CHECK (bucket_id = 'bot-uploads');

-- Table for bot channel configuration
CREATE TABLE public.bot_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID NOT NULL REFERENCES telegram_bots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  channel_type TEXT NOT NULL CHECK (channel_type IN ('vip', 'support')),
  channel_id TEXT NOT NULL,
  channel_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(bot_id, channel_type)
);

ALTER TABLE public.bot_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their bot channels"
ON public.bot_channels FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Table for payment webhooks
CREATE TABLE public.payment_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID NOT NULL REFERENCES telegram_bots(id) ON DELETE CASCADE,
  telegram_user_id BIGINT NOT NULL,
  plan_id UUID REFERENCES bot_plans(id) ON DELETE SET NULL,
  payment_status TEXT NOT NULL,
  payment_data JSONB,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage webhooks"
ON public.payment_webhooks FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Bot owners can view their webhooks"
ON public.payment_webhooks FOR SELECT
TO authenticated
USING (bot_id IN (
  SELECT id FROM telegram_bots WHERE user_id = auth.uid()
));

-- Table for user uploads tracking
CREATE TABLE public.user_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID NOT NULL REFERENCES telegram_bots(id) ON DELETE CASCADE,
  telegram_user_id BIGINT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  sent_to_support BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage uploads"
ON public.user_uploads FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Bot owners can view uploads"
ON public.user_uploads FOR SELECT
TO authenticated
USING (bot_id IN (
  SELECT id FROM telegram_bots WHERE user_id = auth.uid()
));

-- Trigger for updating updated_at
CREATE TRIGGER update_bot_channels_updated_at
BEFORE UPDATE ON public.bot_channels
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();