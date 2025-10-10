/*
  # Simplify channel system to VIP and Registry only

  1. Changes
    - Update channel_type CHECK constraint to only allow 'vip' and 'registry'
    - Remove 'support' and 'media_registry' types
    - 'registry' channel will serve as both support and media storage

  2. Purpose
    - Simpler architecture with only 2 channels
    - Registry channel = support notifications + media storage + file checkpoint
*/

DO $$
BEGIN
  -- Drop the existing constraint
  ALTER TABLE bot_channels DROP CONSTRAINT IF EXISTS bot_channels_channel_type_check;

  -- Add new constraint with only vip and registry
  ALTER TABLE bot_channels ADD CONSTRAINT bot_channels_channel_type_check
    CHECK (channel_type IN ('vip', 'registry'));
END $$;
