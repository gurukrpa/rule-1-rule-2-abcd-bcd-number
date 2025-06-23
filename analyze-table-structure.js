// Detailed analysis of table structure and data format differences
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

console.log('🔍 DETAILED TABLE STRUCTURE ANALYSIS');
console.log('====================================\n');

async function analyzeTableStructures() {
  // Check excel_data structure - this is key for our fix
  console.log('📊 EXCEL_DATA Table Analysis:');
  const { data: excelData } = await supabase
    .from('excel_data')
    .select('*')
    .limit(1);
  
  if (excelData && excelData.length > 0) {
    const sample = excelData[0];
    console.log('   Columns:', Object.keys(sample));
    console.log('   Sample structure:');
    console.log('   - ID:', sample.id);
    console.log('   - User ID:', sample.user_id);
    console.log('   - Date:', sample.date);
    console.log('   - File Name:', sample.file_name);
    console.log('   - Data Structure:', typeof sample.data);
    console.log('   - Has "sets" property:', !!(sample.data && sample.data.sets));
    console.log('   - Has "data.sets" property:', !!(sample.data && sample.data.data && sample.data.data.sets));
    
    if (sample.data) {
      console.log('   - Data keys:', Object.keys(sample.data));
      if (sample.data.sets) {
        console.log('   - Direct sets count:', Object.keys(sample.data.sets).length);
        console.log('   - Direct sets:', Object.keys(sample.data.sets).slice(0, 3).join(', '));
      }
      if (sample.data.data && sample.data.data.sets) {
        console.log('   - Nested data.sets count:', Object.keys(sample.data.data.sets).length);
      }
    }
  }

  // Check hour_entries structure
  console.log('\n⏰ HOUR_ENTRIES Table Analysis:');
  const { data: hourData } = await supabase
    .from('hour_entries')
    .select('*')
    .limit(1);
  
  if (hourData && hourData.length > 0) {
    const sample = hourData[0];
    console.log('   Columns:', Object.keys(sample));
    console.log('   Sample structure:');
    console.log('   - ID:', sample.id);
    console.log('   - User ID:', sample.user_id);
    console.log('   - Date Key:', sample.date_key);
    console.log('   - Hour Data Structure:', typeof sample.hour_data);
    
    if (sample.hour_data) {
      console.log('   - Hour data keys:', Object.keys(sample.hour_data));
      console.log('   - Has planetSelections:', !!(sample.hour_data.planetSelections));
    }
  }

  // Check the mismatch between CleanSupabaseService expectations and actual table structure
  console.log('\n🔍 STRUCTURE MISMATCH ANALYSIS:');
  console.log('CleanSupabaseService expects:');
  console.log('   excel_data table:');
  console.log('     - Column: "sets" (direct column)');
  console.log('     - Column: "planet_selections" in hour_entries');
  console.log('');
  console.log('Actual database has:');
  console.log('   excel_data table:');
  console.log('     - Column: "data" (JSON column containing sets)');
  console.log('     - Column: "hour_data" in hour_entries');
  console.log('');
  console.log('This explains why our CleanSupabaseService might not work properly!');
}

analyzeTableStructures().then(() => {
  console.log('\n✅ Detailed analysis complete!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Analysis failed:', err);
  process.exit(1);
});
