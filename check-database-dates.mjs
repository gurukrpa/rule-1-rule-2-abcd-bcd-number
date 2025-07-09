#!/usr/bin/env node

import { supabase } from './src/supabaseClient.js';

async function checkDatabaseDates() {
  console.log('🔍 Checking all dates in database tables...');
  
  try {
    // Check user_dates_abcd table
    console.log('\n📅 1. Checking user_dates_abcd table...');
    const { data: userDatesData, error: userDatesError } = await supabase
      .from('user_dates_abcd')
      .select('*');
      
    if (userDatesError) {
      console.error('❌ Error fetching user_dates_abcd:', userDatesError);
    } else {
      console.log(`📊 Found ${userDatesData?.length || 0} entries in user_dates_abcd`);
      userDatesData?.forEach(entry => {
        const dates = Array.isArray(entry.dates) ? entry.dates : [];
        console.log(`  👤 User ${entry.user_id}: ${dates.length} dates`);
        console.log(`    📅 Dates: ${dates.slice(0, 10).join(', ')}${dates.length > 10 ? '...' : ''}`);
      });
    }

    // Check excel_uploads table
    console.log('\n📊 2. Checking excel_uploads table...');
    const { data: excelData, error: excelError } = await supabase
      .from('excel_uploads')
      .select('user_id, date, created_at')
      .order('date', { ascending: true });
      
    if (excelError) {
      console.error('❌ Error fetching excel_uploads:', excelError);
    } else {
      console.log(`📊 Found ${excelData?.length || 0} Excel uploads`);
      
      // Group by user
      const byUser = excelData?.reduce((acc, entry) => {
        if (!acc[entry.user_id]) acc[entry.user_id] = [];
        acc[entry.user_id].push(entry.date);
        return acc;
      }, {}) || {};
      
      Object.entries(byUser).forEach(([userId, dates]) => {
        console.log(`  👤 User ${userId}: ${dates.length} Excel uploads`);
        console.log(`    📅 Dates: ${dates.slice(0, 10).join(', ')}${dates.length > 10 ? '...' : ''}`);
      });
    }

    // Check hour_entries table
    console.log('\n⏰ 3. Checking hour_entries table...');
    const { data: hourData, error: hourError } = await supabase
      .from('hour_entries')
      .select('user_id, date, created_at')
      .order('date', { ascending: true });
      
    if (hourError) {
      console.error('❌ Error fetching hour_entries:', hourError);
    } else {
      console.log(`📊 Found ${hourData?.length || 0} hour entries`);
      
      // Group by user
      const byUser = hourData?.reduce((acc, entry) => {
        if (!acc[entry.user_id]) acc[entry.user_id] = [];
        acc[entry.user_id].push(entry.date);
        return acc;
      }, {}) || {};
      
      Object.entries(byUser).forEach(([userId, dates]) => {
        console.log(`  👤 User ${userId}: ${dates.length} hour entries`);
        console.log(`    📅 Dates: ${dates.slice(0, 10).join(', ')}${dates.length > 10 ? '...' : ''}`);
      });
    }

    // Check rule2_analysis_results table
    console.log('\n🧮 4. Checking rule2_analysis_results table...');
    const { data: analysisData, error: analysisError } = await supabase
      .from('rule2_analysis_results')
      .select('user_id, analysis_date, trigger_date, created_at')
      .order('analysis_date', { ascending: true });
      
    if (analysisError) {
      console.error('❌ Error fetching rule2_analysis_results:', analysisError);
    } else {
      console.log(`📊 Found ${analysisData?.length || 0} analysis results`);
      
      // Group by user
      const byUser = analysisData?.reduce((acc, entry) => {
        if (!acc[entry.user_id]) acc[entry.user_id] = [];
        acc[entry.user_id].push(entry.analysis_date);
        return acc;
      }, {}) || {};
      
      Object.entries(byUser).forEach(([userId, dates]) => {
        console.log(`  👤 User ${userId}: ${dates.length} analysis results`);
        console.log(`    📅 Dates: ${dates.slice(0, 10).join(', ')}${dates.length > 10 ? '...' : ''}`);
      });
    }

    // Summary
    console.log('\n📋 SUMMARY:');
    console.log('If you see dates that should have been deleted, you can use the cleanup script to remove them.');
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
  }
  
  process.exit(0);
}

checkDatabaseDates().catch(console.error);
