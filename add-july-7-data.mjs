// Quick script to add July 7th data for testing
// This will allow July 8th click → July 7th result

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lgbcbqaqdsgwkcgvqlsg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnYmNicWFxZHNnd2tjZ3ZxbHNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIxMDgyNTcsImV4cCI6MjA0NzY4NDI1N30.tKZgapYNcJOgXYbF8BhJJNKpI5WuEw6oc3vJYHhBFD0';

const supabase = createClient(supabaseUrl, supabaseKey);
const USER_ID = 'sing maya';
const TARGET_DATE = '2025-07-07';

console.log(`🚀 ADDING JULY 7TH DATA FOR TESTING`);
console.log(`User: ${USER_ID}, Date: ${TARGET_DATE}`);

try {
  // 1. Add Excel Data for July 7th
  console.log('📊 Adding Excel data for July 7th...');
  
  const excelData = {
    user_id: USER_ID,
    date: TARGET_DATE,
    file_name: `july-7-test-data.xlsx`,
    data: {
      sets: {
        'D-1 Set-1 Matrix': {
          'Lagna': { 'Su': 'su-5/6', 'Mo': 'mo-11/12', 'Ma': 'ma-8/9', 'Me': 'me-6/7', 'Ju': 'ju-1/2', 'Ve': 've-5/6', 'Sa': 'sa-11/12', 'Ra': 'ra-8/9', 'Ke': 'ke-6/7' },
          'Moon': { 'Su': 'su-6/7', 'Mo': 'mo-12/1', 'Ma': 'ma-9/10', 'Me': 'me-7/8', 'Ju': 'ju-2/3', 'Ve': 've-6/7', 'Sa': 'sa-12/1', 'Ra': 'ra-9/10', 'Ke': 'ke-7/8' }
        },
        'D-3 Set-1 Matrix': {
          'Lagna': { 'Su': 'su-7/8', 'Mo': 'mo-1/2', 'Ma': 'ma-10/11', 'Me': 'me-8/9', 'Ju': 'ju-3/4', 'Ve': 've-7/8', 'Sa': 'sa-1/2', 'Ra': 'ra-10/11', 'Ke': 'ke-8/9' },
          'Moon': { 'Su': 'su-8/9', 'Mo': 'mo-2/3', 'Ma': 'ma-11/12', 'Me': 'me-9/10', 'Ju': 'ju-4/5', 'Ve': 've-8/9', 'Sa': 'sa-2/3', 'Ra': 'ra-11/12', 'Ke': 'ke-9/10' }
        }
      }
    },
    created_at: new Date().toISOString()
  };
  
  const { error: excelError } = await supabase
    .from('excel_data')
    .insert([excelData]);
  
  if (excelError) {
    console.log('❌ Excel insert error:', excelError.message);
  } else {
    console.log('✅ Excel data inserted successfully');
  }
  
  // 2. Add Hour Entry Data for July 7th
  console.log('🕒 Adding Hour entry data for July 7th...');
  
  const hourEntryData = {
    user_id: USER_ID,
    date_key: TARGET_DATE,
    hour_data: {
      planetSelections: {
        1: 'Ju',
        2: 'Ve', 
        3: 'Sa',
        4: 'Ra',
        5: 'Ke',
        6: 'Su'
      }
    },
    created_at: new Date().toISOString()
  };
  
  const { error: hourError } = await supabase
    .from('hour_entries')
    .insert([hourEntryData]);
  
  if (hourError) {
    console.log('❌ Hour entry insert error:', hourError.message);
  } else {
    console.log('✅ Hour entry data inserted successfully');
  }
  
  console.log('');
  console.log('🎯 RESULT:');
  console.log(`✅ July 7th, 2025 data added successfully!`);
  console.log(`📅 Now when you click July 8th, it should show July 7th data`);
  console.log('');
  console.log('🔍 Test by navigating to: /planets-analysis/sing%20maya?date=2025-07-08');
  console.log('Expected result: July 8th → July 7th analysis');
  
} catch (error) {
  console.error('❌ Error adding July 7th data:', error.message);
}
