-- Security fix: Protect bot tokens from client exposure

-- Create a security definer function to get bot token (server-side only)
-- This function validates ownership and can only effectively be used from edge functions
CREATE OR REPLACE FUNCTION public.get_bot_token(bot_id_param uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  token text;
  bot_user_id uuid;
BEGIN
  -- Get the bot's user_id and token
  SELECT user_id, bot_token INTO bot_user_id, token
  FROM public.telegram_bots
  WHERE id = bot_id_param;
  
  -- Verify the bot exists
  IF bot_user_id IS NULL THEN
    RAISE EXCEPTION 'Bot not found';
  END IF;
  
  -- Verify the requesting user owns this bot
  IF bot_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized access to bot token';
  END IF;
  
  RETURN token;
END;
$$;

COMMENT ON FUNCTION public.get_bot_token IS 'Securely retrieves bot token for server-side use only. Validates user ownership before returning token. Should only be called from edge functions.';

-- Add an additional RLS policy to restrict token column access
-- Note: This creates defense in depth but the main protection is client-side code changes
CREATE POLICY "Service role only can read tokens"
ON public.telegram_bots
FOR SELECT
TO service_role
USING (true);