/*
  # Create bot-media storage bucket
  
  1. Storage Bucket
    - `bot-media` bucket for storing bot media files (images, videos)
    - Public bucket with 50MB file size limit
    - Allows JPEG, PNG, GIF, WebP images and MP4, QuickTime, AVI videos
  
  2. Security
    - RLS policies for authenticated users to upload/delete their own files
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'bot-media',
  'bot-media',
  true,
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/x-msvideo']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload their own media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'bot-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own media"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'bot-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own media"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'bot-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Public can view bot-media"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'bot-media');
