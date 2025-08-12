// Quick script to create the number_box_clicks table
import { supabase } from './src/supabaseClient.js';
import fs from 'fs';

async function createTable() {
  try {
    console.log('🏗️ Creating number_box_clicks table...');
    
    // Read the SQL file
    const sqlContent = fs.readFileSync('./CREATE-NUMBER-BOX-CLICKS-TABLE.sql', 'utf8');
    
    // Split SQL statements (simple approach)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--') && stmt !== '');
    
    console.log(`📋 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.toLowerCase().includes('create table') || 
          statement.toLowerCase().includes('drop table') ||
          statement.toLowerCase().includes('create index') ||
          statement.toLowerCase().includes('alter table') ||
          statement.toLowerCase().includes('create policy') ||
          statement.toLowerCase().includes('create or replace function') ||
          statement.toLowerCase().includes('create trigger') ||
          statement.toLowerCase().includes('comment on')) {
        
        console.log(`⚡ Executing statement ${i + 1}:`, statement.substring(0, 50) + '...');
        
        const { data, error } = await supabase.rpc('exec_sql', { sql_statement: statement });
        
        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error);
          // Continue with other statements
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      }
    }

    // Test table access
    console.log('🧪 Testing table access...');
    const { data, error } = await supabase
      .from('number_box_clicks')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Table access test failed:', error);
    } else {
      console.log('✅ Table access test successful!');
    }

  } catch (error) {
    console.error('❌ Error creating table:', error);
  }
}

createTable();
