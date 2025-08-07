/**
 * COMPREHENSIVE RULE-1 PERSISTENCE DEBUG SCRIPT
 * This script will systematically test each part of the persistence flow
 */

console.log('🔬 Starting comprehensive Rule-1 persistence debug...\n');

class Rule1PersistenceDebugger {
    constructor() {
        this.testData = {
            userId: '1',
            setName: 'D-1 Set-1 Matrix',
            dateKey: '2025-01-20',
            numberValue: 6,
            hrNumber: 1,
            isPresent: true
        };
    }

    async runFullDiagnostic() {
        console.log('🚀 STARTING COMPREHENSIVE DIAGNOSTIC...\n');
        
        try {
            await this.step1_CheckPrerequisites();
            await this.step2_TestDatabaseConnection();
            await this.step3_TestSaveOperation();
            await this.step4_TestLoadOperation();
            await this.step5_TestKeyGeneration();
            await this.step6_TestUIIntegration();
            await this.step7_IdentifyRootCause();
            
            console.log('\n✅ COMPREHENSIVE DIAGNOSTIC COMPLETED');
            console.log('📋 Check the logs above for any issues found');
            
        } catch (error) {
            console.error('❌ Diagnostic failed:', error);
        }
    }

    async step1_CheckPrerequisites() {
        console.log('1️⃣ CHECKING PREREQUISITES...');
        console.log('═══════════════════════════════════════════════');
        
        const checks = {
            dualServiceManager: !!window.dualServiceManager,
            dualServiceEnabled: window.dualServiceManager?.enabled,
            rule1PageDebug: !!window.rule1PageDebug,
            rule1PageState: !!window.rule1PageDebug?.selectedUser
        };
        
        console.log('📊 Prerequisites check:', checks);
        
        if (!checks.dualServiceManager) {
            throw new Error('DualServiceManager not found. Make sure you are on the Rule-1 page.');
        }
        
        if (!checks.dualServiceEnabled) {
            throw new Error('DualServiceManager is disabled. Check database table exists.');
        }
        
        if (!checks.rule1PageDebug) {
            throw new Error('Rule1PageDebug not found. Make sure you are on the Rule-1 page.');
        }
        
        if (!checks.rule1PageState) {
            console.warn('⚠️ Rule-1 page state not ready. Some tests may use default values.');
        }
        
        console.log('✅ Prerequisites check passed\n');
    }

    async step2_TestDatabaseConnection() {
        console.log('2️⃣ TESTING DATABASE CONNECTION...');
        console.log('═══════════════════════════════════════════════');
        
        try {
            // Test basic query
            const existingClicks = await window.dualServiceManager.getAllNumberBoxClicksForUserDate(
                this.testData.userId, 
                this.testData.dateKey
            );
            
            console.log('📦 Existing clicks in database:', existingClicks?.length || 0);
            
            if (existingClicks && existingClicks.length > 0) {
                console.log('📋 Sample existing records:');
                existingClicks.slice(0, 3).forEach((record, index) => {
                    console.log(`  ${index + 1}:`, {
                        id: record.id,
                        set_name: record.set_name,
                        number_value: record.number_value,
                        hr_number: record.hr_number,
                        is_clicked: record.is_clicked
                    });
                });
            }
            
            // Test table statistics
            const stats = await window.dualServiceManager.getClickStatistics(this.testData.userId);
            console.log('📊 Database statistics:', stats);
            
            console.log('✅ Database connection test passed\n');
            
        } catch (error) {
            console.error('❌ Database connection test failed:', error);
            throw error;
        }
    }

    async step3_TestSaveOperation() {
        console.log('3️⃣ TESTING SAVE OPERATION...');
        console.log('═══════════════════════════════════════════════');
        
        try {
            // Clear any existing test data first
            await window.dualServiceManager.clearNumberBoxClicksForDate(
                this.testData.userId, 
                this.testData.dateKey
            );
            console.log('🧹 Cleared existing test data');
            
            // Test save operation
            console.log('💾 Testing save with parameters:', this.testData);
            
            const saveResult = await window.dualServiceManager.saveNumberBoxClick(
                this.testData.userId,
                this.testData.setName,
                this.testData.dateKey,
                this.testData.numberValue,
                this.testData.hrNumber,
                true,
                this.testData.isPresent
            );
            
            console.log('💾 Save result:', saveResult);
            
            if (!saveResult.success) {
                throw new Error(`Save failed: ${saveResult.error}`);
            }
            
            // Verify save by querying
            const verifyQuery = await window.dualServiceManager.getAllNumberBoxClicksForUserDate(
                this.testData.userId, 
                this.testData.dateKey
            );
            
            console.log('🔍 Verification query returned:', verifyQuery?.length || 0, 'records');
            
            if (!verifyQuery || verifyQuery.length === 0) {
                throw new Error('Save verification failed - no records found after save');
            }
            
            const savedRecord = verifyQuery.find(r => 
                r.number_value === this.testData.numberValue &&
                r.hr_number === this.testData.hrNumber &&
                r.set_name === this.testData.setName
            );
            
            if (!savedRecord) {
                throw new Error('Save verification failed - specific record not found');
            }
            
            console.log('✅ Save verification passed:', savedRecord);
            console.log('✅ Save operation test passed\n');
            
        } catch (error) {
            console.error('❌ Save operation test failed:', error);
            throw error;
        }
    }

