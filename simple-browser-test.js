// SIMPLE Rule1 Database Test - Paste in Browser Console (F12)
// Use this AFTER creating the table in Supabase

console.log('🔍 Testing Rule1 number box database...');

// Quick check if we can access the database
if (typeof window.dualServiceManager !== 'undefined') {
    console.log('✅ DualServiceManager found');
    
    const service = window.dualServiceManager.supabaseService;
    if (service && service.supabase) {
        console.log('✅ Supabase connected');
        
        // Test the table exists
        service.supabase
            .from('number_box_clicks')
            .select('count(*)')
            .then(({ data, error }) => {
                if (error) {
                    console.log('❌ Table missing:', error.message);
                    console.log('🔧 Create table in Supabase SQL Editor first!');
                } else {
                    console.log('✅ number_box_clicks table exists!');
                    console.log('🎉 Your persistence should work now!');
                }
            });
    } else {
        console.log('❌ Supabase not connected');
    }
} else {
    console.log('❌ Run this on the Rule1 page');
}
