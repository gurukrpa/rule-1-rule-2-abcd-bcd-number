// Quick Analysis Script for Rule-1 Highlighting Issue
// Run this in browser console on Rule-1 page to get immediate insights

(function() {
    console.log('🔍 QUICK RULE-1 HIGHLIGHTING ANALYSIS');
    console.log('='.repeat(50));
    
    // Try to get React component state
    let state = null;
    try {
        const root = document.querySelector('#root');
        const reactFiber = Object.keys(root).find(key => 
            key.startsWith('__reactInternalInstance') || 
            key.startsWith('__reactFiber')
        );
        
        if (reactFiber && root[reactFiber]) {
            // Navigate through React fiber to find state
            let fiber = root[reactFiber];
            while (fiber && !state) {
                if (fiber.stateNode?.state) {
                    state = fiber.stateNode.state;
                    break;
                }
                if (fiber.child) fiber = fiber.child;
                else if (fiber.sibling) fiber = fiber.sibling;
                else break;
            }
        }
    } catch (e) {
        console.log('⚠️ Could not access React state:', e.message);
    }
    
    if (!state) {
        console.log('❌ Could not find React component state');
        console.log('Make sure you are on the Rule-1 page');
        return;
    }
    
    console.log('✅ Found React state');
    
    // Quick analysis
    const { 
        clickedNumbers, 
        abcdBcdAnalysis, 
        activeHR, 
        selectedUser, 
        date,
        availableTopics 
    } = state;
    
    console.log(`👤 User: ${selectedUser}`);
    console.log(`⏰ Active HR: ${activeHR}`);
    console.log(`📅 Date: ${date}`);
    console.log(`🎯 Topics: ${availableTopics?.length || 0}`);
    
    // Count clicked numbers
    let totalClicks = 0;
    let topicsWithClicks = 0;
    
    if (clickedNumbers) {
        for (const topic in clickedNumbers) {
            let topicHasClicks = false;
            for (const dateKey in clickedNumbers[topic]) {
                for (const hour in clickedNumbers[topic][dateKey]) {
                    const clicks = clickedNumbers[topic][dateKey][hour];
                    if (clicks.length > 0) {
                        totalClicks += clicks.length;
                        topicHasClicks = true;
                    }
                }
            }
            if (topicHasClicks) topicsWithClicks++;
        }
    }
    
    console.log(`📊 Clicked Numbers: ${totalClicks} across ${topicsWithClicks} topics`);
    
    // Count analysis data
    let topicsWithAnalysis = 0;
    let datesWithAnalysis = 0;
    
    if (abcdBcdAnalysis) {
        topicsWithAnalysis = Object.keys(abcdBcdAnalysis).length;
        const allDates = new Set();
        
        for (const topic in abcdBcdAnalysis) {
            for (const dateKey in abcdBcdAnalysis[topic]) {
                allDates.add(dateKey);
            }
        }
        datesWithAnalysis = allDates.size;
    }
    
    console.log(`🧮 ABCD/BCD Analysis: ${topicsWithAnalysis} topics across ${datesWithAnalysis} dates`);
    
    // Quick issue detection
    console.log('\n🚨 ISSUE DETECTION:');
    
    if (totalClicks === 0) {
        console.log('❌ NO CLICKED NUMBERS FOUND');
        console.log('   • Check if numbers were actually clicked');
        console.log('   • Check database connection');
        console.log('   • Check loadClickedNumbers() function');
    } else {
        console.log(`✅ Found ${totalClicks} clicked numbers`);
    }
    
    if (topicsWithAnalysis === 0) {
        console.log('❌ NO ABCD/BCD ANALYSIS DATA FOUND');
        console.log('   • This is the likely cause of highlighting failure');
        console.log('   • Check Rule-2 analysis generation');
        console.log('   • Check loadRule2AnalysisResults() function');
    } else {
        console.log(`✅ Found analysis data for ${topicsWithAnalysis} topics`);
    }
    
    // Specific highlighting test for current date
    if (totalClicks > 0 && topicsWithAnalysis > 0) {
        console.log('\n🧪 TESTING HIGHLIGHTING FOR CURRENT DATE:');
        
        for (const topic in clickedNumbers) {
            const dateData = clickedNumbers[topic][date];
            if (dateData && dateData[`HR${activeHR}`]) {
                const userClicks = dateData[`HR${activeHR}`];
                const analysisData = abcdBcdAnalysis[topic]?.[date];
                
                console.log(`\n📊 ${topic}:`);
                console.log(`  • User clicked: ${userClicks.join(', ')}`);
                
                if (analysisData) {
                    const { abcdNumbers = [], bcdNumbers = [] } = analysisData;
                    console.log(`  • ABCD: ${abcdNumbers.join(', ')}`);
                    console.log(`  • BCD: ${bcdNumbers.join(', ')}`);
                    
                    // Check which clicked numbers should highlight
                    const shouldHighlight = userClicks.filter(num => 
                        abcdNumbers.includes(num) || bcdNumbers.includes(num)
                    );
                    
                    if (shouldHighlight.length > 0) {
                        console.log(`  ✅ Should highlight: ${shouldHighlight.join(', ')}`);
                    } else {
                        console.log(`  ❌ No clicked numbers in ABCD/BCD arrays`);
                        console.log(`     This explains why highlighting doesn't work!`);
                    }
                } else {
                    console.log(`  ❌ No analysis data for this date`);
                    console.log(`     This explains why highlighting doesn't work!`);
                }
            }
        }
    }
    
    // Summary and recommendations
    console.log('\n📋 SUMMARY & RECOMMENDATIONS:');
    
    if (totalClicks > 0 && topicsWithAnalysis === 0) {
        console.log('🎯 ROOT CAUSE: Missing ABCD/BCD analysis data');
        console.log('🔧 ACTIONS:');
        console.log('   1. Check Rule-2 analysis generation');
        console.log('   2. Verify dates have sufficient data');
        console.log('   3. Check abcdBcdAnalysis state updates');
    } else if (totalClicks === 0) {
        console.log('🎯 ROOT CAUSE: No clicked numbers loaded');
        console.log('🔧 ACTIONS:');
        console.log('   1. Check database connection');
        console.log('   2. Verify loadClickedNumbers() execution');
        console.log('   3. Check user ID and activeHR values');
    } else {
        console.log('🎯 Need more detailed analysis - run full diagnostic');
    }
    
    // Export data for further inspection
    window.quickAnalysisResult = {
        state,
        totalClicks,
        topicsWithClicks,
        topicsWithAnalysis,
        datesWithAnalysis
    };
    
    console.log('\n💾 Data exported to window.quickAnalysisResult');
    console.log('🔧 For full diagnostic, load: rule1-highlighting-diagnostic.js');
    
})();
