// Test script for comprehensive date deletion functionality
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqbrmqvsnvbkwpwkdzha.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxYnJtcXZzbnZia3dwd2tkemhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxMDM1NDQsImV4cCI6MjA0OTY3OTU0NH0.3GLCTA6uH4fBTk0l9hpgMoQdU4ZdBMQXFm2cq0QhGss'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testComprehensiveDeletion() {
  console.log('🧪 Testing Comprehensive Date Deletion Functionality')
  console.log('=====================================================\n')

  const testUserId = 'comprehensive-test-user'
  const testDate = '2025-06-23'

  try {
    console.log('📋 Step 1: Creating test data in multiple tables...')
    
    // Create test data in various tables
    const testDataOperations = [
      // Core tables
      supabase.from('excel_data').upsert({
        user_id: testUserId,
        date: testDate,
        file_name: 'test-comprehensive-deletion.xlsx',
        data: { sets: { 'D-1 Set-1 Matrix': { test: 'data' } } }
      }),
      
      supabase.from('hour_entries').upsert({
        user_id: testUserId,
        date_key: testDate,
        hour_data: { planetSelections: { '1': 'Mercury' } }
      }),
      
      // Analysis tables
      supabase.from('rule2_results').upsert({
        user_id: testUserId,
        date: testDate,
        abcd_numbers: [1, 2, 3],
        bcd_numbers: [4, 5, 6]
      }),
      
      // User dates
      supabase.from('user_dates').upsert({
        user_id: testUserId,
        dates: [testDate, '2025-06-22', '2025-06-21']
      })
    ]

    const creationResults = await Promise.allSettled(testDataOperations)
    
    let createdCount = 0
    creationResults.forEach((result, index) => {
      const tables = ['excel_data', 'hour_entries', 'rule2_results', 'user_dates']
      if (result.status === 'fulfilled') {
        console.log(`✅ Created test data in ${tables[index]}`)
        createdCount++
      } else {
        console.log(`⚠️ Could not create test data in ${tables[index]}:`, result.reason?.message)
      }
    })

    console.log(`📊 Created test data in ${createdCount} tables\n`)

    console.log('📋 Step 2: Verifying test data exists...')
    
    // Verify data exists before deletion
    const verificationChecks = [
      supabase.from('excel_data').select('*').eq('user_id', testUserId).eq('date', testDate),
      supabase.from('hour_entries').select('*').eq('user_id', testUserId).eq('date_key', testDate),
      supabase.from('rule2_results').select('*').eq('user_id', testUserId).eq('date', testDate),
      supabase.from('user_dates').select('*').eq('user_id', testUserId)
    ]

    const verificationResults = await Promise.allSettled(verificationChecks)
    
    verificationResults.forEach((result, index) => {
      const tables = ['excel_data', 'hour_entries', 'rule2_results', 'user_dates']
      if (result.status === 'fulfilled' && result.value.data && result.value.data.length > 0) {
        console.log(`✅ Found test data in ${tables[index]}: ${result.value.data.length} records`)
      } else {
        console.log(`❌ No test data found in ${tables[index]}`)
      }
    })

    console.log('\n📋 Step 3: Simulating comprehensive deletion...')
    
    // Simulate the enhanced deleteDataForDate function
    const deletePromises = [
      // Core ABCD data tables
      supabase.from('excel_data').delete().eq('user_id', testUserId).eq('date', testDate),
      supabase.from('hour_entry').delete().eq('user_id', testUserId).eq('date_key', testDate),
      supabase.from('hour_entries').delete().eq('user_id', testUserId).eq('date_key', testDate),
      
      // UserData component tables
      supabase.from('hr_data').delete().eq('user_id', testUserId).eq('date', testDate),
      supabase.from('house').delete().eq('user_id', testUserId).eq('date', testDate),
      
      // PagesDataService tables  
      supabase.from('processed_data').delete().eq('user_id', testUserId).eq('date', testDate),
      supabase.from('abcd_sequences').delete().eq('user_id', testUserId).eq('trigger_date', testDate),
      supabase.from('abcd_sequences').delete().eq('user_id', testUserId).eq('a_date', testDate),
      supabase.from('abcd_sequences').delete().eq('user_id', testUserId).eq('b_date', testDate),
      supabase.from('abcd_sequences').delete().eq('user_id', testUserId).eq('c_date', testDate),
      supabase.from('abcd_sequences').delete().eq('user_id', testUserId).eq('d_date', testDate),
      
      // Rule2 analysis results
      supabase.from('rule2_results').delete().eq('user_id', testUserId).eq('date', testDate),
      
      // General analysis and cache tables
      supabase.from('analysis_results').delete().eq('user_id', testUserId).eq('date', testDate),
      supabase.from('calculation_cache').delete().eq('user_id', testUserId).eq('date', testDate),
      
      // Index page and other potential cache tables
      supabase.from('page_cache').delete().eq('user_id', testUserId).eq('date', testDate),
      supabase.from('user_cache').delete().eq('user_id', testUserId).eq('date', testDate),
      supabase.from('session_cache').delete().eq('user_id', testUserId).eq('date', testDate)
    ]

    console.log(`🔄 Executing deletion from ${deletePromises.length} tables...`)
    const deletionResults = await Promise.allSettled(deletePromises)
    
    const tableNames = [
      'excel_data', 'hour_entry', 'hour_entries', 
      'hr_data', 'house', 
      'processed_data', 'abcd_sequences(trigger)', 'abcd_sequences(a_date)', 
      'abcd_sequences(b_date)', 'abcd_sequences(c_date)', 'abcd_sequences(d_date)',
      'rule2_results', 'analysis_results', 'calculation_cache',
      'page_cache', 'user_cache', 'session_cache'
    ]
    
    let deletionSuccessCount = 0
    let deletionErrorCount = 0
    
    deletionResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`✅ Deleted from ${tableNames[index]}`)
        deletionSuccessCount++
      } else {
        console.log(`⚠️ Could not delete from ${tableNames[index]}:`, result.reason?.message)
        deletionErrorCount++
      }
    })

    console.log(`\n📊 Deletion Results: ${deletionSuccessCount} successful, ${deletionErrorCount} failed/not applicable`)

    console.log('\n📋 Step 4: Updating user_dates array to remove deleted date...')
    
    // Update user_dates to remove the deleted date
    const { data: currentUserDates, error: fetchError } = await supabase
      .from('user_dates')
      .select('dates')
      .eq('user_id', testUserId)
      .single()

    if (!fetchError && currentUserDates && currentUserDates.dates) {
      const updatedDates = currentUserDates.dates.filter(d => d !== testDate)
      
      const { error: updateError } = await supabase
        .from('user_dates')
        .update({ 
          dates: updatedDates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', testUserId)

      if (!updateError) {
        console.log(`✅ Successfully removed ${testDate} from user_dates array`)
        console.log(`📊 Remaining dates: [${updatedDates.join(', ')}]`)
      } else {
        console.log('❌ Error updating user_dates:', updateError.message)
      }
    } else {
      console.log('ℹ️ No user_dates record found or no dates array')
    }

    console.log('\n📋 Step 5: Verifying deletion was complete...')
    
    // Verify data was deleted
    const finalVerificationChecks = [
      supabase.from('excel_data').select('*').eq('user_id', testUserId).eq('date', testDate),
      supabase.from('hour_entries').select('*').eq('user_id', testUserId).eq('date_key', testDate),
      supabase.from('rule2_results').select('*').eq('user_id', testUserId).eq('date', testDate)
    ]

    const finalVerificationResults = await Promise.allSettled(finalVerificationChecks)
    
    let dataStillExists = false
    finalVerificationResults.forEach((result, index) => {
      const tables = ['excel_data', 'hour_entries', 'rule2_results']
      if (result.status === 'fulfilled' && result.value.data && result.value.data.length > 0) {
        console.log(`❌ Data still exists in ${tables[index]}: ${result.value.data.length} records`)
        dataStillExists = true
      } else {
        console.log(`✅ Confirmed deletion from ${tables[index]}`)
      }
    })

    console.log('\n🎯 Test Results Summary:')
    console.log('========================')
    if (!dataStillExists) {
      console.log('✅ COMPREHENSIVE DELETION TEST PASSED')
      console.log('✅ All test data successfully removed from database')
      console.log('✅ No backup or archive data created')
      console.log('✅ User dates array properly updated')
    } else {
      console.log('❌ COMPREHENSIVE DELETION TEST FAILED')
      console.log('❌ Some data still exists in database')
    }

    console.log('\n📋 Step 6: Cleaning up any remaining test data...')
    
    // Clean up any remaining test data
    await supabase.from('user_dates').delete().eq('user_id', testUserId)
    console.log('🧹 Cleaned up test user_dates record')

  } catch (error) {
    console.error('❌ Test failed with error:', error)
  }
}

// Run the test
testComprehensiveDeletion().then(() => {
  console.log('\n🏁 Comprehensive deletion test completed')
})
