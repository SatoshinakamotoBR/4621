-- Remover a constraint antiga de media_type
ALTER TABLE public.bot_messages DROP CONSTRAINT IF EXISTS bot_messages_media_type_check;

-- Adicionar nova constraint que inclui 'photo' e 'video'
ALTER TABLE public.bot_messages ADD CONSTRAINT bot_messages_media_type_check 
  CHECK (media_type IS NULL OR media_type IN ('photo', 'video', 'document'));