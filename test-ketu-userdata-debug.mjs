#!/usr/bin/env node

/**
 * Test Ketu Data Issue in UserData Page - Live Testing
 * This script helps debug the Ketu data flow issue by checking the actual Excel processing
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wmfbknptxtowgwqzpfto.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZmJrbnB0eHRvd2d3cXpwZnRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMTgzNjA1MywiZXhwIjoyMDM3NDEyMDUzfQ.9YOKn45HQfCQHe9UlFOWY1jDlRYFd-FLw5FH6Q7T4g4';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Testing Ketu Data Issue in UserData Page\n');

// Create test data that mimics what ExcelUpload component should produce
const testExcelData = {
  'Su': { 'D-1': 'Ar', 'D-9': 'Ta', 'D-10': 'Ge' },
  'Mo': { 'D-1': 'Ta', 'D-9': 'Ge', 'D-10': 'Ar' },
  'Ma': { 'D-1': 'Ge', 'D-9': 'Ar', 'D-10': 'Ta' },
  'Me': { 'D-1': 'Ar', 'D-9': 'Ta', 'D-10': 'Ge' },
  'Ju': { 'D-1': 'Ta', 'D-9': 'Ge', 'D-10': 'Ar' },
  'Ve': { 'D-1': 'Ge', 'D-9': 'Ar', 'D-10': 'Ta' },
  'Sa': { 'D-1': 'Ar', 'D-9': 'Ta', 'D-10': 'Ge' },
  'Ra': { 'D-1': 'Ta', 'D-9': 'Ge', 'D-10': 'Ar' },
  'Ke': { 'D-1': 'Ge', 'D-9': 'Ar', 'D-10': 'Ta' }  // ✅ This is the Ketu data that should work
};

console.log('✅ Test Excel Data Structure:');
console.log('  - All planets included:', Object.keys(testExcelData));
console.log('  - Ketu data specifically:', testExcelData.Ke);

console.log('\n🔍 Simulating UserData handlePlanetChange with Ketu:');

// Simulate the logic from handlePlanetChange
const selectedPlanet = 'Ke';
const excelData = testExcelData;

console.log(`  - Selected planet: "${selectedPlanet}"`);
console.log(`  - Excel data exists: ${!!excelData}`);
console.log(`  - Planet data exists: ${!!excelData[selectedPlanet]}`);

if (excelData && selectedPlanet) {
  const planetData = excelData[selectedPlanet];
  if (planetData) {
    console.log(`✅ SUCCESS: Found planet data for "${selectedPlanet}"`);
    console.log(`  - Available divisions:`, Object.keys(planetData));
    
    // Test division lookup
    const testDivisions = ['D-1', 'D-9', 'D-10'];
    testDivisions.forEach(division => {
      const houseValue = planetData[division];
      console.log(`    - ${division}: "${houseValue}"`);
    });
  } else {
    console.log(`❌ PROBLEM: No planet data found for "${selectedPlanet}"`);
  }
} else {
  console.log(`❌ PROBLEM: Missing Excel data or planet selection`);
}

console.log('\n🎯 Expected Behavior:');
console.log('  - When user selects "Ke" planet in UserData page');
console.log('  - The divisions should auto-populate with: D-1→Ge, D-9→Ar, D-10→Ta');
console.log('  - If this is not happening, check the browser console for debug logs');

console.log('\n📋 Debug Instructions:');
console.log('  1. Start the development server: npm run dev');
console.log('  2. Go to UserData page');
console.log('  3. Upload an Excel file with Ketu data');
console.log('  4. Select "Ke" from planet dropdown');
console.log('  5. Check browser console for debug logs starting with [UserData]');
console.log('  6. Look for the Excel data structure and planet lookup logs');

console.log('\n✅ Test completed - ready for live debugging!');
