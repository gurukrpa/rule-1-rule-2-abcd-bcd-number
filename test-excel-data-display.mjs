#!/usr/bin/env node
// Test script to verify Excel data display for each date

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const USER_ID = 'sing maya';

console.log('🔍 TESTING EXCEL DATA DISPLAY FOR EACH DATE');
console.log('============================================');

async function testExcelDataDisplay() {
  try {
    // First, get all dates for the user
    const { data: userDatesData, error: userDatesError } = await supabase
      .from('user_dates_abcd')
      .select('dates')
      .eq('user_id', USER_ID)
      .single();

    if (userDatesError) {
      console.error('❌ Error fetching user dates:', userDatesError);
      return;
    }

    const userDates = userDatesData?.dates || [];
    console.log(`📅 User has ${userDates.length} dates:`, userDates);

    console.log('\n📊 CHECKING EXCEL DATA STATUS FOR EACH DATE:');
    console.log('============================================');

    // Check Excel data for each date
    for (const date of userDates) {
      console.log(`\n📅 DATE: ${date}`);
      
      // Check if Excel data exists
      const { data: excelData, error: excelError } = await supabase
        .from('excel_data')
        .select('date, file_name, created_at')
        .eq('user_id', USER_ID)
        .eq('date', date)
        .single();

      if (excelError && excelError.code !== 'PGRST116') {
        console.log(`   ❌ Excel data error: ${excelError.message}`);
      } else if (excelData) {
        console.log(`   ✅ Excel data: EXISTS`);
        console.log(`   📁 File name: ${excelData.file_name}`);
        console.log(`   🗓️  Created: ${new Date(excelData.created_at).toLocaleDateString()}`);
      } else {
        console.log(`   ❌ Excel data: NOT FOUND`);
      }

      // Check if Hour Entry exists
      const { data: hourData, error: hourError } = await supabase
        .from('hour_entries')
        .select('date_key, created_at')
        .eq('user_id', USER_ID)
        .eq('date_key', date)
        .single();

      if (hourError && hourError.code !== 'PGRST116') {
        console.log(`   ❌ Hour entry error: ${hourError.message}`);
      } else if (hourData) {
        console.log(`   ✅ Hour entry: EXISTS`);
        console.log(`   🗓️  Created: ${new Date(hourData.created_at).toLocaleDateString()}`);
      } else {
        console.log(`   ❌ Hour entry: NOT FOUND`);
      }

      // Status for UI display
      const excelStatus = excelData ? '✅ Excel ✓' : '📊 Excel';
      const hourStatus = hourData ? '✅ Hour Entry ✓' : '⏰ Hour Entry';
      
      console.log(`   📱 UI Status: ${excelStatus} | ${hourStatus}`);
    }

    console.log('\n🎯 SUMMARY FOR ABCD PAGE:');
    console.log('=========================');
    console.log('Each date should show:');
    console.log('- Excel button: "📊 Excel ✓" (green) if uploaded, "📊 Excel" (purple) if not');
    console.log('- Hour Entry button: "⏰ Hour Entry ✓" (blue) if completed, "⏰ Hour Entry" (blue) if not');
    console.log('- The checkmark (✓) indicates the data exists for that date');
    console.log('- This is the "Excel data display" you were asking about!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testExcelDataDisplay();
