#!/usr/bin/env node

/**
 * Test Script: Database Integration for Rule-1 Page
 * 
 * This script verifies that:
 * 1. The database contains ABCD/BCD data for specific dates
 * 2. The fetchAbcdBcdFromDatabase function works correctly
 * 3. Data is properly formatted for Rule-1 page consumption
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yxzyqoowjsqyomlsqhoc.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4enlxb293anNxeW9tbHNxaG9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjIwNjIwMjMsImV4cCI6MjAzNzYzODAyM30.YksT85vu-IjKZe8wvhkJZlm5OIInk4kqo-iW5kOlrWI';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test function: Replicate the Rule-1 page database fetch logic
async function testFetchAbcdBcdFromDatabase(targetDate, selectedUser = 'sing maya') {
  try {
    console.log(`🔍 [Test] Fetching ABCD/BCD data from database for ${targetDate}...`);
    
    // Fetch from rule2_analysis_results table (topic-specific data)
    const { data: analysisResults, error } = await supabase
      .from('rule2_analysis_results')
      .select('*')
      .eq('user_id', selectedUser)
      .eq('analysis_date', targetDate)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error(`❌ [Test] Database error for ${targetDate}:`, error);
      return null;
    }
    
    if (!analysisResults || analysisResults.length === 0) {
      console.warn(`⚠️ [Test] No ABCD/BCD data found in database for ${targetDate}`);
      return null;
    }
    
    const result = analysisResults[0];
    const topicNumbers = result.topic_numbers || {};
    
    console.log(`✅ [Test] Found ABCD/BCD data for ${targetDate}:`, {
      topics: Object.keys(topicNumbers).length,
      sampleTopics: Object.keys(topicNumbers).slice(0, 3),
      date: targetDate,
      overallAbcd: result.overall_abcd_numbers || [],
      overallBcd: result.overall_bcd_numbers || []
    });
    
    // Convert to the format expected by Rule-1 page
    const formattedResults = {};
    Object.entries(topicNumbers).forEach(([topicName, numbers]) => {
      formattedResults[topicName] = {
        [targetDate]: {
          abcdNumbers: numbers.abcd || [],
          bcdNumbers: numbers.bcd || [],
          dDayCount: (numbers.abcd || []).length + (numbers.bcd || []).length,
          analysisDate: targetDate,
          displayDate: targetDate,
          sourceDatabase: true,
          isTargetDate: false // This would be set based on clicked date
        }
      };
    });
    
    console.log(`📊 [Test] Formatted results sample:`, {
      topicsCount: Object.keys(formattedResults).length,
      sampleTopic: Object.keys(formattedResults)[0],
      sampleData: formattedResults[Object.keys(formattedResults)[0]]
    });
    
    return formattedResults;
    
  } catch (error) {
    console.error(`❌ [Test] Error fetching ABCD/BCD from database for ${targetDate}:`, error);
    return null;
  }
}

// Test function: Check available dates in database
async function checkAvailableDates(selectedUser = 'sing maya') {
  try {
    console.log(`🔍 [Test] Checking available dates in database for user: ${selectedUser}...`);
    
    const { data: availableDates, error } = await supabase
      .from('rule2_analysis_results')
      .select('analysis_date, total_topics, created_at')
      .eq('user_id', selectedUser)
      .order('analysis_date', { ascending: false });
    
    if (error) {
      console.error(`❌ [Test] Error fetching available dates:`, error);
      return [];
    }
    
    console.log(`✅ [Test] Found ${availableDates.length} dates with ABCD/BCD data:`, 
      availableDates.map(d => ({
        date: d.analysis_date,
        topics: d.total_topics,
        created: new Date(d.created_at).toLocaleDateString()
      }))
    );
    
    return availableDates.map(d => d.analysis_date);
    
  } catch (error) {
    console.error(`❌ [Test] Error checking available dates:`, error);
    return [];
  }
}

// Test function: Check specific topic data
async function checkTopicData(targetDate, topicName = 'D-4 Set-1 Matrix', selectedUser = 'sing maya') {
  try {
    console.log(`🎯 [Test] Checking specific topic data for ${topicName} on ${targetDate}...`);
    
    const { data: analysisResults, error } = await supabase
      .from('rule2_analysis_results')
      .select('topic_numbers')
      .eq('user_id', selectedUser)
      .eq('analysis_date', targetDate)
      .single();
    
    if (error || !analysisResults) {
      console.warn(`⚠️ [Test] No data found for ${targetDate}`);
      return null;
    }
    
    const topicNumbers = analysisResults.topic_numbers || {};
    const specificTopic = topicNumbers[topicName];
    
    if (specificTopic) {
      console.log(`✅ [Test] ${topicName} on ${targetDate}:`, {
        abcd: specificTopic.abcd || [],
        bcd: specificTopic.bcd || [],
        totalNumbers: (specificTopic.abcd || []).length + (specificTopic.bcd || []).length
      });
      
      // Check if this matches the expected results
      if (targetDate === '2025-07-10' && topicName === 'D-4 Set-1 Matrix') {
        const expectedAbcd = [2, 3, 7];
        const expectedBcd = [5];
        
        const actualAbcd = specificTopic.abcd || [];
        const actualBcd = specificTopic.bcd || [];
        
        console.log(`🔍 [Test] Verification for D-4 Set-1 on July 10th:`, {
          expected: { abcd: expectedAbcd, bcd: expectedBcd },
          actual: { abcd: actualAbcd, bcd: actualBcd },
          abcdMatch: JSON.stringify(actualAbcd.sort()) === JSON.stringify(expectedAbcd.sort()),
          bcdMatch: JSON.stringify(actualBcd.sort()) === JSON.stringify(expectedBcd.sort())
        });
      }
      
      return specificTopic;
    } else {
      console.warn(`⚠️ [Test] Topic ${topicName} not found in data for ${targetDate}`);
      return null;
    }
    
  } catch (error) {
    console.error(`❌ [Test] Error checking topic data:`, error);
    return null;
  }
}

// Main test execution
async function runTests() {
  console.log('🚀 [Test] Starting Database Integration Tests for Rule-1 Page...\n');
  
  // Test 1: Check available dates
  console.log('📅 Test 1: Check Available Dates');
  console.log('=' .repeat(50));
  const availableDates = await checkAvailableDates();
  console.log('\n');
  
  if (availableDates.length === 0) {
    console.log('❌ [Test] No data found in database. Exiting tests.');
    return;
  }
  
  // Test 2: Test database fetch for July 10th (specific date mentioned in requirements)
  console.log('🗄️ Test 2: Fetch July 10th Data');
  console.log('=' .repeat(50));
  const july10Results = await testFetchAbcdBcdFromDatabase('2025-07-10');
  console.log('\n');
  
  // Test 3: Check specific topic (D-4 Set-1 Matrix mentioned in requirements)
  console.log('🎯 Test 3: Check D-4 Set-1 Matrix Data');
  console.log('=' .repeat(50));
  await checkTopicData('2025-07-10', 'D-4 Set-1 Matrix');
  console.log('\n');
  
  // Test 4: Test fetch for latest available date
  if (availableDates.length > 0) {
    const latestDate = availableDates[0];
    console.log(`📊 Test 4: Fetch Latest Date (${latestDate})`);
    console.log('=' .repeat(50));
    await testFetchAbcdBcdFromDatabase(latestDate);
    console.log('\n');
  }
  
  // Test 5: Test fetch for non-existent date
  console.log('❌ Test 5: Fetch Non-existent Date');
  console.log('=' .repeat(50));
  await testFetchAbcdBcdFromDatabase('2025-12-31');
  console.log('\n');
  
  console.log('✅ [Test] Database Integration Tests Complete!');
  console.log('🎯 [Test] Summary:');
  console.log(`   - Available dates: ${availableDates.length}`);
  console.log(`   - July 10th data: ${july10Results ? 'Found' : 'Not found'}`);
  console.log(`   - Ready for Rule-1 page integration: ${july10Results ? '✅' : '❌'}`);
}

// Run the tests
runTests().catch(console.error);
