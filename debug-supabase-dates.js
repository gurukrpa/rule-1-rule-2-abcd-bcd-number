#!/usr/bin/env node

// Node.js script to verify the CleanSupabaseService date retrieval
// This will help us understand if the issue is in the service layer

const { createClient } = require('@supabase/supabase-js');

// Configuration (replace with actual values if needed)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

async function debugDateRetrieval() {
  console.log('🔍 Debug: CleanSupabaseService Date Retrieval');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const userId = 'sing maya';
    
    console.log('📊 Checking Supabase tables for user:', userId);
    
    // Check user_dates table
    console.log('\n1. Checking user_dates table:');
    const { data: userDates, error: userDatesError } = await supabase
      .from('user_dates')
      .select('*')
      .eq('user_id', userId);
    
    if (userDatesError) {
      console.log('❌ Error querying user_dates:', userDatesError.message);
    } else {
      console.log('✅ user_dates result:', userDates);
    }
    
    // Check user_dates_abcd table
    console.log('\n2. Checking user_dates_abcd table:');
    const { data: userDatesAbcd, error: userDatesAbcdError } = await supabase
      .from('user_dates_abcd')
      .select('*')
      .eq('user_id', userId);
    
    if (userDatesAbcdError) {
      console.log('❌ Error querying user_dates_abcd:', userDatesAbcdError.message);
    } else {
      console.log('✅ user_dates_abcd result:', userDatesAbcd);
    }
    
    // Check excel_data table for available dates
    console.log('\n3. Checking excel_data table for available dates:');
    const { data: excelData, error: excelError } = await supabase
      .from('excel_data')
      .select('date')
      .eq('user_id', userId);
    
    if (excelError) {
      console.log('❌ Error querying excel_data:', excelError.message);
    } else {
      const excelDates = excelData ? excelData.map(row => row.date) : [];
      console.log('✅ excel_data dates:', excelDates);
    }
    
    // Check hour_entries table for available dates
    console.log('\n4. Checking hour_entries table for available dates:');
    const { data: hourEntries, error: hourError } = await supabase
      .from('hour_entries')
      .select('date_key')
      .eq('user_id', userId);
    
    if (hourError) {
      console.log('❌ Error querying hour_entries:', hourError.message);
    } else {
      const hourDates = hourEntries ? hourEntries.map(row => row.date_key) : [];
      console.log('✅ hour_entries dates:', hourDates);
    }
    
    console.log('\n📊 Summary:');
    console.log('This script helps identify where the dates are actually stored');
    console.log('and why PlanetsAnalysisPage might not be finding them.');
    
  } catch (error) {
    console.log('❌ Error in debug script:', error.message);
    console.log('💡 This might indicate Supabase connection issues');
    console.log('   Try checking environment variables or network connection');
  }
}

// Run if executed directly
if (require.main === module) {
  debugDateRetrieval();
}

module.exports = { debugDateRetrieval };
