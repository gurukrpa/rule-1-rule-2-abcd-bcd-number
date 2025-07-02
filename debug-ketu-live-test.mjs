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

console.log('\n🎯 BROWSER TESTING STEPS:');
console.log('1. Open http://localhost:3000 → UserData page');
console.log('2. Open browser console (F12 → Console)');
console.log('3. Upload Excel file and watch for:');
console.log('   - "[ExcelUpload] Found planet name: Ketu"');
console.log('   - "[UserData] Ketu (Ke) data found"');
console.log('4. Select Ketu from planet dropdown and watch for:');
console.log('   - "[UserData] Processing Excel data for planet: Ke"');
console.log('   - Division dropdowns should populate');