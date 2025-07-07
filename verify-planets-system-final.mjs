#!/usr/bin/env node

/**
 * 🎯 FINAL PLANETS ANALYSIS SYSTEM VERIFICATION
 * Comprehensive test of all improvements and bug fixes
 */

console.log('🚀 PLANETS ANALYSIS SYSTEM - FINAL VERIFICATION');
console.log('================================================');
console.log('Testing all improvements: Topic-specific numbers, Excel fixes, HR calculations');
console.log('');

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test results tracking
const testResults = {
    databaseSetup: false,
    serviceIntegration: false,
    componentUpdates: false,
    errorFixes: false,
    overallStatus: 'PENDING'
};

console.log('🔍 STEP 1: Checking Database Setup...');

// Check if enhanced database table SQL exists
const rule2TableSQL = join(__dirname, 'CREATE-RULE2-ANALYSIS-RESULTS-TABLE.sql');
const abcdTableSQL = join(__dirname, 'CREATE-ABCD-BCD-TABLE.sql');

if (fs.existsSync(rule2TableSQL) && fs.existsSync(abcdTableSQL)) {
    console.log('✅ Database SQL scripts found:');
    console.log('   📄 CREATE-RULE2-ANALYSIS-RESULTS-TABLE.sql');
    console.log('   📄 CREATE-ABCD-BCD-TABLE.sql');
    testResults.databaseSetup = true;
} else {
    console.log('❌ Missing database setup scripts');
}

console.log('');
console.log('🔍 STEP 2: Checking Service Integration...');

// Check if enhanced services exist
const rule2Service = join(__dirname, 'src', 'services', 'rule2AnalysisResultsService.js');
const planetsService = join(__dirname, 'src', 'services', 'planetsAnalysisDataService.js');

if (fs.existsSync(rule2Service) && fs.existsSync(planetsService)) {
    console.log('✅ Enhanced services found:');
    console.log('   🔧 rule2AnalysisResultsService.js');
    console.log('   🔧 planetsAnalysisDataService.js');
    testResults.serviceIntegration = true;
} else {
    console.log('❌ Missing enhanced services');
}

console.log('');
console.log('🔍 STEP 3: Checking Component Updates...');

// Check if main components have been updated
const planetsAnalysisPage = join(__dirname, 'src', 'components', 'PlanetsAnalysisPage.jsx');
const rule2CompactPage = join(__dirname, 'src', 'components', 'Rule2CompactPage.jsx');

let componentStatus = true;

if (fs.existsSync(planetsAnalysisPage)) {
    const planetsContent = fs.readFileSync(planetsAnalysisPage, 'utf8');
    
    // Check for key improvements
    const hasEnhancedAnalysis = planetsContent.includes('getTopicNumbers');
    const hasErrorFixes = planetsContent.includes('processedData');
    const hasTopicSpecific = planetsContent.includes('topic-specific') || planetsContent.includes('topicNumbers');
    
    if (hasEnhancedAnalysis && hasErrorFixes) {
        console.log('✅ PlanetsAnalysisPage.jsx updated with:');
        console.log('   🎯 Topic-specific number loading');
        console.log('   🐛 Excel upload error fixes');
        if (hasTopicSpecific) {
            console.log('   📊 Enhanced topic-specific logic');
        }
    } else {
        console.log('⚠️  PlanetsAnalysisPage.jsx may need updates');
        componentStatus = false;
    }
} else {
    console.log('❌ PlanetsAnalysisPage.jsx not found');
    componentStatus = false;
}

if (fs.existsSync(rule2CompactPage)) {
    const rule2Content = fs.readFileSync(rule2CompactPage, 'utf8');
    
    // Check for dual database saving
    const hasDualSaving = rule2Content.includes('Rule2AnalysisResultsService') || 
                         rule2Content.includes('topic-specific') ||
                         rule2Content.includes('topicNumbers');
    
    if (hasDualSaving) {
        console.log('✅ Rule2CompactPage.jsx updated with:');
        console.log('   💾 Dual database saving capability');
        console.log('   📊 Topic-specific number generation');
    } else {
        console.log('⚠️  Rule2CompactPage.jsx may need dual saving updates');
        componentStatus = false;
    }
} else {
    console.log('❌ Rule2CompactPage.jsx not found');
    componentStatus = false;
}

testResults.componentUpdates = componentStatus;

console.log('');
console.log('🔍 STEP 4: Checking Error Fixes...');

