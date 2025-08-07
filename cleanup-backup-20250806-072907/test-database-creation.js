// Test script to create the number_box_clicks table in Supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createNumberBoxClicksTable() {
  try {
    console.log('🔄 Creating number_box_clicks table...');
    
    // Read the SQL file
    const sql = fs.readFileSync('CREATE-NUMBER-BOX-CLICKS-TABLE.sql', 'utf8');
    
    // Execute the SQL using the rpc function (since raw SQL execution needs proper permissions)
    // Instead, we'll use the table creation directly via the client
    
    // Test if table already exists by trying to query it
    const { data: existingData, error: existingError } = await supabase
      .from('number_box_clicks')
      .select('count')
      .limit(1);

    if (!existingError) {
      console.log('✅ Table number_box_clicks already exists');
      return true;
    }
    
    if (existingError.code === '42P01') {
      console.log('⚠️ Table does not exist. Please create it manually in Supabase Dashboard.');
      console.log('📋 Copy and paste the SQL from CREATE-NUMBER-BOX-CLICKS-TABLE.sql');
      console.log('🔗 Go to: https://app.supabase.com/project/zndkprjytuhzufdqhnmt/sql');
      return false;
    }
    
    throw existingError;
    
  } catch (error) {
    console.error('❌ Error creating table:', error);
    return false;
  }
}

async function testTableCreation() {
  console.log('🚀 Testing Supabase connection and table creation...');
  
  // Test connection
  const { data, error } = await supabase
    .from('users')
    .select('count')
    .limit(1);
    
  if (error) {
    console.error('❌ Supabase connection failed:', error);
    return;
  }
  
  console.log('✅ Supabase connection successful');
  
  // Try to create the table
  const tableCreated = await createNumberBoxClicksTable();
  
  if (tableCreated) {
    console.log('🎉 Ready to test number box clicks persistence!');
  } else {
    console.log('⚠️ Manual table creation required.');
  }
}

testTableCreation();
