#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  console.log('Finding all available tables in the database...\n');
  
  try {
    // List all tables
    const { data, error } = await supabase
      .rpc('list_tables_with_schemas', {});
    
    if (error) {
      console.log('RPC call failed, trying alternative method...');
      
      // Try to get table info from information schema (this might fail due to permissions)
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
      
      if (tablesError) {
        console.log('Information schema query failed, checking known table names...');
        
        // Try some common table names
        const commonTables = ['number_box_clicks', 'abcd_bcd_data', 'analysis_results', 'users', 'click_tracking'];
        
        for (const tableName of commonTables) {
          try {
            const { data, error } = await supabase
              .from(tableName)
              .select('*')
              .limit(1);
            
            if (!error) {
              console.log(`✅ Table exists: ${tableName}`);
              if (data && data.length > 0) {
                console.log(`   📋 Columns: ${Object.keys(data[0]).join(', ')}`);
              }
            }
          } catch (e) {
            // Table doesn't exist, skip
          }
        }
      } else {
        console.log('Available tables:');
        tables.forEach(table => console.log(`   - ${table.table_name}`));
      }
    } else {
      console.log('Tables:', data);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listTables();
