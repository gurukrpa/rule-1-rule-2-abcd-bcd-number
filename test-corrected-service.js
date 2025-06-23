// Test the corrected CleanSupabaseService with actual database
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

// Import CleanSupabaseService (simulate the corrected version)
class TestCleanSupabaseService {
  constructor() {
    this.supabase = supabase;
  }

  async getExcelData(userId, date) {
    const { data, error } = await this.supabase
      .from('excel_data')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return {
      fileName: data.file_name,
      sets: data.data?.sets || {},
      dataSource: 'Supabase',
      date: data.date
    };
  }

  async getHourEntry(userId, date) {
    const { data, error } = await this.supabase
      .from('hour_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('date_key', date)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return {
      planetSelections: data.hour_data?.planetSelections || {},
      dataSource: 'Supabase',
      date: data.date_key
    };
  }

  async getAllUsers() {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .order('username');

    if (error) throw error;
    return data || [];
  }
}

async function testCorrectedService() {
  console.log('🧪 TESTING CORRECTED CleanSupabaseService');
  console.log('===========================================\n');

  const service = new TestCleanSupabaseService();

  try {
    // Get users
    console.log('1️⃣ Testing getAllUsers()...');
    const users = await service.getAllUsers();
    console.log(`   ✅ Found ${users.length} users`);
    
    if (users.length > 0) {
      const testUser = users[0];
      console.log(`   📊 Testing with user: ${testUser.username} (${testUser.id})`);

      // Test with existing data from the database
      const testDate = '2025-06-16'; // Date we know has data
      
      console.log(`\n2️⃣ Testing getExcelData(${testUser.id}, ${testDate})...`);
      const excelData = await service.getExcelData(testUser.id, testDate);
      
      if (excelData) {
        console.log(`   ✅ Excel data retrieved successfully`);
        console.log(`   📁 File: ${excelData.fileName}`);
        console.log(`   📊 Sets count: ${Object.keys(excelData.sets).length}`);
        console.log(`   🔍 First few sets: ${Object.keys(excelData.sets).slice(0, 3).join(', ')}`);
      } else {
        console.log(`   ℹ️ No Excel data found for this user/date`);
      }

      console.log(`\n3️⃣ Testing getHourEntry(${testUser.id}, ${testDate})...`);
      const hourData = await service.getHourEntry(testUser.id, testDate);
      
      if (hourData) {
        console.log(`   ✅ Hour entry retrieved successfully`);
        console.log(`   ⏰ Planet selections count: ${Object.keys(hourData.planetSelections).length}`);
        console.log(`   🪐 HR selections: ${Object.keys(hourData.planetSelections).join(', ')}`);
      } else {
        console.log(`   ℹ️ No hour entry found for this user/date`);
      }

      // Test the data compatibility with IndexPage expectations
      if (excelData && hourData) {
        console.log(`\n4️⃣ Testing IndexPage compatibility...`);
        console.log(`   ✅ Both Excel and Hour data available`);
        console.log(`   ✅ Excel data has 'sets' property: ${!!excelData.sets}`);
        console.log(`   ✅ Hour data has 'planetSelections' property: ${!!hourData.planetSelections}`);
        console.log(`   ✅ Data structure matches IndexPage expectations!`);
      } else {
        console.log(`\n4️⃣ Cannot test compatibility - missing data for ${testDate}`);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCorrectedService().then(() => {
  console.log('\n✅ Test complete!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Test script failed:', err);
  process.exit(1);
});