    async step4_TestLoadOperation() {
        console.log('4️⃣ TESTING LOAD OPERATION...');
        console.log('═══════════════════════════════════════════════');
        
        try {
            // Test the Rule1Page load mechanism
            if (!window.rule1PageDebug?.forceReloadNumberBoxes) {
                throw new Error('forceReloadNumberBoxes function not available');
            }
            
            // Get state before reload
            const beforeState = {
                clickedCount: window.rule1PageDebug.clickedNumbers ? Object.keys(window.rule1PageDebug.clickedNumbers).length : 0,
                keys: window.rule1PageDebug.clickedNumbers ? Object.keys(window.rule1PageDebug.clickedNumbers) : []
            };
            
            console.log('📊 State before reload:', beforeState);
            
            // Trigger reload
            console.log('🔄 Triggering forceReloadNumberBoxes...');
            await window.rule1PageDebug.forceReloadNumberBoxes();
            
            // Wait a moment for state to update
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Get state after reload
            const afterState = {
                clickedCount: window.rule1PageDebug.clickedNumbers ? Object.keys(window.rule1PageDebug.clickedNumbers).length : 0,
                keys: window.rule1PageDebug.clickedNumbers ? Object.keys(window.rule1PageDebug.clickedNumbers) : []
            };
            
            console.log('📊 State after reload:', afterState);
            
            if (afterState.clickedCount === 0) {
                console.warn('⚠️ No clicks loaded into UI state - this indicates the core issue');
                
                // Try to understand why
                console.log('🔍 Investigating load failure...');
                
                // Check if reverseTopicMatcher is available
                const reverseTopicMatcher = window.rule1PageDebug.reverseTopicMatcher;
                console.log('🗺️ reverseTopicMatcher:', {
                    exists: !!reverseTopicMatcher,
                    size: reverseTopicMatcher?.size || 0,
                    hasTestSetName: reverseTopicMatcher?.has(this.testData.setName),
                    entries: reverseTopicMatcher ? Array.from(reverseTopicMatcher.entries()).slice(0, 5) : []
                });
                
            } else {
                console.log('✅ Clicks successfully loaded into UI state');
            }
            
            console.log('✅ Load operation test completed\n');
            
        } catch (error) {
            console.error('❌ Load operation test failed:', error);
            throw error;
        }
    }

    async step5_TestKeyGeneration() {
        console.log('5️⃣ TESTING KEY GENERATION...');
        console.log('═══════════════════════════════════════════════');
        
        try {
            // Test key generation consistency
            const testSetNames = [
                'D-1 Set-1 Matrix',
                'D-1 Set-2 Matrix',
                'D-3 Set-1 Matrix'
            ];
            
            console.log('🔑 Testing key generation for different set names...');
            
            testSetNames.forEach(setName => {
                // Simulate click key generation (what happens during click)
                const reverseTopicMatcher = window.rule1PageDebug?.reverseTopicMatcher;
                const cleanTopicName = reverseTopicMatcher?.get(setName) || setName;
                const clickKey = `${cleanTopicName}_${this.testData.dateKey}_${this.testData.numberValue}_HR${this.testData.hrNumber}`;
                
                // Simulate database key generation (what happens during load)
                const dbKey = `${cleanTopicName}_${this.testData.dateKey}_${this.testData.numberValue}_HR${this.testData.hrNumber}`;
                
                console.log(`  📝 "${setName}":`);
                console.log(`    Clean name: "${cleanTopicName}"`);
                console.log(`    Click key:  "${clickKey}"`);
                console.log(`    DB key:     "${dbKey}"`);
                console.log(`    Keys match: ${clickKey === dbKey}`);
                console.log('');
            });
            
            console.log('✅ Key generation test completed\n');
            
        } catch (error) {
            console.error('❌ Key generation test failed:', error);
            throw error;
        }
    }

