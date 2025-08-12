// MINIMAL CHROME CONSOLE DEBUGGER - Copy and paste this into Chrome console

console.clear();
console.log('🔍 MINIMAL NUMBER BOX DEBUGGER');

// Basic checks
console.log('📍 URL:', window.location.href);
console.log('👤 User:', localStorage.getItem('currentUser'));
console.log('📅 Date:', localStorage.getItem('selectedDate'));

// Monitor clicks
let clicks = 0;
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'BUTTON' && /^\d+$/.test(e.target.textContent?.trim())) {
        clicks++;
        console.log(`🖱️ CLICK #${clicks}: Number ${e.target.textContent} at ${new Date().toLocaleTimeString()}`);
        console.log('🎯 Target:', e.target);
        console.log('🎨 Classes before:', e.target.className);
        
        setTimeout(() => {
            console.log('🎨 Classes after:', e.target.className);
            const changed = e.target.className.includes('green') || e.target.className.includes('orange') || e.target.style.backgroundColor;
            console.log(changed ? '✅ Visual change detected' : '⚠️ No visual change');
        }, 100);
    }
}, true);

// Check for services
if (window.dualServiceManager) {
    console.log('✅ DualServiceManager found');
    window.testSave = async (num = 5) => {
        try {
            const result = await window.dualServiceManager.saveNumberBoxClick(
                localStorage.getItem('currentUser'),
                'D-1 Set-1 Matrix',
                localStorage.getItem('selectedDate') || '2025-08-01',
                num, 1, true, true
            );
            console.log(`💾 Save test result:`, result);
        } catch (e) {
            console.log(`❌ Save test error:`, e);
        }
    };
    console.log('🧪 Use testSave(5) to test saving number 5');
} else {
    console.log('❌ DualServiceManager not found');
}

// Check supabase
if (window.supabase) {
    console.log('✅ Supabase found');
    window.checkDB = async () => {
        try {
            const { data, error } = await window.supabase.from('number_box_clicks').select('*').limit(5);
            console.log('🗄️ Database check:', error ? error : `Found ${data?.length || 0} records`);
        } catch (e) {
            console.log('❌ DB error:', e);
        }
    };
    console.log('🗄️ Use checkDB() to test database');
} else {
    console.log('❌ Supabase not found');
}

console.log('\n📋 READY! Click number boxes and watch the logs...');
