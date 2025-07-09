#!/usr/bin/env node

// Simple script to check database state for July 7th ABCD/BCD data

import { supabase } from './src/supabaseClient.js';

async function checkJuly7Data() {
  console.log('🔍 Checking July 7th ABCD/BCD data...');
  
  try {
    // Check rule2_analysis_results for July 7th
    const { data: analysisData, error: analysisError } = await supabase
      .from('rule2_analysis_results')
      .select('*')
      .eq('user_id', 'sing maya')
      .eq('analysis_date', '2025-07-07');
      
    if (analysisError) {
      console.error('❌ Error fetching analysis data:', analysisError);
    } else {
      console.log('📊 Rule2 analysis data for July 7th:', analysisData?.length || 0);
      
      if (analysisData && analysisData.length > 0) {
        const result = analysisData[0];
        console.log('✅ Found data for July 7th:');
        console.log('  - Analysis Date:', result.analysis_date);
        console.log('  - Trigger Date:', result.trigger_date);
        console.log('  - Selected HR:', result.selected_hr);
        console.log('  - Total Topics:', result.total_topics);
        console.log('  - Overall ABCD:', result.overall_abcd_numbers);
        console.log('  - Overall BCD:', result.overall_bcd_numbers);
        
        if (result.topic_numbers) {
          const topicNumbers = result.topic_numbers;
          console.log('  - Topic-specific data:');
          
          // Check D-1 Set-1 Matrix specifically
          if (topicNumbers['D-1 Set-1 Matrix']) {
            const d1set1 = topicNumbers['D-1 Set-1 Matrix'];
            console.log('    🎯 D-1 Set-1 Matrix:');
            console.log('      - ABCD:', d1set1.abcd);
            console.log('      - BCD:', d1set1.bcd);
          } else {
            console.log('    ❌ No D-1 Set-1 Matrix data found');
          }
          
          // Show sample of other topics
          const topics = Object.keys(topicNumbers);
          console.log(`    📋 Total topics with data: ${topics.length}`);
          console.log(`    📋 Sample topics: ${topics.slice(0, 3).join(', ')}`);
        }
      } else {
        console.log('❌ No analysis data found for July 7th');
      }
    }

    // Also check rule2_results table
    const { data: rule2Data, error: rule2Error } = await supabase
      .from('rule2_results')
      .select('*')
      .eq('user_id', 'sing maya')
      .eq('date', '2025-07-07');
      
    if (rule2Error) {
      console.error('❌ Error fetching rule2_results:', rule2Error);
    } else {
      console.log('📊 Rule2 results for July 7th:', rule2Data?.length || 0);
      
      if (rule2Data && rule2Data.length > 0) {
        const result = rule2Data[0];
        console.log('✅ Found rule2_results for July 7th:');
        console.log('  - ABCD Numbers:', result.abcd_numbers);
        console.log('  - BCD Numbers:', result.bcd_numbers);
      }
    }

    // Check if there's Excel/Hour data for July 7th
    const { data: excelData, error: excelError } = await supabase
      .from('excel_uploads')
      .select('*')
      .eq('user_id', 'sing maya')
      .eq('date', '2025-07-07');
      
    if (excelError) {
      console.error('❌ Error fetching Excel data:', excelError);
    } else {
      console.log('📊 Excel data for July 7th:', excelData?.length || 0);
    }

    const { data: hourData, error: hourError } = await supabase
      .from('hour_entries')
      .select('*')
      .eq('user_id', 'sing maya')
      .eq('date', '2025-07-07');
      
    if (hourError) {
      console.error('❌ Error fetching Hour data:', hourError);
    } else {
      console.log('📊 Hour data for July 7th:', hourData?.length || 0);
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
  }
  
  process.exit(0);
}

checkJuly7Data().catch(console.error);
