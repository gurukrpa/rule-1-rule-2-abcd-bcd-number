#!/usr/bin/env node

// test-rule2-planets-fix.mjs
// Quick verification that Rule2 → Planets integration is working

console.log('🎯 Testing Rule2 → Planets Integration');
console.log('=====================================');

// Check if our changes are in place
import { readFileSync } from 'fs';
import path from 'path';

const planetsAnalysisPath = '/Volumes/t7 sharma/vs coad/rule-1-rule-2-abcd-bcd-number-main/src/components/PlanetsAnalysisPage.jsx';

try {
    const planetsContent = readFileSync(planetsAnalysisPath, 'utf8');
    
    console.log('📋 Checking PlanetsAnalysisPage.jsx modifications...');
    
    // Check for our modifications
    const checks = [
        {
            name: 'Real analysis data state',
            pattern: /const \[realAnalysisData, setRealAnalysisData\]/,
            found: planetsContent.includes('realAnalysisData')
        },
        {
            name: 'Priority system in getTopicNumbers',
            pattern: /Priority 1: Use real analysis data/,
            found: planetsContent.includes('Priority 1: Use real analysis data')
        },
        {
            name: 'Rule2 analysis service import',
            pattern: /PlanetsAnalysisDataService/,
            found: planetsContent.includes('PlanetsAnalysisDataService')
        },
        {
            name: 'Real analysis status display',
            pattern: /REAL ANALYSIS ACTIVE/,
            found: planetsContent.includes('REAL ANALYSIS ACTIVE')
        },
        {
            name: 'D-1 Set-1 verification section',
            pattern: /D-1 Set-1 Matrix Verification/,
            found: planetsContent.includes('D-1 Set-1 Matrix Verification')
        },
        {
            name: 'Refresh Rule2 Analysis button',
            pattern: /Refresh Rule2 Analysis/,
            found: planetsContent.includes('Refresh Rule2 Analysis')
        }
    ];
    
    let passedChecks = 0;
    checks.forEach(check => {
        if (check.found) {
            console.log(`✅ ${check.name}`);
            passedChecks++;
        } else {
            console.log(`❌ ${check.name}`);
        }
    });
    
    console.log(`\n📊 Modification Check: ${passedChecks}/${checks.length} passed`);
    
    if (passedChecks === checks.length) {
        console.log('\n🎉 SUCCESS: All modifications are in place!');
        console.log('\n📋 Next Steps:');
        console.log('1. Navigate to: http://localhost:5173');
        console.log('2. Go to PlanetsAnalysisPage for any user');
        console.log('3. Click "🎯 Refresh Rule2 Analysis" button');
        console.log('4. Check that status shows "🎯 REAL ANALYSIS ACTIVE"');
        console.log('5. Verify D-1 Set-1 Matrix shows: ABCD [1,2,4,7,9], BCD [5]');
        console.log('\n🔍 Expected Result:');
        console.log('   Before: D-1 Set-1 shows fallback ABCD [10, 12], BCD [4, 11]');
        console.log('   After:  D-1 Set-1 shows real    ABCD [1,2,4,7,9], BCD [5]');
    } else {
        console.log('\n❌ ISSUE: Some modifications are missing');
        console.log('Please review the file and ensure all changes were applied correctly.');
    }
    
    console.log('\n📁 Modified file: ' + planetsAnalysisPath);
    console.log('📁 Test guide: file:///Volumes/t7%20sharma/vs%20coad/rule-1-rule-2-abcd-bcd-number-main/test-rule2-planets-integration.html');
    
} catch (error) {
    console.error('❌ Error reading file:', error.message);
    process.exit(1);
}

console.log('\n🔄 Server should be running at: http://localhost:5173');
console.log('🎯 Ready for manual testing!');
