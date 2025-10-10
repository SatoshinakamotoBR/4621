-- Make bot-uploads bucket public so welcome images can be accessed
UPDATE storage.buckets 
SET public = true 
WHERE id = 'bot-uploads';