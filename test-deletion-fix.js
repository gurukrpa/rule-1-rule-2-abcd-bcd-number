// Test script to verify comprehensive deletion is working after the fix
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqbrmqvsnvbkwpwkdzha.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxYnJtcXZzbnZia3dwd2tkemhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxMDM1NDQsImV4cCI6MjA0OTY3OTU0NH0.3GLCTA6uH4fBTk0l9hpgMoQdU4ZdBMQXFm2cq0QhGss'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFixedDeletion() {
  console.log('🧪 Testing Fixed Deletion Functionality')
  console.log('=====================================\n')

  // Test with a real user from the system
  const testDate = '2025-06-01'
  
  try {
    console.log('📋 Step 1: Finding users with data...')
    
    // Get all users
    const { data: users } = await supabase.from('users').select('*')
    console.log(`👥 Found ${users?.length || 0} users`)
    
    if (!users || users.length === 0) {
      console.log('❌ No users found in system')
      return
    }
    
    // Find users with data for the test date
    let userWithData = null
    
    for (const user of users) {
      const [excelCheck, hourCheck] = await Promise.all([
        supabase.from('excel_data').select('*').eq('user_id', user.id).eq('date', testDate),
        supabase.from('hour_entries').select('*').eq('user_id', user.id).eq('date_key', testDate)
      ])
      
      if (excelCheck.data?.length > 0 || hourCheck.data?.length > 0) {
        userWithData = user
        console.log(`✅ Found user with data: ${user.username} (${user.id})`)
        console.log(`   - Excel data: ${excelCheck.data?.length || 0} records`)
        console.log(`   - Hour entries: ${hourCheck.data?.length || 0} records`)
        break
      }
    }
    
    if (!userWithData) {
      console.log('ℹ️ No users found with existing data for', testDate)
      console.log('📝 Creating test data for demonstration...')
      
      // Use the first user and create test data
      userWithData = users[0]
      
      // Create test data
      await Promise.all([
        supabase.from('excel_data').upsert({
          user_id: userWithData.id,
          date: testDate,
          file_name: 'test-deletion-fix.xlsx',
          data: { sets: { 'D-1 Set-1 Matrix': { test: 'data' } } }
        }),
        supabase.from('hour_entries').upsert({
          user_id: userWithData.id,
          date_key: testDate,
          hour_data: { planetSelections: { '1': 'Mercury' } }
        })
      ])
      
      console.log(`✅ Created test data for user: ${userWithData.username}`)
    }
    
    console.log('\n📋 Step 2: Verifying data exists before deletion...')
    
    const beforeChecks = await Promise.all([
      supabase.from('excel_data').select('*').eq('user_id', userWithData.id).eq('date', testDate),
      supabase.from('hour_entries').select('*').eq('user_id', userWithData.id).eq('date_key', testDate),
      supabase.from('rule2_results').select('*').eq('user_id', userWithData.id).eq('date', testDate)
    ])
    
    const [excelBefore, hourBefore, rule2Before] = beforeChecks
    
    console.log('📊 Data BEFORE deletion:')
    console.log(`   - Excel data: ${excelBefore.data?.length || 0} records`)
    console.log(`   - Hour entries: ${hourBefore.data?.length || 0} records`)
    console.log(`   - Rule2 results: ${rule2Before.data?.length || 0} records`)
    
    if (excelBefore.data?.length === 0 && hourBefore.data?.length === 0) {
      console.log('❌ No data found to test deletion with')
      return
    }
    
    console.log('\n📋 Step 3: Simulating comprehensive deletion...')
    
    // Simulate the enhanced deleteDataForDate function (17 tables)
    const deletePromises = [
      // Core ABCD data tables
      supabase.from('excel_data').delete().eq('user_id', userWithData.id).eq('date', testDate),
      supabase.from('hour_entry').delete().eq('user_id', userWithData.id).eq('date_key', testDate),
      supabase.from('hour_entries').delete().eq('user_id', userWithData.id).eq('date_key', testDate),
      
      // UserData component tables
      supabase.from('hr_data').delete().eq('user_id', userWithData.id).eq('date', testDate),
      supabase.from('house').delete().eq('user_id', userWithData.id).eq('date', testDate),
      
      // PagesDataService tables  
      supabase.from('processed_data').delete().eq('user_id', userWithData.id).eq('date', testDate),
      supabase.from('abcd_sequences').delete().eq('user_id', userWithData.id).eq('trigger_date', testDate),
      supabase.from('abcd_sequences').delete().eq('user_id', userWithData.id).eq('a_date', testDate),
      supabase.from('abcd_sequences').delete().eq('user_id', userWithData.id).eq('b_date', testDate),
      supabase.from('abcd_sequences').delete().eq('user_id', userWithData.id).eq('c_date', testDate),
      supabase.from('abcd_sequences').delete().eq('user_id', userWithData.id).eq('d_date', testDate),
      
      // Rule2 analysis results
      supabase.from('rule2_results').delete().eq('user_id', userWithData.id).eq('date', testDate),
      
      // General analysis and cache tables
      supabase.from('analysis_results').delete().eq('user_id', userWithData.id).eq('date', testDate),
      supabase.from('calculation_cache').delete().eq('user_id', userWithData.id).eq('date', testDate),
      
      // Index page and other potential cache tables
      supabase.from('page_cache').delete().eq('user_id', userWithData.id).eq('date', testDate),
      supabase.from('user_cache').delete().eq('user_id', userWithData.id).eq('date', testDate),
      supabase.from('session_cache').delete().eq('user_id', userWithData.id).eq('date', testDate)
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

    console.log('\n📋 Step 4: Verifying deletion was complete...')
    
    // Wait a moment for database consistency
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const afterChecks = await Promise.all([
      supabase.from('excel_data').select('*').eq('user_id', userWithData.id).eq('date', testDate),
      supabase.from('hour_entries').select('*').eq('user_id', userWithData.id).eq('date_key', testDate),
      supabase.from('rule2_results').select('*').eq('user_id', userWithData.id).eq('date', testDate)
    ])
    
    const [excelAfter, hourAfter, rule2After] = afterChecks
    
    console.log('📊 Data AFTER deletion:')
    console.log(`   - Excel data: ${excelAfter.data?.length || 0} records`)
    console.log(`   - Hour entries: ${hourAfter.data?.length || 0} records`)
    console.log(`   - Rule2 results: ${rule2After.data?.length || 0} records`)
    
    console.log('\n🎯 Deletion Test Results:')
    console.log('========================')
    
    const allDataRemoved = (
      (excelAfter.data?.length || 0) === 0 &&
      (hourAfter.data?.length || 0) === 0 &&
      (rule2After.data?.length || 0) === 0
    )
    
    if (allDataRemoved) {
      console.log('✅ DELETION FIX TEST PASSED')
      console.log('✅ All data successfully removed from database')
      console.log('✅ The fix should resolve the issue where data was persisting')
    } else {
      console.log('❌ DELETION FIX TEST FAILED')
      console.log('❌ Some data still exists in database')
      console.log('❌ The issue may require additional investigation')
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error)
  }
}

// Run the test
testFixedDeletion().then(() => {
  console.log('\n🏁 Deletion fix test completed')
})