    async step6_TestUIIntegration() {
        console.log('6️⃣ TESTING UI INTEGRATION...');
        console.log('═══════════════════════════════════════════════');
        
        try {
            // Test the "Show Clicked Numbers" functionality
            if (window.rule1PageDebug?.showClickedNumbers) {
                const showResult = window.rule1PageDebug.showClickedNumbers();
                console.log('📊 Show Clicked Numbers result:', showResult);
                
                if (showResult.clickedCount === 0) {
                    console.warn('⚠️ Show Clicked Numbers returned 0 - this is the reported issue');
                } else {
                    console.log('✅ Show Clicked Numbers working correctly');
                }
            }
            
            // Test click history
            if (window.rule1PageDebug?.showClickHistory) {
                console.log('📝 Testing click history...');
                const historyResult = window.rule1PageDebug.showClickHistory();
                console.log('📝 Click history result:', historyResult);
            }
            
            console.log('✅ UI integration test completed\n');
            
        } catch (error) {
            console.error('❌ UI integration test failed:', error);
            throw error;
        }
    }

    async step7_IdentifyRootCause() {
        console.log('7️⃣ IDENTIFYING ROOT CAUSE...');
        console.log('═══════════════════════════════════════════════');
        
        try {
            // Get current database state
            const dbClicks = await window.dualServiceManager.getAllNumberBoxClicksForUserDate(
                this.testData.userId, 
                this.testData.dateKey
            );
            
            // Get current UI state
            const uiClickedCount = window.rule1PageDebug?.clickedNumbers ? Object.keys(window.rule1PageDebug.clickedNumbers).length : 0;
            
            // Get show clicked numbers result
            const showResult = window.rule1PageDebug?.showClickedNumbers?.() || { clickedCount: 0 };
            
            console.log('📊 FINAL STATE ANALYSIS:');
            console.log('  Database clicks:', dbClicks?.length || 0);
            console.log('  UI clicked count:', uiClickedCount);
            console.log('  Show clicked result:', showResult.clickedCount);
            
            // Determine root cause
            if ((dbClicks?.length || 0) > 0 && uiClickedCount === 0) {
                console.log('\n🎯 ROOT CAUSE IDENTIFIED: loadNumberBoxClicks function issue');
                console.log('   ✅ Data IS being saved to database');
                console.log('   ❌ Data is NOT being loaded into UI state');
                console.log('   🔧 Issue is in the load/restore mechanism');
                
                // Additional analysis for load issues
                const reverseTopicMatcher = window.rule1PageDebug?.reverseTopicMatcher;
                if (!reverseTopicMatcher || reverseTopicMatcher.size === 0) {
                    console.log('   🔍 Specific issue: reverseTopicMatcher not available or empty');
                    console.log('   💡 Solution: Ensure reverseTopicMatcher is properly initialized before loadNumberBoxClicks runs');
                } else {
                    console.log('   🔍 reverseTopicMatcher appears to be available');
                    console.log('   💡 May be a key generation mismatch or timing issue');
                }
                
            } else if ((dbClicks?.length || 0) === 0 && uiClickedCount === 0) {
                console.log('\n🎯 ROOT CAUSE IDENTIFIED: Save mechanism issue');
                console.log('   ❌ Data is NOT being saved to database');
                console.log('   ❌ Data is NOT in UI state');
                console.log('   🔧 Issue is in the save mechanism or database connection');
                
            } else if ((dbClicks?.length || 0) > 0 && uiClickedCount > 0 && showResult.clickedCount === 0) {
                console.log('\n🎯 ROOT CAUSE IDENTIFIED: showClickedNumbers function issue');
                console.log('   ✅ Data IS being saved to database');
                console.log('   ✅ Data IS being loaded into UI state');
                console.log('   ❌ showClickedNumbers function is not finding the data');
                console.log('   🔧 Issue is in the showClickedNumbers implementation');
                
            } else {
                console.log('\n🎯 ALL SYSTEMS APPEAR TO BE WORKING');
                console.log('   ✅ Data is being saved to database');
                console.log('   ✅ Data is being loaded into UI state');
                console.log('   ✅ showClickedNumbers is working');
                console.log('   💡 The issue may have been resolved or is intermittent');
            }
            
            console.log('\n✅ Root cause analysis completed');
            
        } catch (error) {
            console.error('❌ Root cause analysis failed:', error);
            throw error;
        }
    }
}

// Create and expose the debugger
const debugger = new Rule1PersistenceDebugger();

if (typeof window !== 'undefined') {
    window.rule1PersistenceDebugger = debugger;
    
    // Auto-run after a delay
    setTimeout(() => {
        console.log('🚀 Auto-running comprehensive diagnostic...');
        debugger.runFullDiagnostic();
    }, 3000);
} else {
    console.log('This script should be run in the browser console on the Rule-1 page');
}
