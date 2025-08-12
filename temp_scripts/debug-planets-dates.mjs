// debug-planets-dates.mjs
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

async function debugPlanetsDateLogic() {
  console.log('🔍 Debugging Planets Analysis date selection logic...');
  console.log('👤 User ID:', userId);
  console.log('🎯 Simulating July 8th click behavior');
  
  const selectedDate = '2025-07-08'; // User clicks July 8th
  
  try {
    // Step 1: Check localStorage (what ABCD page stores locally)
    console.log('\n📦 Step 1: Check localStorage equivalent...');
    const abcdDates = ['2025-07-03', '2025-07-07', '2025-07-08']; // From ABCD page
    console.log('Local ABCD dates:', abcdDates);
    
    // Step 2: Check what CleanSupabaseServiceWithSeparateStorage returns
    console.log('\n🗄️ Step 2: Check CleanSupabaseServiceWithSeparateStorage (ABCD context)...');
    const { data: abcdTableData, error: abcdError } = await supabase
      .from('user_dates_abcd')
      .select('dates')
      .eq('user_id', userId)
      .single();
    
    if (abcdError) {
      console.log('❌ Error reading user_dates_abcd:', abcdError.message);
    } else {
      console.log('✅ user_dates_abcd dates:', abcdTableData.dates);
    }
    
    // Step 3: Check what's available in excel_data + hour_entries (what PlanetsAnalysis actually uses)
    console.log('\n📊 Step 3: Check actual data availability for RealTimeRule2AnalysisService...');
    
    // Get excel data dates
    const { data: excelData, error: excelError } = await supabase
      .from('excel_data')
      .select('date')
      .eq('user_id', userId)
      .order('date', { ascending: true });
    
    // Get hour entry dates
    const { data: hourData, error: hourError } = await supabase
      .from('hour_entries')
      .select('date_key')
      .eq('user_id', userId)
      .order('date_key', { ascending: true });
    
    if (excelError || hourError) {
      console.log('❌ Error reading data tables');
      return;
    }
    
    const excelDates = excelData.map(r => r.date);
    const hourDates = hourData.map(r => r.date_key);
    
    // Find dates with complete data (both Excel + Hour Entry)
    const completeDates = excelDates.filter(date => hourDates.includes(date));
    
    console.log('📅 Excel dates:', excelDates);
    console.log('⏰ Hour entry dates:', hourDates);
    console.log('✅ Complete dates (Excel + Hour):', completeDates);
    
    // Step 4: Simulate the "closest previous date" logic
    console.log('\n🎯 Step 4: Simulate "closest previous date" logic...');
    console.log('Selected date (clicked):', selectedDate);
    console.log('Available complete dates:', completeDates);
    
    const sortedDates = [...completeDates].sort((a, b) => new Date(a) - new Date(b));
    console.log('Sorted available dates:', sortedDates);
    
    // Find closest previous date
    let closestPreviousDate = null;
    for (let i = sortedDates.length - 1; i >= 0; i--) {
      if (new Date(sortedDates[i]) < new Date(selectedDate)) {
        closestPreviousDate = sortedDates[i];
        break;
      }
    }
    
    // Check if exact date is available
    const exactDateAvailable = sortedDates.includes(selectedDate);
    
    console.log('\n📊 Results:');
    console.log('Exact date available:', exactDateAvailable ? '✅' : '❌', `(${selectedDate})`);
    console.log('Closest previous date:', closestPreviousDate || 'None');
    
    if (exactDateAvailable) {
      console.log('🎯 SHOULD USE: ', selectedDate, '(exact match)');
    } else if (closestPreviousDate) {
      console.log('🎯 SHOULD USE:', closestPreviousDate, '(closest previous)');
    } else {
      console.log('❌ NO DATA AVAILABLE');
    }
    
    // Step 5: Check why July 7 shows June 30
    console.log('\n🚨 July 7th analysis:');
    const july7 = '2025-07-07';
    const july7Available = sortedDates.includes(july7);
    let july7Previous = null;
    for (let i = sortedDates.length - 1; i >= 0; i--) {
      if (new Date(sortedDates[i]) < new Date(july7)) {
        july7Previous = sortedDates[i];
        break;
      }
    }
    
    console.log(`July 7 exact available: ${july7Available ? '✅' : '❌'}`);
    console.log(`July 7 closest previous: ${july7Previous || 'None'}`);
    
    if (july7Available) {
      console.log('🎯 July 7 SHOULD USE:', july7);
    } else {
      console.log('🎯 July 7 SHOULD USE:', july7Previous || 'No data');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

debugPlanetsDateLogic();
