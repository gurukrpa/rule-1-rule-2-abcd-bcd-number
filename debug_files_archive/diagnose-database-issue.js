/**
 * DIAGNOSE DATABASE ISSUE
 * 
 * This script investigates the critical issue where:
 * 1. Number box clicks save successfully to database
 * 2. After page refresh, only old clicks are restored (not new ones)
 * 3. "Show Clicked Numbers" displays "Present in data: 0"
 * 
 * SUSPECTED ISSUES:
 * - DualServiceManager table not being created properly
 * - New clicks not actually saving to database despite success messages
 * - Data retrieval filtering out new records
 * - Date/time issues causing records to be missed
 */

import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = 'https://eoatuanzdfrfvmqeeyms.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvYXR1YW56ZGZyZnZtcWVleW1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM1NjA5MjAsImV4cCI6MjA0OTEzNjkyMH0.8t9I5D1BKADx1qD-7O8nVrKgFGdTBDrRAUIbOHtY6HE'

const supabase = createClient(supabaseUrl, supabaseKey)

const testUserId = 'sing maya'
const testDate = '2025-07-21' // Recent test date
const testTable = 'number_box_clicks'

async function diagnoseDatabaseIssue() {
  console.log('🔍 DIAGNOSING DATABASE ISSUE')
  console.log('=====================================\n')
  
  try {
    // 1. Check if table exists
    console.log('1️⃣ CHECKING TABLE EXISTENCE')
    console.log('----------------------------')
    
    const { data: tableCheck, error: tableError } = await supabase
      .from(testTable)
      .select('count', { count: 'exact', head: true })
      .limit(1)
    
    if (tableError) {
      console.log('❌ TABLE ISSUE:', tableError.message)
      console.log('🔧 SOLUTION: Create table using CREATE-NUMBER-BOX-CLICKS-TABLE.sql')
      return
    }
    
    console.log('✅ Table exists and is accessible\n')
    
    // 2. Check all records for test user
    console.log('2️⃣ CHECKING ALL RECORDS FOR USER')
    console.log('--------------------------------')
    
    const { data: allRecords, error: allError } = await supabase
      .from(testTable)
      .select('*')
      .eq('user_id', testUserId)
      .order('updated_at', { ascending: false })
    
    if (allError) {
      console.log('❌ ERROR FETCHING RECORDS:', allError.message)
      return
    }
    
    console.log(`📊 TOTAL RECORDS FOR USER "${testUserId}": ${allRecords?.length || 0}`)
    
    if (allRecords && allRecords.length > 0) {
      console.log('\n📋 ALL RECORDS:')
      allRecords.forEach((record, index) => {
        console.log(`${index + 1}. ID: ${record.id}`)
        console.log(`   📅 Date: ${record.date_key}`)
        console.log(`   📋 Set: ${record.set_name}`)
        console.log(`   🔢 Number: ${record.number_value} | HR: ${record.hr_number}`)
        console.log(`   ✅ Clicked: ${record.is_clicked} | 📍 Present: ${record.is_present}`)
        console.log(`   🕒 Created: ${record.clicked_at}`)
        console.log(`   🔄 Updated: ${record.updated_at}\n`)
      })
    } else {
      console.log('❌ NO RECORDS FOUND FOR THIS USER')
    }
    
    // 3. Check specific date records
    console.log('3️⃣ CHECKING RECORDS FOR SPECIFIC DATE')
    console.log('------------------------------------')
    
    const { data: dateRecords, error: dateError } = await supabase
      .from(testTable)
      .select('*')
      .eq('user_id', testUserId)
      .eq('date_key', testDate)
      .eq('is_clicked', true)
      .order('updated_at', { ascending: false })
    
    if (dateError) {
      console.log('❌ ERROR FETCHING DATE RECORDS:', dateError.message)
      return
    }
    
    console.log(`📊 RECORDS FOR DATE "${testDate}": ${dateRecords?.length || 0}`)
    
    if (dateRecords && dateRecords.length > 0) {
      console.log('\n📋 DATE-SPECIFIC RECORDS:')
      dateRecords.forEach((record, index) => {
        console.log(`${index + 1}. Number ${record.number_value} (HR ${record.hr_number})`)
        console.log(`   📋 Set: ${record.set_name}`)
        console.log(`   📍 Present in data: ${record.is_present}`)
        console.log(`   🕒 Last updated: ${record.updated_at}`)
      })
    } else {
      console.log('❌ NO CLICKED RECORDS FOUND FOR THIS DATE')
    }
    
    // 4. Check recent records (last hour)
    console.log('\n4️⃣ CHECKING RECENT RECORDS (LAST HOUR)')
    console.log('-------------------------------------')
    
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    
    const { data: recentRecords, error: recentError } = await supabase
      .from(testTable)
      .select('*')
      .eq('user_id', testUserId)
      .gte('updated_at', oneHourAgo)
      .order('updated_at', { ascending: false })
    
    if (recentError) {
      console.log('❌ ERROR FETCHING RECENT RECORDS:', recentError.message)
      return
    }
    
    console.log(`📊 RECENT RECORDS (LAST HOUR): ${recentRecords?.length || 0}`)
    
    if (recentRecords && recentRecords.length > 0) {
      console.log('\n📋 RECENT ACTIVITY:')
      recentRecords.forEach((record, index) => {
        const minutesAgo = Math.round((Date.now() - new Date(record.updated_at).getTime()) / (1000 * 60))
        console.log(`${index + 1}. Number ${record.number_value} (${minutesAgo} minutes ago)`)
        console.log(`   📅 Date: ${record.date_key} | HR: ${record.hr_number}`)
        console.log(`   📋 Set: ${record.set_name}`)
        console.log(`   ✅ Clicked: ${record.is_clicked}`)
      })
    } else {
      console.log('❌ NO RECENT ACTIVITY FOUND')
      console.log('💡 This suggests new clicks might not be saving to database')
    }
    
    // 5. Simulate the exact query used by loadNumberBoxClicks
    console.log('\n5️⃣ SIMULATING LOAD QUERY (EXACT REPLICA)')
    console.log('----------------------------------------')
    
    // This is the exact query used in getAllNumberBoxClicksForUserDate
    const { data: loadQuery, error: loadError } = await supabase
      .from(testTable)
      .select('*')
      .eq('user_id', testUserId)
      .eq('date_key', testDate)
      .eq('is_clicked', true)
      .order('updated_at', { ascending: false })
    
    if (loadError) {
      console.log('❌ LOAD QUERY ERROR:', loadError.message)
      return
    }
    
    console.log(`📊 LOAD QUERY RESULTS: ${loadQuery?.length || 0} records`)
    
    if (loadQuery && loadQuery.length > 0) {
      console.log('✅ Load query would return data - restoration should work')
      
      // Show what would be restored
      console.log('\n📋 WOULD BE RESTORED:')
      loadQuery.forEach((record, index) => {
        console.log(`${index + 1}. Number ${record.number_value} (HR ${record.hr_number})`)
        console.log(`   📋 Set: ${record.set_name}`)
        console.log(`   📍 Present: ${record.is_present}`)
      })
    } else {
      console.log('❌ Load query returns empty - this is the restoration problem!')
    }
    
    // 6. Check for common issues
    console.log('\n6️⃣ DIAGNOSTIC SUMMARY')
    console.log('--------------------')
    
    if (!allRecords || allRecords.length === 0) {
      console.log('🚨 CRITICAL: No records exist for this user')
      console.log('💡 SOLUTION: Check if DualServiceManager.saveNumberBoxClick is actually working')
    } else if (!dateRecords || dateRecords.length === 0) {
      console.log('🚨 CRITICAL: No records exist for the test date')
      console.log('💡 SOLUTION: Check date formatting or use a different test date')
    } else if (!recentRecords || recentRecords.length === 0) {
      console.log('🚨 CRITICAL: No recent activity despite user reporting successful saves')
      console.log('💡 SOLUTION: Check if saves are actually reaching database')
    } else {
      console.log('✅ Database appears healthy - issue may be in restoration logic')
    }
    
    console.log('\n🔧 RECOMMENDED ACTIONS:')
    console.log('1. Check browser console for DualServiceManager save/error messages')
    console.log('2. Test clicking a number and immediately refresh to see if it saves')
    console.log('3. Check if date format matches between save and load operations')
    console.log('4. Verify HR number consistency between save and load')
    
  } catch (error) {
    console.log('❌ DIAGNOSTIC ERROR:', error.message)
    console.log('💡 This might indicate connection or authentication issues')
  }
}

// Run the diagnosis
diagnoseDatabaseIssue()
