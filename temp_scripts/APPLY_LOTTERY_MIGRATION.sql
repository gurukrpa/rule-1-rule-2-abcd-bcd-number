-- MANUAL MIGRATION: Apply lottery columns to users table
-- Please copy and paste this SQL into your Supabase SQL Editor
-- Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

BEGIN;

-- Add lottery configuration columns to users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS lottery_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS lottery_country text,
  ADD COLUMN IF NOT EXISTS lottery_game_code text;

-- Add constraint to ensure lottery_game_code is set when lottery is enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_lottery_ck'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_lottery_ck
      CHECK (lottery_enabled = false OR lottery_game_code IS NOT NULL);
  END IF;
END$$;

-- Add index for efficient querying of lottery-enabled users
CREATE INDEX IF NOT EXISTS idx_users_lottery_enabled_game
ON public.users(lottery_enabled, lottery_game_code)
WHERE lottery_enabled = true;

-- Verify the migration
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
  AND column_name LIKE 'lottery%'
ORDER BY column_name;

COMMIT;

-- Expected output should show:
-- lottery_country     | text    | YES | (null)
-- lottery_enabled     | boolean | NO  | false
-- lottery_game_code   | text    | YES | (null)
