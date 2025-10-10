/*
  # Add media_registry channel type

  1. Changes
    - Add 'media_registry' to channel_type CHECK constraint
    - This allows bots to have a channel for storing media files
    - Media uploaded will be sent to this channel and file_id will be stored

  2. Purpose
    - Use Telegram as CDN and storage for media files
    - Store telegram file_id instead of full URLs
    - More efficient and faster media delivery
*/

DO $$
BEGIN
  -- Drop the existing constraint
  ALTER TABLE bot_channels DROP CONSTRAINT IF EXISTS bot_channels_channel_type_check;

  -- Add new constraint with media_registry
  ALTER TABLE bot_channels ADD CONSTRAINT bot_channels_channel_type_check
    CHECK (channel_type IN ('vip', 'support', 'media_registry'));
END $$;
