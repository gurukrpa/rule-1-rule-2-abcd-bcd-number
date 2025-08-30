#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('Checking hour_entries table structure...\n');
  
  try {
    // Get a sample record to see the actual structure
    const { data, error } = await supabase
      .from('hour_entries')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('Sample hour_entries record structure:');
      console.log('Columns:', Object.keys(data[0]));
      console.log('\nFull sample record:');
      console.log(JSON.stringify(data[0], null, 2));
    } else {
      console.log('No records found in hour_entries table');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkSchema();
