#!/usr/bin/env node

/**
 * Test database connection and attempt to load real ABCD/BCD numbers
 * This simulates clicking the "🔄 Refresh Database" button
 */

console.log('🔍 TESTING DATABASE CONNECTION');
console.log('==============================');

try {
  // Import the database service (simulating the refresh button click)
  const { abcdBcdDatabaseService } = await import('./src/services/abcdBcdDatabaseService.js');
  
  console.log('✅ Database service imported successfully');
  console.log('🔄 Attempting to load ABCD/BCD numbers from database...');
  
  // This is what happens when you click "🔄 Refresh Database"
  const result = await abcdBcdDatabaseService.getAllTopicNumbers();
  
  if (result.success) {
    console.log('🎉 SUCCESS! Real data loaded from database');
    console.log('📊 Database Status:', {
      totalTopics: result.data.totalTopics,
      source: result.data.source,
      lastUpdated: result.data.lastUpdated
    });
    
    // Show sample of real data
    const topicNames = Object.keys(result.data.topicNumbers);
    console.log('📋 Sample Topics Found:');
    topicNames.slice(0, 5).forEach(topic => {
      const numbers = result.data.topicNumbers[topic];
      console.log(`   ${topic}: ABCD[${numbers.abcd.join(', ')}] BCD[${numbers.bcd.join(', ')}]`);
    });
    
    // Check D-1 Set-1 specifically
    const d1Set1 = result.data.topicNumbers['D-1 Set-1 Matrix'];
    if (d1Set1) {
      console.log('\n🎯 D-1 Set-1 Matrix (the one you see as fallback):');
      console.log(`   REAL DATABASE VALUES: ABCD[${d1Set1.abcd.join(', ')}] BCD[${d1Set1.bcd.join(', ')}]`);
      console.log(`   FALLBACK VALUES: ABCD[10, 12] BCD[4, 11]`);
      
      if (d1Set1.abcd.join(',') === '10,12' && d1Set1.bcd.join(',') === '4,11') {
        console.log('   📝 NOTE: Database has same values as fallback');
      } else {
        console.log('   🆕 NOTE: Database has DIFFERENT values than fallback');
      }
    }
    
    console.log('\n✅ SOLUTION: Click "🔄 Refresh Database" in browser to load this real data');
    
  } else {
    console.log('❌ FAILED to load from database');
    console.log('📄 Error:', result.error);
    
    if (result.error.includes('relation "topic_abcd_bcd_numbers" does not exist')) {
      console.log('\n🔧 DATABASE SETUP NEEDED:');
      console.log('1. The database table "topic_abcd_bcd_numbers" does not exist');
      console.log('2. Run: node browser-database-setup.js');
      console.log('3. Or create table manually in Supabase dashboard');
    } else if (result.error.includes('No topic numbers found')) {
      console.log('\n📊 DATABASE EMPTY:');
      console.log('1. Table exists but contains no data');
      console.log('2. Upload Excel data to populate calculations');
      console.log('3. Or run setup script to populate with default values');
    }
    
    console.log('\n📋 ALTERNATIVE DATA SOURCES:');
    console.log('• Upload Excel file to calculate real ABCD/BCD numbers');
    console.log('• Use Past Days analysis data');
    console.log('• Use Rule-2 analysis data');
  }
  
} catch (error) {
  console.log('💥 ERROR testing database connection:');
  console.log('   ', error.message);
  
  if (error.message.includes('Cannot find module')) {
    console.log('\n🔧 MODULE ISSUE:');
    console.log('• Database service may need Node.js environment setup');
    console.log('• Browser-based refresh button should work instead');
  }
}

console.log('\n🎯 NEXT STEPS:');
console.log('1. Go to http://localhost:5173 in browser');
console.log('2. Navigate to Planets Analysis page');
console.log('3. Click "🔄 Refresh Database" button');
console.log('4. If that fails, upload Excel data file');
