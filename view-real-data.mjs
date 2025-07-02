// view-real-data.mjs - Script to view real ABCD/BCD data instead of fallback values

import { DataService } from './src/services/dataService.js';

console.log('🔍 VIEWING REAL ABCD/BCD DATA');
console.log('=============================');

async function viewRealData() {
  try {
    // Get list of available users from localStorage data
    console.log('\n📋 Step 1: Finding available users...');
    
    // Get users from DataService
    const dataService = new DataService();
    const users = await dataService.getUsers();
    
    if (!users.length) {
      console.log('❌ No users found. Creating sample data...');
      await dataService.createSampleData('demo-user-2025');
      const updatedUsers = await dataService.getUsers();
      console.log(`✅ Created sample data. Available users: ${updatedUsers.length}`);
    }
    
    const selectedUser = users[0] || 'demo-user-2025';
    console.log(`👤 Using user: ${selectedUser}`);
    
    // Get available dates for this user
    console.log('\n📅 Step 2: Finding available dates...');
    const datesList = await dataService.getDates(selectedUser);
    
    if (!datesList.length) {
      console.log('❌ No dates found for user');
      return;
    }
    
    console.log(`📆 Found ${datesList.length} dates: ${datesList.slice(0, 3).join(', ')}${datesList.length > 3 ? '...' : ''}`);
    
    // Get real ABCD/BCD analysis data
    console.log('\n🔬 Step 3: Loading real ABCD/BCD analysis...');
    
    // Import the planets analysis data service
    const { PlanetsAnalysisDataService } = await import('./src/services/planetsAnalysisDataService.js');
    
    const result = await PlanetsAnalysisDataService.getLatestAnalysisNumbers(
      selectedUser,
      datesList,
      1 // HR 1
    );
    
    if (result.success) {
      console.log('✅ Real data loaded successfully!');
      console.log(`📊 Data source: ${result.data.source}`);
      console.log(`📅 Analysis date: ${result.data.analysisDate}`);
      console.log(`🔢 HR number: ${result.data.hrNumber}`);
      console.log(`📋 Total topics: ${result.data.totalTopics}`);
      
      console.log('\n🎯 REAL ABCD/BCD NUMBERS:');
      console.log('========================');
      
      // Show specific topic numbers
      const topicNumbers = result.data.topicNumbers;
      
      // Focus on the D-1 sets mentioned in your question
      const d1Set1 = topicNumbers['D-1 Set-1 Matrix'];
      const d1Set2 = topicNumbers['D-1 Set-2 Matrix'];
      
      if (d1Set1) {
        console.log(`D-1 Set-1 Matrix:`);
        console.log(`  ABCD: [${d1Set1.abcd.join(', ')}]`);
        console.log(`  BCD:  [${d1Set1.bcd.join(', ')}]`);
      }
      
      if (d1Set2) {
        console.log(`D-1 Set-2 Matrix:`);
        console.log(`  ABCD: [${d1Set2.abcd.join(', ')}]`);
        console.log(`  BCD:  [${d1Set2.bcd.join(', ')}]`);
      }
      
      console.log('\n📊 All available topics:');
      Object.entries(topicNumbers).forEach(([topicName, numbers]) => {
        console.log(`${topicName}:`);
        console.log(`  ABCD: [${numbers.abcd.join(', ')}]`);
        console.log(`  BCD:  [${numbers.bcd.join(', ')}]`);
      });
      
      // Compare with fallback values
      console.log('\n🔄 Comparison with fallback values:');
      console.log('===================================');
      console.log('Fallback D-1 Set-1: ABCD[10, 12], BCD[4, 11]');
      if (d1Set1) {
        console.log(`Real D-1 Set-1:     ABCD[${d1Set1.abcd.join(', ')}], BCD[${d1Set1.bcd.join(', ')}]`);
        const abcdMatch = JSON.stringify(d1Set1.abcd.sort()) === JSON.stringify([10, 12].sort());
        const bcdMatch = JSON.stringify(d1Set1.bcd.sort()) === JSON.stringify([4, 11].sort());
        console.log(`Match: ABCD ${abcdMatch ? '✅' : '❌'}, BCD ${bcdMatch ? '✅' : '❌'}`);
      }
      
    } else {
      console.log('❌ Failed to load real data:', result.error);
      console.log('💡 This means the system is using fallback values instead of real calculated data');
    }
    
  } catch (error) {
    console.error('💥 Error viewing real data:', error);
    console.log('\n📝 This error indicates:');
    console.log('   - Real analysis data is not available');
    console.log('   - System is using hardcoded fallback values');
    console.log('   - The [10, 12], [4, 11] shown are placeholder numbers');
  }
}

// Run the script
viewRealData().then(() => {
  console.log('\n✨ Real data analysis complete!');
}).catch(console.error);
