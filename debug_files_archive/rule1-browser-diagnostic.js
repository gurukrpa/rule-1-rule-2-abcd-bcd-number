// Rule1 Number Box Database Diagnostic
// Copy and paste this entire script into your browser's console (F12) on your Rule1 page

console.log('🔍 Rule1 Number Box Database Diagnostic - Starting...');

// Check if DualServiceManager is loaded
if (typeof window.dualServiceManager !== 'undefined') {
    console.log('✅ DualServiceManager is loaded');
    
    // Try to access the database service
    try {
        const service = window.dualServiceManager.supabaseService;
        if (service && service.supabase) {
            console.log('✅ Supabase service is connected');
            
            // Test the number_box_clicks table
            service.supabase
                .from('number_box_clicks')
                .select('*')
                .limit(1)
                .then(({ data, error }) => {
                    if (error) {
                        if (error.message.includes('relation "public.number_box_clicks" does not exist')) {
                            console.log('❌ FOUND THE PROBLEM: number_box_clicks table does not exist!');
                            console.log('🔧 SOLUTION: Create the table in Supabase SQL Editor');
                            console.log('📋 Use the SQL from: RULE1-DATABASE-FIX-GUIDE.html');
                            console.log('🌐 Open: file:///Volumes/t7%20sharma/vs%20coad/rule-1-rule-2-abcd-bcd-number-main/RULE1-DATABASE-FIX-GUIDE.html');
                        } else {
                            console.log('❌ Database error:', error.message);
                        }
                    } else {
                        console.log('✅ number_box_clicks table exists!');
                        console.log('📊 Sample data:', data);
                        
                        // If table exists, test clicking functionality
                        console.log('🧪 Testing click persistence...');
                        
                        // Test record
                        const testId = 'test_user_test_set_2025-08-03_1_1';
                        service.supabase
                            .from('number_box_clicks')
                            .upsert({
                                id: testId,
                                user_id: 'test_user',
                                set_name: 'test_set',
                                date_key: '2025-08-03',
                                number_value: 1,
                                hr_number: 1,
                                is_clicked: true,
                                is_present: false
                            })
                            .then(({ error: insertError }) => {
                                if (insertError) {
                                    console.log('❌ Insert test failed:', insertError.message);
                                } else {
                                    console.log('✅ Insert test successful!');
                                    
                                    // Clean up
                                    service.supabase
                                        .from('number_box_clicks')
                                        .delete()
                                        .eq('id', testId)
                                        .then(() => {
                                            console.log('✅ Test cleanup complete');
                                            console.log('🎉 Database is working correctly!');
                                            console.log('💡 Your number box persistence should work now');
                                        });
                                }
                            });
                    }
                });
        } else {
            console.log('❌ Supabase service not properly initialized');
        }
    } catch (error) {
        console.log('❌ Error accessing services:', error);
    }
} else {
    console.log('❌ DualServiceManager not found');
    console.log('💡 Make sure you run this on the Rule1 page');
}

// Check if we're on the right page
if (window.location.pathname.includes('rule1') || document.title.includes('Rule1')) {
    console.log('✅ You are on the Rule1 page');
} else {
    console.log('⚠️ You might not be on the Rule1 page');
    console.log('💡 Navigate to the Rule1 page and run this diagnostic again');
}

console.log('🔍 Rule1 Number Box Database Diagnostic - Complete');
console.log('📋 Summary:');
console.log('1. If table is missing → Use RULE1-DATABASE-FIX-GUIDE.html');
console.log('2. If table exists → Test clicking number boxes and refreshing');
console.log('3. If still not working → Check console for additional errors');
