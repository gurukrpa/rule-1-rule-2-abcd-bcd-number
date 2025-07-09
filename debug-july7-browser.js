// Debug Script for Rule-1 Page July 7th ABCD/BCD Issue
// Run this in browser console after opening Rule-1 page

console.log('🔍 [Debug] Starting July 7th ABCD/BCD diagnostic...');

async function debugJuly7Issue() {
  try {
    // Check if supabase is available
    console.log('📡 [Debug] Checking Supabase connection...');
    
    if (typeof supabase === 'undefined') {
      console.error('❌ [Debug] Supabase not available in global scope');
      return;
    }
    
    // Check rule2_analysis_results for July 7th
    console.log('🔍 [Debug] Querying rule2_analysis_results for July 7th...');
    
    const { data: analysisData, error: analysisError } = await supabase
      .from('rule2_analysis_results')
      .select('*')
      .eq('user_id', 'sing maya')
      .eq('analysis_date', '2025-07-07');
      
    if (analysisError) {
      console.error('❌ [Debug] Error fetching analysis data:', analysisError);
    } else {
      console.log('📊 [Debug] Analysis data found:', analysisData?.length || 0);
      
      if (analysisData && analysisData.length > 0) {
        const result = analysisData[0];
        console.log('✅ [Debug] Found Rule2 analysis for July 7th:');
        console.log('  📅 Analysis Date:', result.analysis_date);
        console.log('  🎯 Trigger Date:', result.trigger_date);
        console.log('  🕐 Selected HR:', result.selected_hr);
        console.log('  📊 Total Topics:', result.total_topics);
        console.log('  🟢 Overall ABCD:', result.overall_abcd_numbers);
        console.log('  🔵 Overall BCD:', result.overall_bcd_numbers);
        
        if (result.topic_numbers) {
          const topicNumbers = result.topic_numbers;
          
          // Check D-1 Set-1 Matrix specifically  
          if (topicNumbers['D-1 Set-1 Matrix']) {
            const d1set1 = topicNumbers['D-1 Set-1 Matrix'];
            console.log('🎯 [Debug] D-1 Set-1 Matrix data found:');
            console.log('  🟢 ABCD:', d1set1.abcd);
            console.log('  🔵 BCD:', d1set1.bcd);
            
            // This should match: ABCD: [1, 2, 4, 7, 9], BCD: [5]
            const expectedABCD = [1, 2, 4, 7, 9];
            const expectedBCD = [5];
            
            console.log('🔍 [Debug] Expected vs Actual:');
            console.log('  Expected ABCD:', expectedABCD);
            console.log('  Actual ABCD:', d1set1.abcd);
            console.log('  Expected BCD:', expectedBCD);
            console.log('  Actual BCD:', d1set1.bcd);
            
            const abcdMatch = JSON.stringify(d1set1.abcd?.sort()) === JSON.stringify(expectedABCD);
            const bcdMatch = JSON.stringify(d1set1.bcd?.sort()) === JSON.stringify(expectedBCD);
            
            if (abcdMatch && bcdMatch) {
              console.log('✅ [Debug] D-1 Set-1 Matrix data matches expected values!');
            } else {
              console.log('❌ [Debug] D-1 Set-1 Matrix data does NOT match expected values');
            }
            
            return {
              found: true,
              data: d1set1,
              matches: { abcd: abcdMatch, bcd: bcdMatch }
            };
          } else {
            console.log('❌ [Debug] No D-1 Set-1 Matrix data found in topic_numbers');
            console.log('📋 [Debug] Available topics:', Object.keys(topicNumbers));
            return { found: false, reason: 'No D-1 Set-1 Matrix in topic_numbers' };
          }
        } else {
          console.log('❌ [Debug] No topic_numbers found in analysis result');
          return { found: false, reason: 'No topic_numbers in result' };
        }
      } else {
        console.log('❌ [Debug] No analysis data found for July 7th');
        return { found: false, reason: 'No analysis data for July 7th' };
      }
    }
    
  } catch (error) {
    console.error('❌ [Debug] Error in diagnostic:', error);
    return { found: false, error: error.message };
  }
}

// Run the diagnostic
debugJuly7Issue().then(result => {
  console.log('🎯 [Debug] Diagnostic complete:', result);
  
  if (result && result.found && result.matches && result.matches.abcd && result.matches.bcd) {
    console.log('🎉 [Debug] SUCCESS: Database has correct ABCD/BCD data for July 7th!');
    console.log('💡 [Debug] The issue might be in how Rule-1 page fetches/displays this data');
  } else {
    console.log('⚠️ [Debug] Database issue detected - need to create/fix the July 7th data');
  }
}).catch(error => {
  console.error('❌ [Debug] Diagnostic failed:', error);
});

// Also check if the fetchAbcdBcdFromDatabase function exists and works
if (typeof fetchAbcdBcdFromDatabase !== 'undefined') {
  console.log('🔍 [Debug] Testing fetchAbcdBcdFromDatabase function...');
  
  fetchAbcdBcdFromDatabase('2025-07-07').then(result => {
    console.log('📊 [Debug] fetchAbcdBcdFromDatabase result for July 7th:', result);
  }).catch(error => {
    console.error('❌ [Debug] fetchAbcdBcdFromDatabase error:', error);
  });
} else {
  console.log('❌ [Debug] fetchAbcdBcdFromDatabase function not available in global scope');
}
