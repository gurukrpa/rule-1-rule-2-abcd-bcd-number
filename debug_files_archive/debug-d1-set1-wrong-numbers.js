// DEBUG: Check why D-1 Set-1 Matrix is showing wrong ABCD numbers
// Expected: ABCD [1,2,4,7,9], BCD [5]
// Actual: A [1,2,4,9] (missing 7, missing BCD)

console.log('🔍 DEBUGGING D-1 Set-1 Matrix ABCD/BCD Numbers Issue');

// Check what the browser environment shows
if (typeof window !== 'undefined') {
    console.log('🌐 Running in browser environment');
    
    // Wait for page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runDiagnostic);
    } else {
        runDiagnostic();
    }
} else {
    console.log('🖥️ Running in Node.js environment');
    runDiagnostic();
}

async function runDiagnostic() {
    console.log('🚀 Starting D-1 Set-1 Matrix diagnostic...');
    
    try {
        // 1. Check hardcoded TOPIC_NUMBERS (should be correct)
        console.log('📋 Step 1: Check hardcoded TOPIC_NUMBERS');
        const expectedTopicNumbers = {
            'D-1 Set-1 Matrix': { abcd: [1, 2, 4, 7, 9], bcd: [5] }
        };
        console.log('✅ Expected D-1 Set-1 Matrix:', expectedTopicNumbers['D-1 Set-1 Matrix']);
        
        // 2. Check if RealTimeRule2AnalysisService is working
        console.log('📊 Step 2: Test RealTimeRule2AnalysisService');
        
        try {
            const { RealTimeRule2AnalysisService } = await import('./src/services/realTimeRule2AnalysisService.js');
            
            const testUserId = 'planets-test-user-2025';
            const testDates = ['2024-12-28', '2024-12-29', '2024-12-30', '2024-12-31'];
            const testAnalysisDate = '2024-12-31';
            
            console.log('🔬 Testing with:', { testUserId, testDates, testAnalysisDate });
            
            const result = await RealTimeRule2AnalysisService.performRule2Analysis(
                testUserId,
                testAnalysisDate,
                testDates
            );
            
            if (result.success && result.data.hrResults) {
                console.log('✅ RealTimeRule2AnalysisService working!');
                console.log('📈 Available hours:', Object.keys(result.data.hrResults));
                
                // Check HR 1 data specifically
                const hr1Data = result.data.hrResults['1'];
                if (hr1Data && !hr1Data.error) {
                    console.log('🎯 HR 1 Data found');
                    
                    // Look for D-1 Set-1 Matrix in topic results
                    const d1set1Topic = hr1Data.topicResults.find(t => 
                        t.setName === 'D-1 Set-1 Matrix' || 
                        t.setName.includes('D-1') && t.setName.includes('Set-1')
                    );
                    
                    if (d1set1Topic) {
                        console.log('🎯 Found D-1 Set-1 Matrix in HR 1 results:');
                        console.log('   - Set Name:', d1set1Topic.setName);
                        console.log('   - ABCD Numbers:', d1set1Topic.abcdNumbers);
                        console.log('   - BCD Numbers:', d1set1Topic.bcdNumbers);
                        console.log('   - Has Error:', !!d1set1Topic.error);
                        
                        // Compare with expected
                        const expectedABCD = [1, 2, 4, 7, 9];
                        const expectedBCD = [5];
                        const actualABCD = d1set1Topic.abcdNumbers || [];
                        const actualBCD = d1set1Topic.bcdNumbers || [];
                        
                        console.log('🔍 Comparison:');
                        console.log(`   Expected ABCD: [${expectedABCD.join(',')}]`);
                        console.log(`   Actual ABCD:   [${actualABCD.join(',')}]`);
                        console.log(`   Expected BCD:  [${expectedBCD.join(',')}]`);
                        console.log(`   Actual BCD:    [${actualBCD.join(',')}]`);
                        
                        const abcdMatch = JSON.stringify(actualABCD.sort()) === JSON.stringify(expectedABCD.sort());
                        const bcdMatch = JSON.stringify(actualBCD.sort()) === JSON.stringify(expectedBCD.sort());
                        
                        console.log(`   ABCD Match: ${abcdMatch ? '✅' : '❌'}`);
                        console.log(`   BCD Match: ${bcdMatch ? '✅' : '❌'}`);
                        
                        if (!abcdMatch || !bcdMatch) {
                            console.log('🔥 ISSUE IDENTIFIED: Real analysis data is incorrect!');
                            console.log('💡 This explains why the UI shows wrong numbers.');
                        }
                    } else {
                        console.log('❌ D-1 Set-1 Matrix not found in HR 1 topic results');
                        console.log('📋 Available topics:', hr1Data.topicResults.map(t => t.setName));
                    }
                } else {
                    console.log('❌ HR 1 data not available or has error:', hr1Data?.error);
                }
            } else {
                console.log('❌ RealTimeRule2AnalysisService failed:', result.error);
            }
            
        } catch (serviceError) {
            console.log('❌ RealTimeRule2AnalysisService error:', serviceError.message);
        }
        
        // 3. Check PlanetsAnalysisDataService
        console.log('📊 Step 3: Test PlanetsAnalysisDataService');
        
        try {
            const { PlanetsAnalysisDataService } = await import('./src/services/planetsAnalysisDataService.js');
            
            const testUserId = 'planets-test-user-2025';
            const testDates = ['2024-12-28', '2024-12-29', '2024-12-30', '2024-12-31'];
            
            const serviceResult = await PlanetsAnalysisDataService.getLatestAnalysisNumbers(
                testUserId,
                testDates,
                1 // HR 1
            );
            
            if (serviceResult.success && serviceResult.data.topicNumbers) {
                console.log('✅ PlanetsAnalysisDataService working!');
                
                const d1set1Data = serviceResult.data.topicNumbers['D-1 Set-1 Matrix'];
                if (d1set1Data) {
                    console.log('🎯 D-1 Set-1 Matrix from service:');
                    console.log('   - ABCD:', d1set1Data.abcd);
                    console.log('   - BCD:', d1set1Data.bcd);
                    
                    // Check if this matches expected
                    const expectedABCD = [1, 2, 4, 7, 9];
                    const expectedBCD = [5];
                    const abcdMatch = JSON.stringify(d1set1Data.abcd.sort()) === JSON.stringify(expectedABCD.sort());
                    const bcdMatch = JSON.stringify(d1set1Data.bcd.sort()) === JSON.stringify(expectedBCD.sort());
                    
                    console.log(`   ABCD Match: ${abcdMatch ? '✅' : '❌'}`);
                    console.log(`   BCD Match: ${bcdMatch ? '✅' : '❌'}`);
                } else {
                    console.log('❌ D-1 Set-1 Matrix not found in service results');
                    console.log('📋 Available topics:', Object.keys(serviceResult.data.topicNumbers));
                }
            } else {
                console.log('❌ PlanetsAnalysisDataService failed:', serviceResult.error);
            }
            
        } catch (serviceError) {
            console.log('❌ PlanetsAnalysisDataService error:', serviceError.message);
        }
        
        // 4. Check current page state (if in browser)
        if (typeof window !== 'undefined') {
            console.log('🔍 Step 4: Check current page state');
            
            // Look for React components or state
            const planetHeaders = document.querySelectorAll('[class*="bg-purple-100"]');
            if (planetHeaders.length > 0) {
                console.log(`📊 Found ${planetHeaders.length} planet headers on page`);
                
                planetHeaders.forEach((header, index) => {
                    const text = header.textContent;
                    if (text.includes('A:') || text.includes('B:')) {
                        console.log(`   Header ${index}: ${text}`);
                    }
                });
            } else {
                console.log('🔍 No planet headers found on page');
            }
        }
        
        console.log('🏁 Diagnostic complete!');
        
    } catch (error) {
        console.error('❌ Diagnostic failed:', error);
    }
}

// Export for use in Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runDiagnostic };
}
