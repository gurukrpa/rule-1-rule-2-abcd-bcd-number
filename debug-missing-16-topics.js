#!/usr/bin/env node

/**
 * CRITICAL DEBUGGING: Missing 16 Topics Issue
 * 
 * PROBLEM: User 2dc97157-e7d5-43b2-93b2-ee3c6252b3dd shows only 14 topics instead of 30
 * Expected: 30 topics (15 D-numbers × 2 sets each)
 * Showing: Only 14 topics (7 D-number groups)
 * Missing: D-3, D-5, D-7, D-10, D-12, D-27, D-30, D-60 topic groups
 * 
 * This script debugs the CleanSupabaseService data retrieval pipeline
 */

console.log('🔍 CRITICAL DEBUGGING: Missing 16 Topics Issue');
console.log('===================================================');

// Use dynamic import to handle ES modules in Node.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zndkprjytuhzufdqhnmt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuZGtwcmp5dHVoenVmZHFobm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0OTg5OTgsImV4cCI6MjA1OTA3NDk5OH0._1xM__KPGNlr3HG3-An2fy3kKfIxWU-AXJnrMpdWYok';

const supabase = createClient(supabaseUrl, supabaseKey);

const TARGET_USER = '2dc97157-e7d5-43b2-93b2-ee3c6252b3dd';
const TARGET_DATE = '2025-06-26';

async function debugMissingTopics() {
  console.log(`🎯 Target: User ${TARGET_USER} on ${TARGET_DATE}`);
  console.log('');

  try {
    // Step 1: Direct database inspection
    console.log('📊 STEP 1: Direct Database Query');
    console.log('==================================');

    const { data: rawExcelData, error: excelError } = await supabase
      .from('excel_data')
      .select('*')
      .eq('user_id', TARGET_USER)
      .eq('date', TARGET_DATE)
      .single();

    if (excelError) {
      console.log('❌ Database query failed:', excelError.message);
      return;
    }

    console.log('✅ Raw database record found');
    console.log('   File name:', rawExcelData.file_name);
    console.log('   Upload date:', rawExcelData.uploaded_at);
    console.log('   Data structure keys:', Object.keys(rawExcelData.data || {}));

    // Step 2: Extract and analyze the sets
    console.log('\n📋 STEP 2: Sets Analysis');
    console.log('========================');

    const sets = rawExcelData.data?.sets || {};
    const setNames = Object.keys(sets);
    
    console.log('   Total sets in database:', setNames.length);
    console.log('   Set names:', setNames);

    if (setNames.length === 0) {
      console.log('❌ CRITICAL: No sets found in database data!');
      return;
    }

    // Step 3: Simulate CleanSupabaseService.getExcelData()
    console.log('\n🔧 STEP 3: CleanSupabaseService Simulation');
    console.log('==========================================');

    const simulatedServiceResult = {
      fileName: rawExcelData.file_name,
      sets: rawExcelData.data?.sets || {},
      dataSource: 'Supabase',
      date: rawExcelData.date
    };

    console.log('   Service result sets count:', Object.keys(simulatedServiceResult.sets).length);
    console.log('   Sets returned by service:', Object.keys(simulatedServiceResult.sets));

    // Step 4: Analyze missing D-numbers
    console.log('\n🔍 STEP 4: Missing D-Numbers Analysis');
    console.log('====================================');

    const expectedDNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 27, 30, 60];
    const actualDNumbers = new Set();
    
    setNames.forEach(setName => {
      const match = setName.match(/D-(\d+)/);
      if (match) {
        actualDNumbers.add(parseInt(match[1]));
      }
    });

    const missingDNumbers = expectedDNumbers.filter(d => !actualDNumbers.has(d));
    const presentDNumbers = expectedDNumbers.filter(d => actualDNumbers.has(d));

    console.log('   Expected D-numbers:', expectedDNumbers);
    console.log('   Present D-numbers:', [...presentDNumbers].sort((a, b) => a - b));
    console.log('   Missing D-numbers:', missingDNumbers);
    console.log('   Missing count:', missingDNumbers.length);

    // Step 5: Expected vs Actual topic count
    console.log('\n📊 STEP 5: Topic Count Analysis');
    console.log('===============================');

    const expectedTopicCount = 30; // 15 D-numbers × 2 sets each
    const actualTopicCount = setNames.length;
    const missingTopicCount = expectedTopicCount - actualTopicCount;

    console.log('   Expected topics:', expectedTopicCount);
    console.log('   Actual topics:', actualTopicCount);
    console.log('   Missing topics:', missingTopicCount);

    if (missingTopicCount === 16) {
      console.log('   ✅ CONFIRMED: This matches the reported issue (16 missing topics)');
    }

    // Step 6: Detailed set analysis
    console.log('\n📝 STEP 6: Detailed Set Content Analysis');
    console.log('========================================');

    setNames.forEach((setName, index) => {
      const setData = sets[setName];
      const elementCount = Object.keys(setData || {}).length;
      console.log(`   ${index + 1}. ${setName}: ${elementCount} elements`);
    });

    // Step 7: Root cause determination
    console.log('\n🎯 STEP 7: Root Cause Analysis');
    console.log('==============================');

    if (actualTopicCount < expectedTopicCount) {
      console.log('   ❌ ISSUE CONFIRMED: Database contains incomplete topic data');
      console.log('   🔧 SOLUTION NEEDED: Re-upload Excel file with all 30 topics');
      console.log('');
      console.log('   📋 Action Items:');
      console.log('   1. Check original Excel file for missing D-numbers:', missingDNumbers.join(', '));
      console.log('   2. Verify Excel file has exactly 30 topics (15 D-numbers × 2 sets)');
      console.log('   3. Re-upload complete Excel file');
      console.log('   4. Verify upload includes all expected D-numbers');
    } else {
      console.log('   ✅ Database contains expected number of topics');
      console.log('   🔧 Issue is in frontend data processing, not database');
    }

    // Step 8: Frontend processing check
    console.log('\n💻 STEP 8: Frontend Processing Check');
    console.log('====================================');
    console.log('   Next debugging steps for frontend:');
    console.log('   1. Check PlanetsAnalysisPage data loading');
    console.log('   2. Verify availableTopics calculation');
    console.log('   3. Check topic filtering logic');
    console.log('   4. Verify naturalTopicSort function');

    console.log('\n🎉 DEBUGGING COMPLETE');
    console.log('=====================');
    console.log(`✅ Analyzed ${actualTopicCount} topics for user ${TARGET_USER}`);
    
    if (missingTopicCount > 0) {
      console.log(`❌ CRITICAL: ${missingTopicCount} topics missing from database`);
      console.log('   Root cause: Incomplete Excel file upload');
      console.log('   Solution: Re-upload complete Excel file with all 30 topics');
    } else {
      console.log('✅ Database data is complete');
      console.log('   Issue is in frontend data processing pipeline');
    }

  } catch (error) {
    console.error('💥 Debugging failed:', error);
  }
}

// Run the debugging
debugMissingTopics();
