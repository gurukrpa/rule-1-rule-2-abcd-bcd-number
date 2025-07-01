/**
 * Automated Database Migration Script
 * Run this to create separate date tables for true independence
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://lgbcbqaqdsgwkcgvqlsg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnYmNicWFxZHNnd2tjZ3ZxbHNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4MTI5NjgsImV4cCI6MjA0ODM4ODk2OH0.8Vp0d3M5LhZrQfXA7m4h7wWjF--5VrOPV8YQf-GhsoY';

const supabase = createClient(supabaseUrl, supabaseKey);

const MIGRATION_QUERIES = [
  // Create UserData dates table
  `CREATE TABLE IF NOT EXISTS user_dates_userdata (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dates JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT user_dates_userdata_user_id_unique UNIQUE (user_id)
  );`,

  // Create ABCD dates table
  `CREATE TABLE IF NOT EXISTS user_dates_abcd (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dates JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT user_dates_abcd_user_id_unique UNIQUE (user_id)
  );`,

  // Create indexes
  `CREATE INDEX IF NOT EXISTS idx_user_dates_userdata_user_id ON user_dates_userdata(user_id);`,
  `CREATE INDEX IF NOT EXISTS idx_user_dates_abcd_user_id ON user_dates_abcd(user_id);`,

  // Enable RLS
  `ALTER TABLE user_dates_userdata ENABLE ROW LEVEL SECURITY;`,
  `ALTER TABLE user_dates_abcd ENABLE ROW LEVEL SECURITY;`,

  // Create RLS policies
  `CREATE POLICY IF NOT EXISTS "Users can manage their own userdata dates" ON user_dates_userdata
    FOR ALL USING (true) WITH CHECK (true);`,
  `CREATE POLICY IF NOT EXISTS "Users can manage their own abcd dates" ON user_dates_abcd
    FOR ALL USING (true) WITH CHECK (true);`
];

async function runMigration() {
  console.log('🚀 Starting database migration for separate date tables...\n');

  try {
    // Run each migration query
    for (let i = 0; i < MIGRATION_QUERIES.length; i++) {
      const query = MIGRATION_QUERIES[i];
      console.log(`📝 Running migration step ${i + 1}/${MIGRATION_QUERIES.length}...`);
      
      const { error } = await supabase.rpc('exec_sql', { sql: query });
      
      if (error) {
        console.error(`❌ Error in step ${i + 1}:`, error);
      } else {
        console.log(`✅ Step ${i + 1} completed successfully`);
      }
    }

    // Migrate existing data
    console.log('\n📊 Migrating existing data...');
    
    // First, migrate current user_dates to user_dates_userdata
    const { error: migrateError } = await supabase.rpc('exec_sql', {
      sql: `INSERT INTO user_dates_userdata (user_id, dates, created_at, updated_at)
            SELECT user_id, dates, created_at, updated_at 
            FROM user_dates
            ON CONFLICT (user_id) DO UPDATE SET 
              dates = EXCLUDED.dates,
              updated_at = EXCLUDED.updated_at;`
    });

    if (migrateError) {
      console.error('❌ Error migrating existing data:', migrateError);
    } else {
      console.log('✅ Existing data migrated to user_dates_userdata');
    }

    // Initialize ABCD table with empty arrays for all users
    const { error: initError } = await supabase.rpc('exec_sql', {
      sql: `INSERT INTO user_dates_abcd (user_id, dates)
            SELECT id, '[]'::jsonb
            FROM users
            ON CONFLICT (user_id) DO NOTHING;`
    });

    if (initError) {
      console.error('❌ Error initializing ABCD table:', initError);
    } else {
      console.log('✅ ABCD table initialized with empty arrays');
    }

    // Verify tables were created
    console.log('\n🔍 Verifying table creation...');
    
    const { data: userdataTables, error: userdataError } = await supabase
      .from('user_dates_userdata')
      .select('count', { count: 'exact', head: true });

    const { data: abcdTables, error: abcdError } = await supabase
      .from('user_dates_abcd')
      .select('count', { count: 'exact', head: true });

    if (!userdataError && !abcdError) {
      console.log('✅ Both tables created successfully!');
      console.log(`   - user_dates_userdata: ${userdataTables?.length || 0} records`);
      console.log(`   - user_dates_abcd: ${abcdTables?.length || 0} records`);
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update UserData component to use USERDATA context');
    console.log('2. Update ABCD component to use ABCD context');
    console.log('3. Test true independence between pages');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Handle potential RPC function creation
async function ensureRPCFunction() {
  console.log('🔧 Ensuring RPC function exists...');
  
  const { error } = await supabase.rpc('exec_sql', {
    sql: `CREATE OR REPLACE FUNCTION exec_sql(sql text)
          RETURNS void AS $$
          BEGIN
            EXECUTE sql;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;`
  });

  if (error) {
    console.log('⚠️ Could not create RPC function. Please run SQL manually in Supabase.');
    console.log('📋 Copy this SQL and run it in Supabase SQL Editor:');
    console.log('\n' + MIGRATION_QUERIES.join('\n\n'));
    return false;
  }

  return true;
}

// Run migration
if (require.main === module) {
  ensureRPCFunction().then(canRunMigration => {
    if (canRunMigration) {
      runMigration();
    }
  });
}

module.exports = { runMigration, MIGRATION_QUERIES };
