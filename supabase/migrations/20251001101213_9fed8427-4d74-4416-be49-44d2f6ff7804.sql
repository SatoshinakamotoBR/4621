-- Fix RLS policies for telegram_bots table to ensure proper access

-- Drop existing problematic service role policy
DROP POLICY IF EXISTS "Service role only can read tokens" ON public.telegram_bots;

-- Recreate user access policies to ensure they work correctly
DROP POLICY IF EXISTS "Users can view their own bots" ON public.telegram_bots;
DROP POLICY IF EXISTS "Users can create their own bots" ON public.telegram_bots;
DROP POLICY IF EXISTS "Users can update their own bots" ON public.telegram_bots;
DROP POLICY IF EXISTS "Users can delete their own bots" ON public.telegram_bots;

-- Create comprehensive RLS policies for telegram_bots
CREATE POLICY "Users can view their own bots"
  ON public.telegram_bots FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bots"
  ON public.telegram_bots FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bots"
  ON public.telegram_bots FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bots"
  ON public.telegram_bots FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create a service role policy that allows reading only the bot_token column for backend operations
CREATE POLICY "Service role can read bot tokens"
  ON public.telegram_bots FOR SELECT
  TO service_role
  USING (true);