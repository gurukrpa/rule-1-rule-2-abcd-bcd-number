/**
 * Test D-4 Set-1 Click Persistence - Diagnostic Script
 * 
 * This script specifically tests if D-4 Set-1 clicked numbers are being saved and fetched correctly.
 * Run this in the browser console on the Rule-1 Enhanced page.
 */

console.log('🔍 TESTING D-4 SET-1 CLICK PERSISTENCE');
console.log('=====================================');

async function testD4Set1Persistence() {
    try {
        // Step 1: Check environment
        console.log('\n1️⃣ ENVIRONMENT CHECK');
        console.log('-------------------');
        
        if (!window.rule1PageDebug) {
            console.error('❌ Rule1PageDebug not available - make sure you\'re on the Rule-1 Enhanced page');
            return;
        }
        
        if (!window.dualServiceManager) {
            console.error('❌ DualServiceManager not available');
            return;
        }
        
        const state = window.rule1PageDebug.getStateInfo();
        console.log('✅ Environment ready');
        console.log('📊 Current state:', {
            user: state.selectedUser,
            date: state.date,
            activeHR: state.activeHR,
            clickedNumbers: Object.keys(state.clickedNumbers).length
        });
        
        // Step 2: Check if D-4 Set-1 is available
        console.log('\n2️⃣ D-4 SET-1 AVAILABILITY CHECK');
        console.log('-------------------------------');
        
        const d4Set1Variations = [
            'D-4 Set-1',
            'D-4 Set-1 Matrix',
            'D-4 (trd) Set-1',
            'D-4 (trd) Set-1 Matrix'
        ];
        
        let foundD4Set1 = null;
        for (const variation of d4Set1Variations) {
            if (state.availableTopics && state.availableTopics.includes(variation)) {
                foundD4Set1 = variation;
                break;
            }
        }
        
        if (!foundD4Set1) {
            console.error('❌ D-4 Set-1 not found in available topics');
            console.log('📋 Available topics:', state.availableTopics);
            return;
        }
        
        console.log('✅ Found D-4 Set-1 as:', foundD4Set1);
        
        // Step 3: Test canonical key generation
        console.log('\n3️⃣ CANONICAL KEY GENERATION TEST');
        console.log('--------------------------------');
        
        // Use the same functions from Rule1Page_Enhanced.jsx
        const topicKey = (name) => { 
            const m = String(name).match(/D-(\d+).*?Set-(\d+)/i); 
            return m ? `D-${m[1]}#${m[2]}` : String(name).trim(); 
        };
        const normHR = (hr) => { 
            const h = String(hr).replace(/^HR/i,'').trim(); 
            return `HR${parseInt(h,10)}`; 
        };
        
        const tKey = topicKey(foundD4Set1);
        const hrKey = normHR(state.activeHR);
        const dateKey = state.date;
        
        console.log('🔑 Key generation:', {
            originalTopicName: foundD4Set1,
            canonicalTopicKey: tKey,
            originalHR: state.activeHR,
            canonicalHRKey: hrKey,
            dateKey: dateKey
        });
        
        // Step 4: Check database for existing clicks
        console.log('\n4️⃣ DATABASE CHECK');
        console.log('----------------');
        
        const dbClicks = await window.dualServiceManager.getAllNumberBoxClicksForUserDate(
            state.selectedUser, 
            dateKey
        );
        
        console.log(`📦 Total database records for date: ${dbClicks?.length || 0}`);
        
        if (dbClicks && dbClicks.length > 0) {
            // Filter for D-4 Set-1 records
            const d4Set1Records = dbClicks.filter(record => {
                // Check both original name and canonical key
                const recordTopicKey = topicKey(record.topic_name);
                return recordTopicKey === tKey || record.topic_name === foundD4Set1;
            });
            
            console.log(`🎯 D-4 Set-1 specific records: ${d4Set1Records.length}`);
            
            if (d4Set1Records.length > 0) {
                console.log('📋 D-4 Set-1 records in database:');
                d4Set1Records.forEach((record, index) => {
                    console.log(`  ${index + 1}. Number ${record.clicked_number}, HR${record.hr_number}, Clicked: ${record.is_matched}, Topic: "${record.topic_name}"`);
                });
            }
        }
        
        // Step 5: Check local state
        console.log('\n5️⃣ LOCAL STATE CHECK');
        console.log('--------------------');
        
        const localD4Set1Data = state.clickedNumbers[tKey]?.[dateKey]?.[hrKey] || [];
        console.log(`🧩 Local state for D-4 Set-1: ${localD4Set1Data.length} clicked numbers`);
        
        if (localD4Set1Data.length > 0) {
            console.log('📋 Clicked numbers in local state:', localD4Set1Data);
        }
        
        // Step 6: Test specific numbers (8 and 10 as mentioned in the issue)
        console.log('\n6️⃣ TEST SPECIFIC NUMBERS');
        console.log('------------------------');
        
        const testNumbers = [8, 10];
        
        for (const testNumber of testNumbers) {
            console.log(`\n🔢 Testing number ${testNumber}:`);
            
            // Check if it's in local state
            const inLocalState = localD4Set1Data.includes(testNumber);
            console.log(`  Local state: ${inLocalState ? '✅ FOUND' : '❌ NOT FOUND'}`);
            
            // Check if it's in database
            const inDatabase = dbClicks?.some(record => {
                const recordTopicKey = topicKey(record.topic_name);
                return (recordTopicKey === tKey || record.topic_name === foundD4Set1) && 
                       record.clicked_number === testNumber &&
                       record.hr_number.toString() === state.activeHR.toString() &&
                       record.is_matched === true;
            });
            console.log(`  Database: ${inDatabase ? '✅ FOUND' : '❌ NOT FOUND'}`);
            
            // Check visual state
            const numberBoxes = document.querySelectorAll(`button`);
            let visuallyHighlighted = false;
            for (const box of numberBoxes) {
                if (box.textContent?.trim() === testNumber.toString() && 
                    (box.className.includes('bg-orange') || box.className.includes('bg-green'))) {
                    visuallyHighlighted = true;
                    break;
                }
            }
            console.log(`  Visual state: ${visuallyHighlighted ? '✅ HIGHLIGHTED' : '❌ NOT HIGHLIGHTED'}`);
            
            // Overall status
            const isWorking = inLocalState && inDatabase && visuallyHighlighted;
            console.log(`  Overall: ${isWorking ? '✅ WORKING' : '❌ ISSUE DETECTED'}`);
        }
        
        // Step 7: Test save operation
        console.log('\n7️⃣ TEST SAVE OPERATION');
        console.log('----------------------');
        
        const testNumber = 8; // Focus on number 8 as mentioned in issue
        console.log(`🖱️ Testing click save for number ${testNumber}...`);
        
        try {
            // Simulate a save operation
            const saveResult = await window.dualServiceManager.saveTopicClick(
                state.selectedUser,
                foundD4Set1, // Use original topic name for database
                dateKey,
                hrKey,
                testNumber,
                true // is_matched
            );
            
            console.log(`💾 Save result: ${saveResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
            if (saveResult.error) {
                console.error('💥 Save error:', saveResult.error);
            }
        } catch (saveError) {
            console.error('💥 Save exception:', saveError);
        }
        
        // Step 8: Test load operation
        console.log('\n8️⃣ TEST LOAD OPERATION');
        console.log('----------------------');
        
        console.log('🔄 Testing load operation...');
        
        try {
            // Force reload the clicked numbers
            if (window.rule1PageDebug.forceReloadNumberBoxes) {
                await window.rule1PageDebug.forceReloadNumberBoxes();
                console.log('✅ Force reload completed');
                
                // Check state again
                const newState = window.rule1PageDebug.getStateInfo();
                const newLocalData = newState.clickedNumbers[tKey]?.[dateKey]?.[hrKey] || [];
                console.log(`📊 After reload - Local state: ${newLocalData.length} clicked numbers`);
                console.log(`📋 Numbers: [${newLocalData.join(', ')}]`);
            } else {
                console.warn('⚠️ forceReloadNumberBoxes not available');
            }
        } catch (loadError) {
            console.error('💥 Load exception:', loadError);
        }
        
        // Step 9: Diagnosis summary
        console.log('\n9️⃣ DIAGNOSIS SUMMARY');
        console.log('-------------------');
        
        const finalState = window.rule1PageDebug.getStateInfo();
        const finalLocalData = finalState.clickedNumbers[tKey]?.[dateKey]?.[hrKey] || [];
        
        console.log('🏁 Final Results:');
        console.log(`📊 D-4 Set-1 clicked numbers in state: ${finalLocalData.length}`);
        console.log(`📋 Numbers: [${finalLocalData.join(', ')}]`);
        
        // Check if the issue is resolved
        const number8InState = finalLocalData.includes(8);
        const number10InState = finalLocalData.includes(10);
        
        if (number8InState && number10InState) {
            console.log('✅ SUCCESS: Both numbers 8 and 10 are persisting correctly');
        } else if (!number8InState && number10InState) {
            console.error('❌ ISSUE: Number 8 is not persisting (matches reported issue)');
        } else if (number8InState && !number10InState) {
            console.error('❌ ISSUE: Number 10 is not persisting');
        } else {
            console.error('❌ ISSUE: Neither number 8 nor 10 are persisting');
        }
        
        console.log('\n🔧 NEXT STEPS:');
        console.log('- If issues persist, check the console logs above for specific error details');
        console.log('- Try manually clicking numbers 8 and 10 in D-4 Set-1');
        console.log('- Refresh the page and run this test again');
        console.log('- Check browser network tab for any API errors');
        
    } catch (error) {
        console.error('💥 Test failed:', error);
    }
}

// Auto-run the test
testD4Set1Persistence();

// Make it available globally for manual runs
window.testD4Set1Persistence = testD4Set1Persistence;

console.log('\n💡 To run this test again, use: window.testD4Set1Persistence()');
