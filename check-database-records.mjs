// Real Database Check - Matrix Highlighting Issue
// Check actual database records for user "sing maya" on 2025-08-18

import { supabase } from './src/supabaseClient.js';

const checkDatabaseRecords = async () => {
  try {
    console.log('🔍 Checking actual database records...');
    
    // Check topic_clicks table for user "sing maya" on 2025-08-18
    const { data: topicClicks, error } = await supabase
      .from('topic_clicks')
      .select('*')
      .eq('user_id', 'sing maya')
      .eq('date_key', '2025-08-18')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    console.log('📊 Database Records for sing maya on 2025-08-18:');
    console.log('Total records:', topicClicks.length);
    
    // Group by topic and hour
    const groupedData = {};
    topicClicks.forEach(record => {
      const key = `${record.topic_name}-HR${record.hour}`;
      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      groupedData[key].push(record.clicked_number);
    });
    
    console.log('\n📋 Grouped by Topic-Hour:');
    Object.keys(groupedData).forEach(key => {
      console.log(`  ${key}: [${groupedData[key].join(', ')}]`);
    });
    
    // Check specifically for D-1 Set-1 HR1
    const d1Set1Hr1 = topicClicks.filter(record => 
      record.topic_name === 'D-1 Set-1' && record.hour === 1
    );
    
    console.log('\n🎯 D-1 Set-1 HR1 Records:');
    d1Set1Hr1.forEach((record, index) => {
      console.log(`  ${index + 1}. Number: ${record.clicked_number}, Time: ${record.created_at}`);
    });
    
    // Check if there are multiple entries for different hours
    const allD1Set1 = topicClicks.filter(record => 
      record.topic_name === 'D-1 Set-1'
    );
    
    console.log('\n📊 All D-1 Set-1 Records (all hours):');
    allD1Set1.forEach((record, index) => {
      console.log(`  ${index + 1}. HR${record.hour}: Number ${record.clicked_number}, Time: ${record.created_at}`);
    });
    
    // Check for any records with numbers 5, 12, 9 (the wrongly highlighted ones)
    const wrongNumbers = topicClicks.filter(record => 
      [5, 12, 9].includes(record.clicked_number)
    );
    
    console.log('\n❌ Records with wrong numbers (5, 12, 9):');
    if (wrongNumbers.length > 0) {
      wrongNumbers.forEach((record, index) => {
        console.log(`  ${index + 1}. ${record.topic_name} HR${record.hour}: Number ${record.clicked_number}, Time: ${record.created_at}`);
      });
    } else {
      console.log('  None found - this suggests local click state or sync logic issue');
    }
    
    // Check for any other users or dates that might be interfering
    const { data: allRecords, error: allError } = await supabase
      .from('topic_clicks')
      .select('user_id, date_key, topic_name, hour, clicked_number')
      .limit(50)
      .order('created_at', { ascending: false });
    
    if (!allError) {
      console.log('\n📈 Recent Records (last 50):');
      const recentGrouped = {};
      allRecords.forEach(record => {
        const key = `${record.user_id}-${record.date_key}-${record.topic_name}-HR${record.hour}`;
        if (!recentGrouped[key]) {
          recentGrouped[key] = [];
        }
        recentGrouped[key].push(record.clicked_number);
      });
      
      Object.keys(recentGrouped).slice(0, 10).forEach(key => {
        console.log(`  ${key}: [${recentGrouped[key].join(', ')}]`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
  }
};

checkDatabaseRecords();
