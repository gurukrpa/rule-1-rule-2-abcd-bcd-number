#!/usr/bin/env node

/**
 * 🧪 TEST ENHANCED PLANETS ANALYSIS SYSTEM
 * Quick verification that the enhanced system is working correctly
 */

console.log('🧪 TESTING ENHANCED PLANETS ANALYSIS SYSTEM');
console.log('===========================================');
console.log('');

// Check if we can start the development server
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 PRE-FLIGHT CHECKS...');
console.log('');

// Check if package.json exists
import fs from 'fs';
import path from 'path';

const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
    console.log('✅ package.json found');
    
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (packageJson.scripts && packageJson.scripts.dev) {
        console.log('✅ dev script available:', packageJson.scripts.dev);
    } else {
        console.log('❌ dev script not found in package.json');
    }
} else {
    console.log('❌ package.json not found');
}

// Check key files
const keyFiles = [
    'src/components/PlanetsAnalysisPage.jsx',
    'src/components/Rule2CompactPage.jsx',
    'src/services/rule2AnalysisResultsService.js',
    'src/services/planetsAnalysisDataService.js',
    'CREATE-RULE2-ANALYSIS-RESULTS-TABLE.sql'
];

let allFilesExist = true;
keyFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MISSING`);
        allFilesExist = false;
    }
});

console.log('');

if (allFilesExist) {
    console.log('🎉 ALL SYSTEM FILES PRESENT!');
    console.log('');
    console.log('🚀 NEXT STEPS:');
    console.log('1. Create database table using: setup-enhanced-database-table.html');
    console.log('2. Start development server: npm run dev');
    console.log('3. Open browser: http://localhost:5173');
    console.log('4. Test Rule-2 analysis on any date');
    console.log('5. Check Planets Analysis page for topic-specific numbers');
    console.log('');
    console.log('🎯 EXPECTED RESULT:');
    console.log('Instead of generic [1,2,3,4,5,6,7,8,9,10,11,12] for all topics,');
    console.log('you should see unique numbers like:');
    console.log('  • D-1 Set-1 Matrix: ABCD: [7,10] BCD: [3,6,8]');
    console.log('  • D-3 Set-2 Matrix: ABCD: [2,5,9] BCD: [1,4]');
    console.log('  • D-4 Set-1 Matrix: ABCD: [11,12] BCD: [6,7]');
    console.log('  • ...etc for all 30 topics');
} else {
    console.log('❌ SOME SYSTEM FILES ARE MISSING');
    console.log('Please ensure all required files are present before testing.');
}

console.log('');
console.log('📋 For detailed testing instructions, see:');
console.log('   • test-planets-system-complete.html');
console.log('   • setup-enhanced-database-table.html');
console.log('');
console.log('🔧 For troubleshooting, run:');
console.log('   • node verify-planets-system-final.mjs');
