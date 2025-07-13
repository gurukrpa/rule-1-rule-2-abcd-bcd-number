// debug-data-check.mjs
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
const userId = '5019aa9a-a653-49f5-b7da-f5bc9dcde985'; // User from ABCD table

async function checkActualData() {
  console.log('🔍 Checking actual Excel and Hour Entry data...');
  console.log('👤 User ID:', userId);
  
  try {
    // Check Excel data
    console.log('\n📊 Checking excel_data table...');
    const { data: excelData, error: excelError } = await supabase
      .from('excel_data')
      .select('date, file_name')
      .eq('user_id', userId)
      .order('date', { ascending: true });
    
    if (excelError) {
      console.log('❌ excel_data error:', excelError.message);
    } else {
      console.log('✅ excel_data found:', excelData.length, 'records');
      excelData.forEach(record => {
        console.log(`  📅 ${record.date}: ${record.file_name}`);
      });
    }
    
    // Check Hour Entry data
    console.log('\n⏰ Checking hour_entries table...');
    const { data: hourData, error: hourError } = await supabase
      .from('hour_entries')
      .select('date_key')
      .eq('user_id', userId)
      .order('date_key', { ascending: true });
    
    if (hourError) {
      console.log('❌ hour_entries error:', hourError.message);
    } else {
      console.log('✅ hour_entries found:', hourData.length, 'records');
      hourData.forEach(record => {
        console.log(`  ⏰ ${record.date_key}`);
      });
    }
    
    // Show the data gap
    console.log('\n🔍 Analysis:');
    const abcdDates = ['2025-07-03', '2025-07-07', '2025-07-08'];
    const excelDates = excelData.map(r => r.date);
    const hourDates = hourData.map(r => r.date_key);
    
    console.log('📅 ABCD page dates:', abcdDates);
    console.log('📊 Excel data dates:', excelDates);
    console.log('⏰ Hour entry dates:', hourDates);
    
    console.log('\n🚨 Missing data analysis:');
    abcdDates.forEach(date => {
      const hasExcel = excelDates.includes(date);
      const hasHour = hourDates.includes(date);
      const hasComplete = hasExcel && hasHour;
      console.log(`  ${date}: Excel=${hasExcel ? '✅' : '❌'}, Hour=${hasHour ? '✅' : '❌'}, Complete=${hasComplete ? '✅' : '❌'}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking data:', error);
  }
  
  process.exit(0);
}

checkActualData();
