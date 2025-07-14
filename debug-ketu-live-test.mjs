#!/usr/bin/env node

/**
 * Live Ketu Data Debugging Script for UserData Page
 * This script helps diagnose exactly where Ketu data fetching fails
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 LIVE KETU DEBUG - UserData Page Analysis');
console.log('=' .repeat(60));

// 1. Check UserData.jsx for Ketu handling
const userDataPath = './src/components/UserData.jsx';
console.log('\n1️⃣ Checking UserData.jsx Ketu handling...');

if (fs.existsSync(userDataPath)) {
    const userDataContent = fs.readFileSync(userDataPath, 'utf8');
    
    // Check for Excel upload handler
    const hasExcelUploadHandler = userDataContent.includes('handleExcelUpload');
    const hasKetuDebugging = userDataContent.includes('Ketu (Ke) data');
    const hasPlanetChangeHandler = userDataContent.includes('handlePlanetChange');
    
    console.log(`✅ handleExcelUpload exists: ${hasExcelUploadHandler}`);
    console.log(`✅ Ketu debugging logs exist: ${hasKetuDebugging}`);
    console.log(`✅ handlePlanetChange exists: ${hasPlanetChangeHandler}`);
    
    // Check for excelData state
    const hasExcelDataState = userDataContent.includes('setExcelData');
    const hasExcelDataUsage = userDataContent.includes('excelData[value]') || userDataContent.includes('excelData &&');
    
    console.log(`✅ excelData state management: ${hasExcelDataState}`);
    console.log(`✅ excelData usage in planet change: ${hasExcelDataUsage}`);
    
} else {
    console.log('❌ UserData.jsx not found!');
}

// 2. Check ExcelUpload.jsx for Ketu mapping
const excelUploadPath = './src/components/ExcelUpload.jsx';
console.log('\n2️⃣ Checking ExcelUpload.jsx Ketu mapping...');

if (fs.existsSync(excelUploadPath)) {
    const excelContent = fs.readFileSync(excelUploadPath, 'utf8');
    
    // Check for Ketu variations
    const ketuVariations = ['Ketu', 'Kethu', 'KETU', 'KETHU', 'ketu', 'kethu'];
    const foundVariations = ketuVariations.filter(variation => 
        excelContent.includes(`'${variation}'`) || excelContent.includes(`"${variation}"`)
    );
    
    console.log(`✅ Ketu variations mapped: ${foundVariations.join(', ')}`);
    
    // Check for case-insensitive matching
    const hasCaseInsensitive = excelContent.includes('toLowerCase()');
    console.log(`✅ Case-insensitive matching: ${hasCaseInsensitive}`);
    
    // Check for debugging logs
    const hasDetailedLogs = excelContent.includes('[ExcelUpload]') && excelContent.includes('Ketu');
    console.log(`✅ Detailed debugging logs: ${hasDetailedLogs}`);
    
} else {
    console.log('❌ ExcelUpload.jsx not found!');
}

// 3. Create a test Excel data structure
console.log('\n3️⃣ Creating test Excel data structure...');

const testExcelData = {
    'Lg': { 'D1': 'Ar', 'D2': 'Ta', 'D3': 'Ge' },
    'Su': { 'D1': 'Le', 'D2': 'Vi', 'D3': 'Li' },
    'Mo': { 'D1': 'Sc', 'D2': 'Sa', 'D3': 'Cp' },
    'Ma': { 'D1': 'Aq', 'D2': 'Pi', 'D3': 'Ar' },
    'Me': { 'D1': 'Ta', 'D2': 'Ge', 'D3': 'Ca' },
    'Ju': { 'D1': 'Le', 'D2': 'Vi', 'D3': 'Li' },
    'Ve': { 'D1': 'Sc', 'D2': 'Sa', 'D3': 'Cp' },
    'Sa': { 'D1': 'Aq', 'D2': 'Pi', 'D3': 'Ar' },
    'Ra': { 'D1': 'Ta', 'D2': 'Ge', 'D3': 'Ca' },
    'Ke': { 'D1': 'Sc', 'D2': 'Sa', 'D3': 'Cp', 'D4': 'Aq', 'D5': 'Pi' } // ✅ Ketu with test data
};

console.log('✅ Test Excel data created with Ketu (Ke) data:');
console.log('   - Ketu divisions:', Object.keys(testExcelData.Ke));
console.log('   - Sample Ketu values:', JSON.stringify(testExcelData.Ke, null, 2));

// 4. Test planet selection logic
console.log('\n4️⃣ Testing planet selection logic...');

function testPlanetSelection(excelData, selectedPlanet) {
    console.log(`\n🔍 Testing planet selection: "${selectedPlanet}"`);
    console.log(`  - Excel data exists: ${!!excelData}`);
    console.log(`  - Planet keys: ${Object.keys(excelData)}`);
    console.log(`  - Selected planet exists: ${!!excelData[selectedPlanet]}`);
    
    if (excelData[selectedPlanet]) {
        console.log(`  ✅ Planet data found:`, excelData[selectedPlanet]);
        console.log(`  ✅ Available divisions:`, Object.keys(excelData[selectedPlanet]));
        
        // Test division population
        const divisions = ['D1', 'D2', 'D3', 'D4', 'D5'];
        divisions.forEach(division => {
            const houseValue = excelData[selectedPlanet][division];
            if (houseValue) {
                console.log(`    📋 ${division}: "${houseValue}"`);
            } else {
                console.log(`    ⚠️ ${division}: undefined`);
            }
        });
    } else {
        console.log(`  ❌ No planet data found for "${selectedPlanet}"`);
        console.log(`  ❌ Available planets:`, Object.keys(excelData));
    }
}

// Test with our sample data
testPlanetSelection(testExcelData, 'Ke');
testPlanetSelection(testExcelData, 'Su');

// 5. Browser testing instructions
console.log('\n5️⃣ BROWSER TESTING INSTRUCTIONS');
console.log('=' .repeat(40));
console.log('1. Open browser to http://localhost:3000');
console.log('2. Navigate to UserData page');
console.log('3. Open browser console (F12 → Console)');
console.log('4. Upload an Excel file');
console.log('5. Look for these specific log messages:');
console.log('');
console.log('   🔍 During Excel upload:');
console.log('   - "[ExcelUpload] Found planet name: Ketu"');
console.log('   - "[ExcelUpload] Mapped to short code: Ke"');
console.log('   - "[UserData] Ketu (Ke) data found: {...}"');
console.log('');
console.log('   🔍 When selecting Ketu planet:');
console.log('   - "[UserData] Planet change: HR-X, Day-Y, Selected: Ke"');
console.log('   - "[UserData] Processing Excel data for planet: Ke"');
console.log('   - "[UserData] Found planet data for Ke: {...}"');
console.log('');
console.log('6. If you see error messages, copy them exactly');
console.log('');

// 6. Common issues checklist
console.log('6️⃣ COMMON ISSUES CHECKLIST');
console.log('=' .repeat(30));
console.log('❌ Excel file format:');
console.log('   - Ketu row missing or misspelled');
console.log('   - Ketu data in wrong column position');
console.log('   - Missing division headers');
console.log('');
console.log('❌ Browser console errors:');
console.log('   - JavaScript errors during upload');
console.log('   - Network errors to backend');
console.log('   - State management issues');
console.log('');
console.log('❌ Component communication:');
console.log('   - ExcelUpload not calling UserData callback');
console.log('   - UserData not receiving processed data');
console.log('   - Planet selection not accessing excelData');

console.log('\n🎯 NEXT STEPS:');
console.log('1. Test in browser with console open');
console.log('2. Copy any error messages you see');
console.log('3. Share the exact Excel file structure you\'re using');
console.log('4. Let me know which specific step fails');
