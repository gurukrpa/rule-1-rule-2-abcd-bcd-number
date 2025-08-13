// D-4 Set-1 Persistence Test - Accessible via URL
window.testD4Persistence = async function() {
    console.clear();
    console.log('🧪 D-4 SET-1 PERSISTENCE TEST');
    console.log('============================');
    
    // Check environment
    if (!window.rule1PageDebug) {
        console.error('❌ Not on Rule-1 page or debug not available');
        return;
    }
    
    const state = window.rule1PageDebug.getStateInfo();
    console.log('📊 Current:', state.selectedUser, state.date, state.activeHR);
    
    // Find D-4 Set-1
    const d4Topic = state.availableTopics?.find(t => t.includes('D-4') && t.includes('Set-1'));
    if (!d4Topic) {
        console.error('❌ D-4 Set-1 not found');
        return;
    }
    console.log('✅ Found:', d4Topic);
    
    // Check keys
    const topicKey = name => { const m = String(name).match(/D-(\d+).*?Set-(\d+)/i); return m ? `D-${m[1]}#${m[2]}` : String(name).trim(); };
    const normHR = hr => `HR${parseInt(String(hr).replace(/^HR/i,'').trim(),10)}`;
    
    const tKey = topicKey(d4Topic);
    const hrKey = normHR(state.activeHR);
    console.log('🔑', { tKey, hrKey });
    
    // Check current state
    const currentNumbers = state.clickedNumbers[tKey]?.[state.date]?.[hrKey] || [];
    console.log('🔍 Current numbers:', currentNumbers);
    console.log('Has 8:', currentNumbers.includes(8) ? '✅' : '❌');
    console.log('Has 10:', currentNumbers.includes(10) ? '✅' : '❌');
    
    // Check database
    try {
        let dbData;
        if (window.cleanSupabaseService) {
            dbData = await window.cleanSupabaseService.getTopicClicks(state.selectedUser, d4Topic, state.date);
        } else if (window.dualServiceManager) {
            dbData = await window.dualServiceManager.getTopicClicks(state.selectedUser, d4Topic, state.date);
        }
        
        const db8 = dbData?.find(r => r.clicked_number === 8 && r.hour.toString() === state.activeHR.toString());
        const db10 = dbData?.find(r => r.clicked_number === 10 && r.hour.toString() === state.activeHR.toString());
        
        console.log('🗄️ Database:');
        console.log('  Total records:', dbData?.length || 0);
        console.log('  Has 8:', db8 ? '✅' : '❌');
        console.log('  Has 10:', db10 ? '✅' : '❌');
        
        // Summary
        if (currentNumbers.includes(8) && currentNumbers.includes(10)) {
            console.log('✅ SUCCESS: Both numbers persisting');
        } else if (!currentNumbers.includes(8) && currentNumbers.includes(10)) {
            console.error('❌ ISSUE: Number 8 not persisting (reported bug)');
        } else {
            console.log('ℹ️ Neither number clicked yet');
        }
        
    } catch (error) {
        console.error('❌ Database check failed:', error);
    }
};

console.log('✅ Test loaded! Run: testD4Persistence()');
