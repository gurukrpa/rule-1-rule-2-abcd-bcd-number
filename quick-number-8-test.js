/**
 * Quick D-4 Set-1 Number 8 Test - Run in Browser Console
 * 
 * This script tests the specific issue where number 8 in D-4 Set-1 doesn't persist
 */

console.log('🧪 QUICK D-4 SET-1 NUMBER 8 PERSISTENCE TEST');
console.log('=============================================');

async function quickTestNumber8() {
    console.log('🎯 Testing D-4 Set-1 Number 8 specifically...');
    
    // Step 1: Environment check
    if (!window.rule1PageDebug || !window.dualServiceManager) {
        console.error('❌ Required services not available. Make sure you\'re on Rule-1 Enhanced page.');
        return;
    }
    
    const state = window.rule1PageDebug.getStateInfo();
    console.log('📊 Current state:', {
        user: state.selectedUser,
        date: state.date,
        activeHR: state.activeHR
    });
    
    // Step 2: Find D-4 Set-1 variations
    const d4Variations = [
        'D-4 Set-1',
        'D-4 Set-1 Matrix',
        'D-4 (trd) Set-1',
        'D-4 (trd) Set-1 Matrix'
    ];
    
    let foundD4 = state.availableTopics?.find(topic => 
        d4Variations.some(variation => topic.includes('D-4') && topic.includes('Set-1'))
    );
    
    if (!foundD4) {
        console.error('❌ D-4 Set-1 not found in available topics:', state.availableTopics);
        return;
    }
    
    console.log('✅ Found D-4 Set-1 as:', foundD4);
    
    // Step 3: Test canonical key generation
    const topicKey = (name) => { 
        const m = String(name).match(/D-(\d+).*?Set-(\d+)/i); 
        return m ? `D-${m[1]}#${m[2]}` : String(name).trim(); 
    };
    const normHR = (hr) => { 
        const h = String(hr).replace(/^HR/i,'').trim(); 
        return `HR${parseInt(h,10)}`; 
    };
    
    const tKey = topicKey(foundD4);
    const hrKey = normHR(state.activeHR);
    
    console.log('🔑 Keys:', { 
        topic: foundD4, 
        tKey, 
        hrKey, 
        date: state.date 
    });
    
    // Step 4: Check current state for number 8
    const currentNumbers = state.clickedNumbers[tKey]?.[state.date]?.[hrKey] || [];
    const has8InState = currentNumbers.includes(8);
    
    console.log('🔍 Current state check:');
    console.log(`  Numbers in state: [${currentNumbers.join(', ')}]`);
    console.log(`  Has number 8: ${has8InState ? '✅ YES' : '❌ NO'}`);
    
    // Step 5: Check database for number 8
    const dbData = await window.dualServiceManager.getTopicClicks(state.selectedUser, foundD4, state.date);
    const db8Records = dbData.filter(record => 
        record.clicked_number === 8 && 
        record.hour.toString() === state.activeHR.toString()
    );
    
    console.log('🗄️ Database check:');
    console.log(`  Total records for D-4 Set-1: ${dbData.length}`);
    console.log(`  Number 8 records: ${db8Records.length}`);
    if (db8Records.length > 0) {
        console.log(`  Number 8 details:`, db8Records[0]);
    }
    
    // Step 6: Check visual state
    const numberBoxes = document.querySelectorAll('button');
    let visual8Found = false;
    let visual8Highlighted = false;
    
    for (const box of numberBoxes) {
        if (box.textContent?.trim() === '8') {
            visual8Found = true;
            if (box.className.includes('bg-orange') || box.className.includes('bg-green')) {
                visual8Highlighted = true;
                break;
            }
        }
    }
    
    console.log('👁️ Visual check:');
    console.log(`  Number 8 box found: ${visual8Found ? '✅ YES' : '❌ NO'}`);
    console.log(`  Number 8 highlighted: ${visual8Highlighted ? '✅ YES' : '❌ NO'}`);
    
    // Step 7: Test clicking number 8
    console.log('\n🖱️ Testing click on number 8...');
    
    try {
        // Try to simulate a click using the component's click handler
        if (window.rule1PageDebug.testClick) {
            await window.rule1PageDebug.testClick(8, foundD4, state.date);
            console.log('✅ Test click completed');
        } else {
            // Try manual click via DOM
            for (const box of numberBoxes) {
                if (box.textContent?.trim() === '8') {
                    box.click();
                    console.log('✅ DOM click completed');
                    break;
                }
            }
        }
        
        // Wait a moment for state to update
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check state again
        const newState = window.rule1PageDebug.getStateInfo();
        const newNumbers = newState.clickedNumbers[tKey]?.[state.date]?.[hrKey] || [];
        const newHas8 = newNumbers.includes(8);
        
        console.log('📊 After click state:');
        console.log(`  Numbers: [${newNumbers.join(', ')}]`);
        console.log(`  Has number 8: ${newHas8 ? '✅ YES' : '❌ NO'}`);
        
        // Check database again
        const newDbData = await window.dualServiceManager.getTopicClicks(state.selectedUser, foundD4, state.date);
        const newDb8Records = newDbData.filter(record => 
            record.clicked_number === 8 && 
            record.hour.toString() === state.activeHR.toString()
        );
        
        console.log('🗄️ After click database:');
        console.log(`  Number 8 records: ${newDb8Records.length}`);
        
    } catch (clickError) {
        console.error('❌ Click test failed:', clickError);
    }
    
    // Step 8: Summary
    console.log('\n📋 SUMMARY:');
    console.log('===========');
    
    const finalState = window.rule1PageDebug.getStateInfo();
    const finalNumbers = finalState.clickedNumbers[tKey]?.[state.date]?.[hrKey] || [];
    const finalHas8 = finalNumbers.includes(8);
    
    if (finalHas8) {
        console.log('✅ SUCCESS: Number 8 is now persisting correctly');
    } else {
        console.error('❌ ISSUE: Number 8 is still not persisting');
        console.log('🔧 DEBUGGING INFO:');
        console.log('   Check if ABCD/BCD analysis includes number 8');
        console.log('   Check console for any error messages during click');
        console.log('   Try refreshing page and running test again');
    }
    
    console.log(`📊 Final state: [${finalNumbers.join(', ')}]`);
}

// Run the test
quickTestNumber8();

// Make available for re-running
window.quickTestNumber8 = quickTestNumber8;

console.log('\n💡 To run again: window.quickTestNumber8()');