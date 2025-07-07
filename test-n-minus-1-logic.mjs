// test-n-minus-1-logic.mjs
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const userId = '5019aa9a-a653-49f5-b7da-f5bc9dcde985';

async function testClosestPreviousLogic() {
  console.log('🧪 Testing "Closest Available Previous Date" Logic');
  
  try {
    // Get all available dates (with complete data)
    const { data: excelData } = await supabase
      .from('excel_data')
      .select('date')
      .eq('user_id', userId)
      .order('date');
    
    const { data: hourData } = await supabase
      .from('hour_entries')
      .select('date_key')
      .eq('user_id', userId)
      .order('date_key');
    
    const excelDates = excelData.map(r => r.date);
    const hourDates = hourData.map(r => r.date_key);
    const availableDates = excelDates.filter(date => hourDates.includes(date));
    
    console.log('📅 Available dates with complete data:', availableDates);
    
    // Test cases
    const testCases = [
      '2025-07-08', // July 8th
      '2025-07-07', // July 7th  
      '2025-07-05', // July 5th (no data)
      '2025-07-22', // July 22nd (future)
      '2025-06-25', // June 25th (between dates)
    ];
    
    console.log('\n🧪 Test Results:');
    
    testCases.forEach(clickedDate => {
      // Find closest available date BEFORE the clicked date
      const sortedDates = [...availableDates].sort((a, b) => new Date(a) - new Date(b));
      
      let closestPreviousDate = null;
      for (let i = sortedDates.length - 1; i >= 0; i--) {
        if (new Date(sortedDates[i]) < new Date(clickedDate)) {
          closestPreviousDate = sortedDates[i];
          break;
        }
      }
      
      console.log(`  📅 ${clickedDate} → ${closestPreviousDate || 'No previous data'}`);
    });
    
    // Test the current PlanetsAnalysisPage logic to see what it's doing wrong
    console.log('\n🔍 Current PlanetsAnalysisPage Logic Analysis:');
    console.log('Available dates:', availableDates);
    console.log('Expected for July 8th click:', '2025-07-07');
    console.log('Expected for July 7th click:', '2025-07-03');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

testClosestPreviousLogic();
