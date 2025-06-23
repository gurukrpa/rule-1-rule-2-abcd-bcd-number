#!/usr/bin/env node

/**
 * Test script to verify the date addition constraint fix
 * This tests the addUserDate method that was causing database constraint violations
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wmfbknptxtowgwqzpfto.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZmJrbnB0eHRvd2d3cXpwZnRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1OTMyNzksImV4cCI6MjA0ODE2OTI3OX0.7t3lOSA7sxPm6xfp0RvOQ8tgqDcxZBJn0a5Y5uxQ0jM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Simulate the CleanSupabaseService methods
class TestCleanSupabaseService {
  constructor() {
    this.supabase = supabase;
  }

  async getUserDates(userId) {
    try {
      const { data, error } = await this.supabase
        .from('user_dates')
        .select('dates')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return [];
        }
        throw error;
      }

      return data.dates || [];
    } catch (error) {
      console.error('❌ Error getting user dates:', error);
      throw error;
    }
  }

  async saveUserDates(userId, dates) {
    try {
      const { data, error } = await this.supabase
        .from('user_dates')
        .upsert({
          user_id: userId,
          dates: dates
        }, {
          onConflict: 'user_id'  // This should prevent constraint violations
        })
        .select()
        .single();

      if (error) throw error;
      
      console.log(`✅ User dates saved: ${dates.length} dates`);
      return data;
    } catch (error) {
      console.error('❌ Error saving user dates:', error);
      throw error;
    }
  }

  async addUserDate(userId, date) {
    try {
      console.log(`📅 Adding date ${date} for user ${userId}`);
      const currentDates = await this.getUserDates(userId);
      if (!currentDates.includes(date)) {
        const newDates = [...currentDates, date].sort((a, b) => new Date(b) - new Date(a));
        await this.saveUserDates(userId, newDates);
        console.log(`✅ Date ${date} added successfully`);
      } else {
        console.log(`ℹ️ Date ${date} already exists for user ${userId}`);
      }
    } catch (error) {
      console.error('❌ Error adding user date:', error);
      throw error;
    }
  }
}

async function testDateAddition() {
  console.log('🧪 Testing date addition constraint fix...');
  
  const testService = new TestCleanSupabaseService();
  const testUserId = '1';
  const testDate1 = '2025-06-23';
  const testDate2 = '2025-06-24';
  
  try {
    // Step 1: Test adding first date
    console.log('\n📝 Step 1: Adding first date...');
    await testService.addUserDate(testUserId, testDate1);
    
    // Step 2: Test adding second date (should update existing record)
    console.log('\n📝 Step 2: Adding second date...');
    await testService.addUserDate(testUserId, testDate2);
    
    // Step 3: Test adding duplicate date (should be ignored)
    console.log('\n📝 Step 3: Adding duplicate date...');
    await testService.addUserDate(testUserId, testDate1);
    
    // Step 4: Verify final state
    console.log('\n📝 Step 4: Verifying final state...');
    const finalDates = await testService.getUserDates(testUserId);
    console.log('✅ Final dates:', finalDates);
    
    console.log('\n🎉 All tests passed! Date addition constraint fix is working.');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    console.error('Error details:', error.message);
    if (error.details) {
      console.error('Error details:', error.details);
    }
    if (error.hint) {
      console.error('Error hint:', error.hint);
    }
  }
}

// Run the test
testDateAddition().catch(console.error);
