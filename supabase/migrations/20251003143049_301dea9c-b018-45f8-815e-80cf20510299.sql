-- Remover a constraint antiga
ALTER TABLE public.bot_channels DROP CONSTRAINT IF EXISTS bot_channels_channel_type_check;

-- Adicionar nova constraint que inclui 'registry'
ALTER TABLE public.bot_channels ADD CONSTRAINT bot_channels_channel_type_check 
  CHECK (channel_type IN ('vip', 'support', 'registry'));