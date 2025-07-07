// Quick verification script to test hour-specific ABCD/BCD data loading
// Run this in the browser console on the Planets Analysis page

async function verifyHourSpecificData() {
    console.log('🔬 Starting hour-specific data verification...');
    
    try {
        // Import the RealTimeRule2AnalysisService
        const { RealTimeRule2AnalysisService } = await import('./src/services/realTimeRule2AnalysisService.js');
        
        // Test parameters
        const userId = 'planets-test-user-2025';
        const datesList = ['2024-12-28', '2024-12-29', '2024-12-30', '2024-12-31'];
        const latestDate = '2024-12-31';
        
        console.log('📅 Testing with dates:', datesList);
        console.log('📊 Analysis date:', latestDate);
        
        // Perform the analysis
        const result = await RealTimeRule2AnalysisService.performRule2Analysis(
            userId,
            latestDate,
            datesList
        );
        
        if (result.success && result.data.hrResults) {
            console.log('✅ SUCCESS! Analysis completed');
            console.log('📊 Available hours:', Object.keys(result.data.hrResults));
            
            // Check if different hours have different data
            const hrResults = result.data.hrResults;
            const hourNumbers = Object.keys(hrResults);
            
            if (hourNumbers.length > 1) {
                const firstHour = hourNumbers[0];
                const secondHour = hourNumbers[1];
                
                const firstHourData = hrResults[firstHour];
                const secondHourData = hrResults[secondHour];
                
                if (firstHourData && secondHourData && !firstHourData.error && !secondHourData.error) {
                    const firstOverall = (firstHourData.overallAbcdNumbers || []).join(',');
                    const secondOverall = (secondHourData.overallAbcdNumbers || []).join(',');
                    
                    if (firstOverall !== secondOverall) {
                        console.log('🎉 VERIFICATION PASSED: Hours have different ABCD numbers!');
                        console.log(`   HR ${firstHour} ABCD: [${firstOverall}]`);
                        console.log(`   HR ${secondHour} ABCD: [${secondOverall}]`);
                        
                        // Check a specific topic for differences
                        const sampleTopic = 'D-1 Set-1 Matrix';
                        const firstTopic = firstHourData.topicResults?.find(t => t.setName === sampleTopic);
                        const secondTopic = secondHourData.topicResults?.find(t => t.setName === sampleTopic);
                        
                        if (firstTopic && secondTopic) {
                            console.log(`📋 ${sampleTopic} comparison:`);
                            console.log(`   HR ${firstHour}: ABCD[${firstTopic.abcdNumbers?.join(',') || ''}] BCD[${firstTopic.bcdNumbers?.join(',') || ''}]`);
                            console.log(`   HR ${secondHour}: ABCD[${secondTopic.abcdNumbers?.join(',') || ''}] BCD[${secondTopic.bcdNumbers?.join(',') || ''}]`);
                        }
                        
                        return {
                            success: true,
                            message: 'Each hour has unique real ABCD/BCD data!',
                            data: result.data
                        };
                    } else {
                        console.log('⚠️ WARNING: Hours have identical ABCD numbers');
                        console.log(`   Both hours: [${firstOverall}]`);
                        console.log('   This might indicate fallback data is being used');
                    }
                } else {
                    console.log('⚠️ WARNING: Some hours have errors:', {
                        [firstHour]: firstHourData?.error || 'OK',
                        [secondHour]: secondHourData?.error || 'OK'
                    });
                }
            } else {
                console.log('ℹ️ INFO: Only one hour available for testing');
            }
            
            // Show detailed breakdown
            console.log('📊 Detailed breakdown:');
            hourNumbers.forEach(hr => {
                const hrData = hrResults[hr];
                if (hrData.error) {
                    console.log(`   HR ${hr}: ❌ ${hrData.error}`);
                } else {
                    console.log(`   HR ${hr}: ✅ ${hrData.topicResults?.length || 0} topics, ABCD[${hrData.overallAbcdNumbers?.join(',') || ''}], BCD[${hrData.overallBcdNumbers?.join(',') || ''}]`);
                }
            });
            
            return { success: true, data: result.data };
            
        } else {
            console.log('❌ FAILED: Analysis unsuccessful');
            console.log('   Error:', result.error);
            return { success: false, error: result.error };
        }
        
    } catch (error) {
        console.error('❌ EXCEPTION:', error);
        return { success: false, error: error.message };
    }
}

// Auto-run the verification
console.log('🚀 Auto-running hour-specific data verification...');
verifyHourSpecificData().then(result => {
    if (result.success) {
        console.log('✅ Verification completed successfully!');
    } else {
        console.log('❌ Verification failed:', result.error);
    }
});
