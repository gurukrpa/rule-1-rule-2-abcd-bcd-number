// Check rule2_analysis_results for 2025-08-18 to understand structure
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const checkRule2Results = async () => {
  try {
    console.log('🔍 Checking rule2_analysis_results for 2025-08-21 HR-1 (test record)...');
    
    const { data, error } = await supabase
      .from('rule2_analysis_results')
      .select('*')
      .eq('analysis_date', '2025-08-21')
      .eq('selected_hr', 1)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('❌ Query error:', error);
      return;
    }
    
    console.log('📊 Found records:', data?.length || 0);
    
    if (data && data.length > 0) {
      const record = data[0];
      console.log('✅ Latest record (2025-08-21 HR1):');
      console.log('  user_id:', record.user_id);
      console.log('  analysis_date:', record.analysis_date);
      console.log('  selected_hr:', record.selected_hr);
      console.log('  created_at:', record.created_at);
      
      if (record.topic_numbers) {
        console.log('📋 topic_numbers keys:', Object.keys(record.topic_numbers));
        
        // Check for D-1 Set-2 variations
        const d1Set2Keys = Object.keys(record.topic_numbers).filter(key => 
          key.toLowerCase().includes('d-1') && key.toLowerCase().includes('set-2')
        );
        
        if (d1Set2Keys.length > 0) {
          console.log('🎯 D-1 Set-2 keys found:', d1Set2Keys);
          
          d1Set2Keys.forEach(key => {
            console.log(`📝 '${key}':`, record.topic_numbers[key]);
          });
        }
        
        // Show specific D-1 Set-2 Matrix data
        const d1Set2Matrix = record.topic_numbers['D-1 Set-2 Matrix'];
        if (d1Set2Matrix) {
          console.log('\n🎯 VERIFICATION: D-1 Set-2 Matrix should show ABCD [2,5,10,11], BCD [9]');
          console.log('📝 Actual D-1 Set-2 Matrix:', d1Set2Matrix);
          
          const expectedABCD = [2, 5, 10, 11];
          const expectedBCD = [9];
          
          const abcdMatch = JSON.stringify(d1Set2Matrix.abcd.sort()) === JSON.stringify(expectedABCD.sort());
          const bcdMatch = JSON.stringify(d1Set2Matrix.bcd.sort()) === JSON.stringify(expectedBCD.sort());
          
          console.log(`✅ ABCD matches expected: ${abcdMatch ? 'YES' : 'NO'}`);
          console.log(`✅ BCD matches expected: ${bcdMatch ? 'YES' : 'NO'}`);
          
          if (abcdMatch && bcdMatch) {
            console.log('🎉 Perfect! Test record has correct values.');
          } else {
            console.log('❌ Test record values do not match expected.');
          }
        }
      }
    } else {
      console.log('❌ No records found for 2025-08-21 HR-1');
    }
  } catch (err) {
    console.error('💥 Error:', err);
  }
};

checkRule2Results();