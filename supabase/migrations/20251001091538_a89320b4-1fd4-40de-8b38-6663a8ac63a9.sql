-- Fix bot token exposure by restricting column-level access
-- Users should not be able to read the bot_token column directly
-- The get_bot_token() security definer function should be used instead

-- Revoke all privileges from authenticated users on telegram_bots
REVOKE ALL ON public.telegram_bots FROM authenticated;

-- Grant SELECT only on safe columns (excluding bot_token)
GRANT SELECT (id, user_id, bot_name, bot_username, is_active, created_at, updated_at) 
  ON public.telegram_bots TO authenticated;

-- Grant INSERT on all columns (needed for creating bots)
GRANT INSERT ON public.telegram_bots TO authenticated;

-- Grant UPDATE on safe columns only (excluding bot_token)
GRANT UPDATE (bot_name, bot_username, is_active, updated_at) 
  ON public.telegram_bots TO authenticated;

-- Grant DELETE (needed for deleting bots)
GRANT DELETE ON public.telegram_bots TO authenticated;

-- Ensure service_role has full access (for edge functions)
GRANT ALL ON public.telegram_bots TO service_role;