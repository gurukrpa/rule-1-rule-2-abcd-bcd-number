// Run this in browser console to create the topic_clicks table
// This will use the existing supabase client to create the table

async function createTopicClicksTable() {
  const { supabase } = window;
  
  if (!supabase) {
    console.error('❌ Supabase client not found. Make sure you are on the application page.');
    return;
  }

  console.log('🔨 Creating topic_clicks table...');

  try {
    // Create the table using raw SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS topic_clicks (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          topic_name TEXT NOT NULL,
          date_key TEXT NOT NULL,
          hour TEXT NOT NULL,
          clicked_number INTEGER NOT NULL,
          is_matched BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, topic_name, date_key, hour, clicked_number)
        );

        CREATE INDEX IF NOT EXISTS idx_topic_clicks_user_topic ON topic_clicks(user_id, topic_name);
        CREATE INDEX IF NOT EXISTS idx_topic_clicks_date ON topic_clicks(date_key);
        CREATE INDEX IF NOT EXISTS idx_topic_clicks_hour ON topic_clicks(hour);
      `
    });

    if (error) {
      console.error('❌ Error creating table:', error);
      
      // Try alternative method using direct SQL execution
      console.log('🔄 Trying alternative method...');
      
      const { data: data2, error: error2 } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', 'topic_clicks');
        
      if (error2) {
        console.error('❌ Cannot check if table exists:', error2);
        return;
      }
      
      if (data2 && data2.length > 0) {
        console.log('✅ Table topic_clicks already exists');
        return;
      }
      
      console.log('⚠️ Table does not exist, but RPC failed. Please create it manually in Supabase dashboard.');
      console.log('📝 SQL to run:');
      console.log(`
CREATE TABLE IF NOT EXISTS topic_clicks (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  topic_name TEXT NOT NULL,
  date_key TEXT NOT NULL,
  hour TEXT NOT NULL,
  clicked_number INTEGER NOT NULL,
  is_matched BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, topic_name, date_key, hour, clicked_number)
);

CREATE INDEX IF NOT EXISTS idx_topic_clicks_user_topic ON topic_clicks(user_id, topic_name);
CREATE INDEX IF NOT EXISTS idx_topic_clicks_date ON topic_clicks(date_key);
CREATE INDEX IF NOT EXISTS idx_topic_clicks_hour ON topic_clicks(hour);
      `);
      return;
    }

    console.log('✅ topic_clicks table created successfully!');
    
  } catch (err) {
    console.error('❌ Exception:', err);
  }
}

// Test the database connection first
async function testConnection() {
  const { supabase } = window;
  
  if (!supabase) {
    console.error('❌ Supabase client not found');
    return false;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Database connection test failed:', error);
      return false;
    }

    console.log('✅ Database connection is working');
    return true;
  } catch (err) {
    console.error('❌ Connection test exception:', err);
    return false;
  }
}

// Run the script
console.log('🚀 Starting database setup...');
testConnection().then(connected => {
  if (connected) {
    createTopicClicksTable();
  }
});
