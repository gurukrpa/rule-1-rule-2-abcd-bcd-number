// test-fixed-date-logic.mjs
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const userId = '5019aa9a-a653-49f5-b7da-f5bc9dcde985';

// Simulate the NEW fixed logic
function simulateFixedDateLogic(availableDates, selectedDate) {
  console.log(`\n🧪 Testing date selection logic:`);
  console.log(`   Input: selectedDate = ${selectedDate}`);
  console.log(`   Available dates: [${availableDates.join(', ')}]`);
  
  const sortedDates = [...availableDates].sort((a, b) => new Date(a) - new Date(b));
  
  // ✅ NEW LOGIC: Use exact date if available, otherwise closest previous
  const exactDateAvailable = sortedDates.includes(selectedDate);
  
  let dateForAnalysis;
  if (exactDateAvailable) {
    // Use exact date when available
    dateForAnalysis = selectedDate;
    console.log(`   Result: ✅ Using exact date: ${dateForAnalysis}`);
  } else {
    // Find the closest date BEFORE the selected date
    const selectedDateObj = new Date(selectedDate);
    let closestPreviousDate = null;
    for (let i = sortedDates.length - 1; i >= 0; i--) {
      const availableDate = new Date(sortedDates[i]);
      if (availableDate < selectedDateObj) {
        closestPreviousDate = sortedDates[i];
        break;
      }
    }
    
    if (closestPreviousDate) {
      dateForAnalysis = closestPreviousDate;
      console.log(`   Result: 🎯 Using closest previous date: ${dateForAnalysis}`);
    } else {
      // No previous dates, use latest available as last resort
      dateForAnalysis = sortedDates[sortedDates.length - 1];
      console.log(`   Result: ⚠️ Using latest available: ${dateForAnalysis}`);
    }
  }
  
  return dateForAnalysis;
}

async function testFixedLogic() {
  console.log('🧪 Testing the FIXED date selection logic...');
  
  try {
    // Get actual available dates from database
    const { data: abcdData, error: abcdError } = await supabase
      .from('user_dates_abcd')
      .select('dates')
      .eq('user_id', userId)
      .single();
    
    if (abcdError) {
      console.log('❌ Error reading dates:', abcdError.message);
      return;
    }
    
    const availableDates = abcdData.dates;
    console.log('📅 Available dates from database:', availableDates);
    
    // Test cases that should work correctly now
    const testCases = [
      { date: '2025-07-07', expected: '2025-07-07', description: 'July 7 exact match' },
      { date: '2025-07-08', expected: '2025-07-08', description: 'July 8 exact match' },
      { date: '2025-07-03', expected: '2025-07-03', description: 'July 3 exact match' },
      { date: '2025-07-06', expected: '2025-07-03', description: 'July 6 (not available) → closest previous' },
      { date: '2025-07-09', expected: '2025-07-08', description: 'July 9 (future) → closest previous' },
      { date: '2025-06-29', expected: '2025-06-26', description: 'June 29 → closest previous' }
    ];
    
    console.log('\n🧪 Running test cases:');
    let passedTests = 0;
    let failedTests = 0;
    
    testCases.forEach(testCase => {
      const result = simulateFixedDateLogic(availableDates, testCase.date);
      const passed = result === testCase.expected;
      
      console.log(`\n   ${passed ? '✅ PASS' : '❌ FAIL'}: ${testCase.description}`);
      console.log(`      Expected: ${testCase.expected}`);
      console.log(`      Got:      ${result}`);
      
      if (passed) {
        passedTests++;
      } else {
        failedTests++;
      }
    });
    
    console.log(`\n📊 Test Results: ${passedTests} passed, ${failedTests} failed`);
    
    if (failedTests === 0) {
      console.log('🎉 All tests passed! The fix should work correctly.');
      console.log('\n✅ Expected behavior:');
      console.log('   - July 7 click → July 7 data (exact match)');
      console.log('   - July 8 click → July 8 data (exact match)');
      console.log('   - Missing dates → closest previous date');
    } else {
      console.log('⚠️ Some tests failed. The logic may need further adjustment.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

testFixedLogic();
