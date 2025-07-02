#!/usr/bin/env node

/**
 * Check if there's any real analysis data available from Past Days or Rule-2 calculations
 * This helps determine what data sources we have beyond the fallback values
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 CHECKING FOR REAL ANALYSIS DATA');
console.log('=================================');

// Check if there are any existing data files or calculations
const workspaceRoot = '/Volumes/t7 sharma/vs coad/rule-1-rule-2-abcd-bcd-number-main';

console.log('📊 Checking for data indicators...');

// Look for data files that might contain real analysis
const dataIndicators = [
  'allDaysData',
  'abcdBcdAnalysis', 
  'extractedNumbers',
  'analysisResults'
];

// Check localStorage simulation files
const possibleDataFiles = [
  'src/data',
  'public/data',
  'data',
  '.data'
];

let foundDataSources = [];

// Check for service files that handle real data
const serviceFiles = [
  'src/services/planetsAnalysisDataService.js',
  'src/services/abcdBcdDatabaseService.js',
  'src/services/dataService.js'
];

console.log('\n📁 Available Data Services:');
serviceFiles.forEach(file => {
  const fullPath = path.join(workspaceRoot, file);
  if (fs.existsSync(fullPath)) {
    console.log(`   ✅ ${file} - Available`);
    foundDataSources.push(file);
  } else {
    console.log(`   ❌ ${file} - Not found`);
  }
});

// Check package.json for data-related scripts
const packageJsonPath = path.join(workspaceRoot, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  console.log('\n📦 Available NPM Scripts:');
  Object.keys(packageJson.scripts || {}).forEach(script => {
    console.log(`   • npm run ${script}: ${packageJson.scripts[script]}`);
  });
}

// Check for analysis or diagnostic files
const analysisFiles = fs.readdirSync(workspaceRoot)
  .filter(file => 
    file.includes('analysis') || 
    file.includes('diagnostic') || 
    file.includes('data') ||
    file.includes('abcd') ||
    file.includes('planets')
  )
  .slice(0, 10); // Show first 10

console.log('\n📋 Analysis/Data Related Files:');
analysisFiles.forEach(file => {
  console.log(`   • ${file}`);
});

console.log('\n🎯 REAL DATA ACCESS METHODS:');
console.log('==========================');

console.log('\n1️⃣ DATABASE METHOD (Recommended):');
console.log('   • Go to http://localhost:5173');
console.log('   • Navigate to Planets Analysis page'); 
console.log('   • Click "🔄 Refresh Database" button');
console.log('   • This loads from Supabase database if available');

console.log('\n2️⃣ EXCEL UPLOAD METHOD:');
console.log('   • Upload Excel file with real data');
console.log('   • System will calculate ABCD/BCD numbers from Excel');
console.log('   • This replaces fallback values with real calculations');

console.log('\n3️⃣ PAST DAYS ANALYSIS METHOD:');
console.log('   • Go to Index page with Past Days data');
console.log('   • Load Excel data for multiple days (A, B, C, D)');
console.log('   • System will perform ABCD/BCD analysis');
console.log('   • Navigate to Planets Analysis to see results');

console.log('\n4️⃣ RULE-2 ANALYSIS METHOD:');
console.log('   • Go to Rule-2 page');
console.log('   • Upload Excel data or load existing data');
console.log('   • Perform Rule-2 analysis');
console.log('   • Use results in Planets Analysis');

console.log('\n🔍 CURRENT STATUS:');
console.log('You are seeing FALLBACK values: D-1 Set-1 Matrix shows [10, 12], [4, 11]');
console.log('This means the system has NOT yet loaded real calculated data');

console.log('\n⚡ QUICKEST SOLUTION:');
console.log('1. Keep browser open at http://localhost:5173');
console.log('2. Go to Planets Analysis page');
console.log('3. Look for yellow warning box');
console.log('4. Click "🔄 Refresh Database" button');
console.log('5. If no database data, upload Excel file instead');

if (foundDataSources.length > 0) {
  console.log('\n✅ Good news: Data services are available in your project');
  console.log('   The infrastructure is ready to load real data');
} else {
  console.log('\n⚠️  Warning: Some data services may be missing');
  console.log('   Check if services are properly set up');
}
