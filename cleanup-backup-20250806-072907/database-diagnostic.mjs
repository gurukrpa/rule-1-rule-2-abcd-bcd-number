import { createClient } from '@supabase/supabase-js';

// Replace with your actual Supabase credentials
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

console.log('🔍 Checking Supabase Database State...');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabaseState() {
    try {
        // Check if table exists
        console.log('\n1️⃣ Checking if number_box_clicks table exists...');
        const { data: tables, error: tableError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_name', 'number_box_clicks');
        
        if (tableError) {
            console.error('❌ Error checking tables:', tableError);
            return;
        }
        
        if (!tables || tables.length === 0) {
            console.log('❌ TABLE NOT FOUND: number_box_clicks table does not exist!');
            console.log('\n🚨 THIS IS THE PROBLEM! You need to create the table in Supabase.');
            console.log('\n📋 SOLUTION:');
            console.log('1. Go to Supabase Dashboard → SQL Editor');
            console.log('2. Copy and paste the content from CREATE-TABLE-CLEAN.sql');
            console.log('3. Run the SQL script to create the table');
            return;
        }
        
        console.log('✅ Table exists!');
        
        // Check table structure
        console.log('\n2️⃣ Checking table structure...');
        const { data: columns, error: columnsError } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable')
            .eq('table_name', 'number_box_clicks');
            
        if (columnsError) {
            console.error('❌ Error checking columns:', columnsError);
        } else {
            console.log('📋 Table columns:', columns);
        }
        
        // Check if there's any data
        console.log('\n3️⃣ Checking existing data...');
        const { data: existingData, error: dataError } = await supabase
            .from('number_box_clicks')
            .select('*')
            .limit(5);
            
        if (dataError) {
            console.error('❌ Error querying data:', dataError);
        } else {
            console.log(`📊 Found ${existingData?.length || 0} existing records`);
            if (existingData && existingData.length > 0) {
                console.log('Sample records:', existingData);
            }
        }
        
        // Test insert (if table exists)
        console.log('\n4️⃣ Testing insert capability...');
        const testRecord = {
            id: 'test_user_test_set_2025-08-03_1_1',
            user_id: 'test_user',
            set_name: 'test_set',
            date_key: '2025-08-03',
            number_value: 1,
            hr_number: 1,
            is_clicked: true,
            is_present: false
        };
        
        const { data: insertData, error: insertError } = await supabase
            .from('number_box_clicks')
            .insert(testRecord)
            .select();
            
        if (insertError) {
            console.error('❌ Insert test failed:', insertError);
        } else {
            console.log('✅ Insert test successful:', insertData);
            
            // Clean up test record
            await supabase
                .from('number_box_clicks')
                .delete()
                .eq('id', testRecord.id);
            console.log('🧹 Test record cleaned up');
        }
        
    } catch (error) {
        console.error('💥 Unexpected error:', error);
    }
}

checkDatabaseState();
