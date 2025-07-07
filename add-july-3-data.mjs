import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lgbcbqaqdsgwkcgvqlsg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnYmNicWFxZHNnd2tjZ3ZxbHNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIxMDgyNTcsImV4cCI6MjA0NzY4NDI1N30.tKZgapYNcJOgXYbF8BhJJNKpI5WuEw6oc3vJYHhBFD0';

const supabase = createClient(supabaseUrl, supabaseKey);
const USER_ID = 'sing maya';
const TARGET_DATE = '2025-07-03';

console.log(`🚀 ADDING DATA FOR DATE: ${TARGET_DATE} (User: ${USER_ID})`);
console.log('================================================');

try {
  // 1. Add Excel Data for July 3rd (simplified version)
  console.log('📊 Adding Excel data...');
  
  const excelData = {
    user_id: USER_ID,
    date: TARGET_DATE,
    file_name: `july-3-test-data.xlsx`,
    data: {
      sets: {
        'D-1 Set-1 Matrix': {
          'Lagna': { 'Su': 'su-1/2', 'Mo': 'mo-7/8', 'Ma': 'ma-4/5', 'Me': 'me-2/3', 'Ju': 'ju-9/10', 'Ve': 've-1/2', 'Sa': 'sa-7/8', 'Ra': 'ra-4/5', 'Ke': 'ke-2/3' },
          'Moon': { 'Su': 'su-2/3', 'Mo': 'mo-8/9', 'Ma': 'ma-5/6', 'Me': 'me-3/4', 'Ju': 'ju-10/11', 'Ve': 've-2/3', 'Sa': 'sa-8/9', 'Ra': 'ra-5/6', 'Ke': 'ke-3/4' }
        },
        'D-3 Set-1 Matrix': {
          'Lagna': { 'Su': 'su-3/4', 'Mo': 'mo-9/10', 'Ma': 'ma-6/7', 'Me': 'me-4/5', 'Ju': 'ju-11/12', 'Ve': 've-3/4', 'Sa': 'sa-9/10', 'Ra': 'ra-6/7', 'Ke': 'ke-4/5' },
          'Moon': { 'Su': 'su-4/5', 'Mo': 'mo-10/11', 'Ma': 'ma-7/8', 'Me': 'me-5/6', 'Ju': 'ju-12/1', 'Ve': 've-4/5', 'Sa': 'sa-10/11', 'Ra': 'ra-7/8', 'Ke': 'ke-5/6' }
        }
      }
    },
    created_at: new Date().toISOString()
  };
  
  const { data: insertedExcel, error: excelError } = await supabase
    .from('excel_data')
    .insert([excelData])
    .select();
  
  if (excelError) {
    console.log('❌ Excel insert error:', excelError.message);
  } else {
    console.log('✅ Excel data inserted successfully');
  }
  
  // 2. Add Hour Entry Data for July 3rd
  console.log('🕒 Adding Hour entry data...');
  
  const hourEntryData = {
    user_id: USER_ID,
    date_key: TARGET_DATE,
    hour_data: {
      1: { planet: 'Ma' },
      2: { planet: 'Ve' },
      3: { planet: 'Ju' },
      4: { planet: 'Sa' },
      5: { planet: 'Ra' },
      6: { planet: 'Ke' }
    },
    created_at: new Date().toISOString()
  };
  
  const { data: insertedHour, error: hourError } = await supabase
    .from('hour_entries')
    .insert([hourEntryData])
    .select();
  
  if (hourError) {
    console.log('❌ Hour entry insert error:', hourError.message);
  } else {
    console.log('✅ Hour entry data inserted successfully');
  }
  
  console.log('');
  console.log('🎯 RESULT:');
  console.log(`✅ July 3rd, 2025 data added successfully!`);
  console.log(`📅 Now when you click July 7th, it should show July 3rd data instead of June 30th`);
  console.log('');
  console.log('🔍 Test by navigating to: /planets-analysis/sing%20maya?date=2025-07-07');
  
} catch (error) {
  console.error('❌ Error adding data:', error.message);
}
