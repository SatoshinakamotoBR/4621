-- Ensure authenticated role has required table privileges alongside RLS
GRANT SELECT, UPDATE ON TABLE public.telegram_bots TO authenticated;