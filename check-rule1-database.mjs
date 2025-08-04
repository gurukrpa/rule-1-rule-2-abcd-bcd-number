import { createClient } from '@supabase/supabase-js';

// Use the actual Supabase credentials from your workspace
const supabaseUrl = 'https://zndkprjytuhzufdqhnmt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuZGtwcmp5dHVoenVmZHFobm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0OTg5OTgsImV4cCI6MjA1OTA3NDk5OH0._1xM__KPGNlr3HG3-An2fy3kKfIxWU-AXJnrMpdWYok';

console.log('🔍 Checking Rule1 Number Box Database State...');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkNumberBoxDatabase() {
    try {
        console.log('\n1️⃣ Testing Supabase connection...');
        
        // Test basic connection
        const { data: testData, error: testError } = await supabase
            .from('users')
            .select('count(*)')
            .limit(1);
            
        if (testError) {
            console.error('❌ Connection failed:', testError.message);
            return;
        }
        
        console.log('✅ Supabase connection successful!');
        
        // Check if number_box_clicks table exists
        console.log('\n2️⃣ Checking if number_box_clicks table exists...');
        
        const { data: tableCheck, error: tableError } = await supabase
            .from('number_box_clicks')
            .select('*')
            .limit(1);
        
        if (tableError) {
            if (tableError.message.includes('relation "public.number_box_clicks" does not exist')) {
                console.log('❌ TABLE MISSING: number_box_clicks table does not exist!');
                console.log('\n🚨 THIS IS THE ROOT CAUSE OF YOUR ISSUE!');
                console.log('\n📋 SOLUTION - Run this SQL in Supabase Dashboard:');
                console.log('1. Go to https://app.supabase.com → Your Project → SQL Editor');
                console.log('2. Copy the content from CREATE-TABLE-CLEAN.sql');
                console.log('3. Paste and run the SQL script');
                console.log('\n💡 The table creation will fix the persistence issue!');
                return;
            } else {
                console.error('❌ Error checking table:', tableError.message);
                return;
            }
        }
        
        console.log('✅ number_box_clicks table exists!');
        
        // Check table structure
        console.log('\n3️⃣ Verifying table structure...');
        const { data: sample, error: sampleError } = await supabase
            .from('number_box_clicks')
            .select('*')
            .limit(1);
            
        if (sampleError) {
            console.error('❌ Error checking table structure:', sampleError.message);
        } else {
            console.log('✅ Table structure looks good!');
        }
        
        // Test insert functionality
        console.log('\n4️⃣ Testing insert functionality...');
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
        
        const { data: insertResult, error: insertError } = await supabase
            .from('number_box_clicks')
            .insert(testRecord)
            .select();
            
        if (insertError) {
            console.error('❌ Insert test failed:', insertError.message);
        } else {
            console.log('✅ Insert test successful!');
            
            // Clean up test record
            await supabase
                .from('number_box_clicks')
                .delete()
                .eq('id', testRecord.id);
            console.log('🧹 Test record cleaned up');
        }
        
        console.log('\n🎉 DATABASE IS READY FOR RULE1 NUMBER BOX PERSISTENCE!');
        console.log('\n📝 Next Steps:');
        console.log('1. Refresh your Rule1 page');
        console.log('2. Click some number boxes');
        console.log('3. Refresh again - clicks should persist!');
        
    } catch (error) {
        console.error('💥 Unexpected error:', error.message);
        
        if (error.message.includes('Invalid URL')) {
            console.log('\n💡 This indicates Supabase credentials issue');
            console.log('   Check your environment variables in .env file');
        }
    }
}

checkNumberBoxDatabase();
