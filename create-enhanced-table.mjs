// create-enhanced-table.mjs
// Script to create the enhanced rule2_analysis_results table

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read environment variables
const envContent = readFileSync('.env', 'utf8');
const envLines = envContent.split('\n');
let supabaseUrl, supabaseKey;

envLines.forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) {
    supabaseUrl = line.split('=')[1];
  } else if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
    supabaseKey = line.split('=')[1];
  }
});

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Could not find Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createEnhancedTable() {
  console.log('🔍 Checking if enhanced table exists...');
  
  // Test if rule2_analysis_results table exists
  const { error: testError } = await supabase
    .from('rule2_analysis_results')
    .select('count', { count: 'exact', head: true });

  if (testError) {
    if (testError.message.includes('relation') && testError.message.includes('does not exist')) {
      console.log('❌ Enhanced table rule2_analysis_results does NOT exist');
      console.log('🔧 Creating enhanced table...');
      
      // Read SQL script
      const sqlScript = readFileSync('CREATE-RULE2-ANALYSIS-RESULTS-TABLE.sql', 'utf8');
      
      // Execute SQL script (note: this requires database admin privileges)
      console.log('⚠️  Note: Creating the table requires admin privileges.');
      console.log('📋 Please run this SQL script in your Supabase Dashboard > SQL Editor:');
      console.log('');
      console.log('=' * 80);
      console.log(sqlScript);
      console.log('=' * 80);
      console.log('');
      console.log('🎯 After running the SQL script, restart the application to resolve the database connection error.');
      
    } else {
      console.log('❌ Other database error:', testError.message);
    }
  } else {
    console.log('✅ Enhanced table already exists!');
  }
}

createEnhancedTable().catch(console.error);