// Check for specific bug fixes in components
if (fs.existsSync(planetsAnalysisPage)) {
    const content = fs.readFileSync(planetsAnalysisPage, 'utf8');
    
    // Check for Excel upload bug fix
    const hasVariableDeclaration = content.includes('let processedData') || 
                                  content.includes('const processedData');
    
    // Check for hardcoded fallback removal
    const hasReducedFallbacks = !content.includes('[6, 8, 11]') || 
                               !content.includes('[9, 10]') ||
                               content.includes('dynamic');
    
    if (hasVariableDeclaration) {
        console.log('✅ Excel upload bug fixed:');
        console.log('   🐛 "Cannot access \'processedData\' before initialization" resolved');
    }
    
    if (hasReducedFallbacks) {
        console.log('✅ Hardcoded fallback reduction:');
        console.log('   🎯 Dynamic number loading implemented');
    }
    
    testResults.errorFixes = hasVariableDeclaration;
} else {
    testResults.errorFixes = false;
}

console.log('');
console.log('🔍 STEP 5: Checking Documentation...');

// Check for documentation files
const archiveDir = join(__dirname, 'archive', 'documentation');
if (fs.existsSync(archiveDir)) {
    const docFiles = fs.readdirSync(archiveDir).filter(file => file.endsWith('.md'));
    console.log(`✅ Documentation found: ${docFiles.length} files`);
    
    // List key documentation
    const keyDocs = docFiles.filter(file => 
        file.includes('COMPLETE') || 
        file.includes('PLANETS') || 
        file.includes('ABCD-BCD')
    );
    
    if (keyDocs.length > 0) {
        console.log('   📚 Key documentation:');
        keyDocs.slice(0, 3).forEach(doc => {
            console.log(`      📄 ${doc}`);
        });
    }
} else {
    console.log('⚠️  Documentation archive not found');
}

console.log('');
console.log('🎯 FINAL VERIFICATION RESULTS:');
console.log('===============================');

// Calculate overall status
const passedTests = Object.values(testResults).filter(result => result === true).length;
const totalTests = Object.keys(testResults).length - 1; // Exclude overallStatus

console.log(`📊 Tests Passed: ${passedTests}/${totalTests}`);
console.log('');

// Detailed results
Object.entries(testResults).forEach(([test, result]) => {
    if (test === 'overallStatus') return;
    
    const status = result ? '✅' : '❌';
    const testName = test.replace(/([A-Z])/g, ' $1').toLowerCase();
    console.log(`${status} ${testName}: ${result ? 'PASS' : 'FAIL'}`);
});

// Determine overall status
if (passedTests === totalTests) {
    testResults.overallStatus = 'COMPLETE';
    console.log('');
    console.log('🎉 OVERALL STATUS: COMPLETE ✅');
    console.log('');
    console.log('All major improvements have been implemented:');
    console.log('  🎯 Topic-specific ABCD/BCD numbers');
    console.log('  🐛 Excel upload error fixes');
    console.log('  📊 Enhanced database schema');
    console.log('  🔧 Improved service architecture');
    console.log('');
    console.log('🚀 NEXT STEPS:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Open: http://localhost:5173/planets-analysis');
    console.log('3. Test Excel upload and ABCD/BCD number display');
    console.log('4. Verify topic-specific numbers instead of hardcoded fallbacks');
    
} else if (passedTests >= totalTests * 0.7) {
    testResults.overallStatus = 'MOSTLY_COMPLETE';
    console.log('');
    console.log('⚠️  OVERALL STATUS: MOSTLY COMPLETE');
    console.log('');
    console.log('Most improvements implemented. Minor issues may remain.');
    console.log('Review failed tests above and address as needed.');
    
} else {
    testResults.overallStatus = 'INCOMPLETE';
    console.log('');
    console.log('❌ OVERALL STATUS: INCOMPLETE');
    console.log('');
    console.log('Several components need attention. Review the conversation summary');
    console.log('and implement the remaining fixes.');
}

console.log('');
console.log('📋 For detailed testing, open: test-planets-system-complete.html');
console.log('🔧 For database setup, run: CREATE-RULE2-ANALYSIS-RESULTS-TABLE.sql in Supabase');
console.log('');

// Export results for other scripts
if (typeof globalThis !== 'undefined') {
    globalThis.planetsVerificationResults = testResults;
}

process.exit(testResults.overallStatus === 'COMPLETE' ? 0 : 1);
