// Debug script to check Rule2 results data in Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dqbrmqvsnvbkwpwkdzha.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxYnJtcXZzbnZia3dwd2tkemhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxMDM1NDQsImV4cCI6MjA0OTY3OTU0NH0.3GLCTA6uH4fBTk0l9hpgMoQdU4ZdBMQXFm2cq0QhGss'

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugRule2Data() {
  console.log('🔍 Checking Rule2 results data in Supabase...')
  
  try {
    // Get all rule2_results records
    const { data, error } = await supabase
      .from('rule2_results')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Error fetching rule2_results:', error)
      return
    }
    
    console.log(`📊 Found ${data?.length || 0} rule2_results records`)
    
    if (data && data.length > 0) {
      console.log('\n🔍 Rule2 Results Data:')
      data.forEach((record, index) => {
        console.log(`\n📋 Record ${index + 1}:`)
        console.log(`   User ID: ${record.user_id}`)
        console.log(`   Date: ${record.date}`)
        console.log(`   ABCD Numbers: [${record.abcd_numbers?.join(', ') || 'none'}]`)
        console.log(`   BCD Numbers: [${record.bcd_numbers?.join(', ') || 'none'}]`)
        console.log(`   Created: ${record.created_at}`)
        console.log(`   Updated: ${record.updated_at}`)
        
        // Check for placeholder data pattern
        const abcdArray = record.abcd_numbers || []
        const isPlaceholderData = JSON.stringify(abcdArray) === JSON.stringify([1,2,3,4,5,6,7,8,9,10,11,12])
        
        if (isPlaceholderData) {
          console.log(`   ⚠️  FOUND PLACEHOLDER DATA! This record has fake [1,2,3,4,5,6,7,8,9,10,11,12] array`)
        }
      })
      
      // Check for any records with the placeholder pattern
      const placeholderRecords = data.filter(record => {
        const abcdArray = record.abcd_numbers || []
        return JSON.stringify(abcdArray) === JSON.stringify([1,2,3,4,5,6,7,8,9,10,11,12])
      })
      
      if (placeholderRecords.length > 0) {
        console.log(`\n🚨 FOUND ${placeholderRecords.length} RECORDS WITH PLACEHOLDER DATA!`)
        console.log('These records need to be cleaned up:')
        placeholderRecords.forEach(record => {
          console.log(`   - User ${record.user_id}, Date ${record.date}`)
        })
        
        // Option to clean up placeholder data
        console.log('\n🧹 Cleaning up placeholder data...')
        for (const record of placeholderRecords) {
          const { error: deleteError } = await supabase
            .from('rule2_results')
            .delete()
            .eq('user_id', record.user_id)
            .eq('date', record.date)
          
          if (deleteError) {
            console.error(`❌ Error deleting placeholder record for ${record.user_id}/${record.date}:`, deleteError)
          } else {
            console.log(`✅ Deleted placeholder record for ${record.user_id}/${record.date}`)
          }
        }
      } else {
        console.log('\n✅ No placeholder data found in database')
      }
    } else {
      console.log('\n📭 No rule2_results records found in database')
    }
    
  } catch (err) {
    console.error('❌ Exception while checking rule2_results:', err)
  }
}

// Run the debug
debugRule2Data()
