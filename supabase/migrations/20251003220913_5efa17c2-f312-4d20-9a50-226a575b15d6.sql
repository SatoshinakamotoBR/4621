-- Add PushinPay columns to users table (via telegram_bots since we're using that)
ALTER TABLE telegram_bots 
ADD COLUMN IF NOT EXISTS pushinpay_token TEXT,
ADD COLUMN IF NOT EXISTS pushinpay_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pushinpay_token_preview TEXT,
ADD COLUMN IF NOT EXISTS pushinpay_updated_at TIMESTAMP WITH TIME ZONE;

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bot_id UUID REFERENCES telegram_bots(id) ON DELETE SET NULL,
  pushinpay_id TEXT UNIQUE,
  value INTEGER NOT NULL,
  platform_fee INTEGER NOT NULL DEFAULT 100,
  user_value INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'paid', 'expired', 'cancelled')),
  qr_code TEXT,
  qr_code_base64 TEXT,
  payer_name TEXT,
  payer_cpf TEXT,
  description TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions"
  ON public.transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
  ON public.transactions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role can update transactions (for webhook)
CREATE POLICY "Service role can update transactions"
  ON public.transactions
  FOR UPDATE
  USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_pushinpay_id ON public.transactions(pushinpay_id);

-- Trigger to update updated_at
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();