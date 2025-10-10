-- Create telegram_bots table
CREATE TABLE public.telegram_bots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  bot_name TEXT NOT NULL,
  bot_token TEXT NOT NULL,
  bot_username TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.telegram_bots ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own bots" 
ON public.telegram_bots 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bots" 
ON public.telegram_bots 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bots" 
ON public.telegram_bots 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bots" 
ON public.telegram_bots 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create auto_posts table
CREATE TABLE public.auto_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  bot_id UUID NOT NULL REFERENCES public.telegram_bots(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for auto_posts
ALTER TABLE public.auto_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for auto_posts
CREATE POLICY "Users can view their own posts" 
ON public.auto_posts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own posts" 
ON public.auto_posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
ON public.auto_posts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
ON public.auto_posts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for telegram_bots
CREATE TRIGGER update_telegram_bots_updated_at
BEFORE UPDATE ON public.telegram_bots
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();