// Quick fix script to add missing columns
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oqbusqbsmvwkwhggzvhl.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xYnVzcWJzbXZ3a3doZ2d6dmhsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDcyMzEyNiwiZXhwIjoyMDcwMjk5MTI2fQ.7OkSZLUnDH9IXkYzGfWN02N3cNzqEV5bHGBHNgtZuGY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixSchema() {
    console.log('🔧 Adding missing hr and days columns...');
    
    try {
        // Try to add hr column
        console.log('Adding hr column...');
        const { data: hrResult, error: hrError } = await supabase.rpc('sql', {
            query: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS hr INTEGER DEFAULT 0;'
        });
        
        if (hrError) {
            console.error('❌ Error adding hr column:', hrError);
        } else {
            console.log('✅ hr column added successfully');
        }
        
        // Try to add days column
        console.log('Adding days column...');
        const { data: daysResult, error: daysError } = await supabase.rpc('sql', {
            query: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS days INTEGER DEFAULT 0;'
        });
        
        if (daysError) {
            console.error('❌ Error adding days column:', daysError);
        } else {
            console.log('✅ days column added successfully');
        }
        
        // Test the fix
        console.log('🧪 Testing the fix...');
        const { data: testUser, error: testError } = await supabase
            .from('users')
            .insert([{
                username: 'test_fix_' + Date.now(),
                hr: 100,
                days: 30
            }])
            .select();
        
        if (testError) {
            console.error('❌ Test failed:', testError);
        } else {
            console.log('✅ Test successful! User created:', testUser);
            
            // Clean up test user
            if (testUser && testUser[0]) {
                await supabase.from('users').delete().eq('id', testUser[0].id);
                console.log('🧹 Test user cleaned up');
            }
        }
        
    } catch (error) {
        console.error('💥 Unexpected error:', error);
    }
}

fixSchema().then(() => {
    console.log('🎉 Schema fix complete!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Fix failed:', error);
    process.exit(1);
});
