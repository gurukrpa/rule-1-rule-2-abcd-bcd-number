// Apply lottery fields migration to Supabase database
// This runs the migration SQL directly against the hosted Supabase instance

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zndkprjytuhzufdqhnmt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuZGtwcmp5dHVoenVmZHFobm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0OTg5OTgsImV4cCI6MjA1OTA3NDk5OH0._1xM__KPGNlr3HG3-An2fy3kKfIxWU-AXJnrMpdWYok';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyLotteryMigration() {
  console.log('🚀 Applying lottery fields migration to Supabase...');
  
  try {
    // Check current table structure
    console.log('📋 Checking current users table structure...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'users')
      .eq('table_schema', 'public');
    
    if (columnsError) {
      console.error('❌ Error checking table structure:', columnsError);
      return;
    }
    
    const existingColumns = columns.map(col => col.column_name);
    console.log('📊 Existing columns:', existingColumns);
    
    // Check if lottery columns already exist
    const hasLotteryColumns = existingColumns.includes('lottery_enabled');
    
    if (hasLotteryColumns) {
      console.log('✅ Lottery columns already exist!');
      return;
    }
    
    console.log('⚠️  Lottery columns not found. Manual migration needed.');
    console.log('📝 Please run this SQL in your Supabase SQL editor:');
    console.log(`
-- Add lottery configuration columns to users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS lottery_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS lottery_country text,
  ADD COLUMN IF NOT EXISTS lottery_game_code text;

-- Add constraint to ensure lottery_game_code is set when lottery is enabled
ALTER TABLE public.users
  ADD CONSTRAINT users_lottery_ck
  CHECK (lottery_enabled = false OR lottery_game_code IS NOT NULL);

-- Add index for efficient querying of lottery-enabled users
CREATE INDEX IF NOT EXISTS idx_users_lottery_enabled_game
ON public.users(lottery_enabled, lottery_game_code)
WHERE lottery_enabled = true;
    `);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

applyLotteryMigration();
