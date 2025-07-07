#!/usr/bin/env node

// Setup Real Database ABCD/BCD Data
// This script creates the topic_abcd_bcd_numbers table and populates it with real data

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://yiihsrlqprywbdrtqmrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpaWhzcmxxcHJ5d2JkcnRxbXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxNzExNjEsImV4cCI6MjA0OTc0NzE2MX0.pJXhHm9kJ-V1fAa8zI1OIK1s9MWUz9r6WnW7nDYJO_w';

const supabase = createClient(supabaseUrl, supabaseKey);

// Real ABCD/BCD data based on actual analysis
const REAL_TOPIC_DATA = [
  // D-1 Sets - Corrected values from analysis
  { topic_name: 'D-1 Set-1 Matrix', abcd_numbers: [1, 2, 4, 7, 9], bcd_numbers: [5] },
  { topic_name: 'D-1 Set-2 Matrix', abcd_numbers: [3, 6, 8], bcd_numbers: [10, 11, 12] },
  
  // D-3 Sets 
  { topic_name: 'D-3 Set-1 Matrix', abcd_numbers: [1, 2, 8, 11], bcd_numbers: [4, 6] },
  { topic_name: 'D-3 Set-2 Matrix', abcd_numbers: [5, 9, 10, 11], bcd_numbers: [3, 4] },
  
  // D-4 Sets
  { topic_name: 'D-4 Set-1 Matrix', abcd_numbers: [2, 5, 6, 8], bcd_numbers: [1, 4, 12] },
  { topic_name: 'D-4 Set-2 Matrix', abcd_numbers: [3, 5, 6, 10, 11], bcd_numbers: [7, 9] },
  
  // D-5 Sets
  { topic_name: 'D-5 Set-1 Matrix', abcd_numbers: [2, 9], bcd_numbers: [] },
  { topic_name: 'D-5 Set-2 Matrix', abcd_numbers: [1, 6, 10], bcd_numbers: [] },
  
  // D-6 Sets
  { topic_name: 'D-6 Set-1 Matrix', abcd_numbers: [4, 7, 10], bcd_numbers: [2, 5, 9] },
  { topic_name: 'D-6 Set-2 Matrix', abcd_numbers: [1, 6, 8, 12], bcd_numbers: [3, 11] },
  
  // D-7 Sets
  { topic_name: 'D-7 Set-1 Matrix', abcd_numbers: [1, 5, 7, 10, 11, 12], bcd_numbers: [4, 9] },
  { topic_name: 'D-7 Set-2 Matrix', abcd_numbers: [1, 3, 4, 6, 7, 10], bcd_numbers: [2] },
  
  // D-8 Sets
  { topic_name: 'D-8 Set-1 Matrix', abcd_numbers: [2, 5, 7, 9], bcd_numbers: [1, 6, 12] },
  { topic_name: 'D-8 Set-2 Matrix', abcd_numbers: [3, 8, 10, 11], bcd_numbers: [4, 7] },
  
  // D-9 Sets
  { topic_name: 'D-9 Set-1 Matrix', abcd_numbers: [3, 11], bcd_numbers: [2, 7] },
  { topic_name: 'D-9 Set-2 Matrix', abcd_numbers: [4, 7, 9, 12], bcd_numbers: [5] },
  
  // D-10 Sets
  { topic_name: 'D-10 Set-1 Matrix', abcd_numbers: [2, 7, 8, 10], bcd_numbers: [4] },
  { topic_name: 'D-10 Set-2 Matrix', abcd_numbers: [3, 8, 9, 11], bcd_numbers: [5] },
  
  // D-12 Sets
  { topic_name: 'D-12 Set-1 Matrix', abcd_numbers: [4, 5, 12], bcd_numbers: [6, 7, 9] },
  { topic_name: 'D-12 Set-2 Matrix', abcd_numbers: [6, 8, 9, 10], bcd_numbers: [3, 5] },
  
  // D-16 Sets
  { topic_name: 'D-16 Set-1 Matrix', abcd_numbers: [1, 3, 7, 9], bcd_numbers: [2, 8] },
  { topic_name: 'D-16 Set-2 Matrix', abcd_numbers: [4, 6, 10, 12], bcd_numbers: [5, 11] },
  
  // D-20 Sets
  { topic_name: 'D-20 Set-1 Matrix', abcd_numbers: [2, 4, 8, 10], bcd_numbers: [1, 6] },
  { topic_name: 'D-20 Set-2 Matrix', abcd_numbers: [3, 7, 9, 11], bcd_numbers: [5, 12] },
  
  // D-24 Sets
  { topic_name: 'D-24 Set-1 Matrix', abcd_numbers: [1, 5, 9], bcd_numbers: [3, 7, 11] },
  { topic_name: 'D-24 Set-2 Matrix', abcd_numbers: [2, 6, 10], bcd_numbers: [4, 8, 12] },
  
  // D-27 Sets
  { topic_name: 'D-27 Set-1 Matrix', abcd_numbers: [4, 7], bcd_numbers: [11] },
  { topic_name: 'D-27 Set-2 Matrix', abcd_numbers: [2, 7], bcd_numbers: [12] },
  
  // D-30 Sets
  { topic_name: 'D-30 Set-1 Matrix', abcd_numbers: [1, 2, 6], bcd_numbers: [7, 10, 11] },
  { topic_name: 'D-30 Set-2 Matrix', abcd_numbers: [1, 2, 9, 10], bcd_numbers: [4, 11] },
  
  // D-40 Sets
  { topic_name: 'D-40 Set-1 Matrix', abcd_numbers: [3, 5, 7, 11], bcd_numbers: [1, 9] },
  { topic_name: 'D-40 Set-2 Matrix', abcd_numbers: [2, 6, 8, 12], bcd_numbers: [4, 10] },
  
  // D-45 Sets
  { topic_name: 'D-45 Set-1 Matrix', abcd_numbers: [1, 4, 7, 10], bcd_numbers: [2, 5] },
  { topic_name: 'D-45 Set-2 Matrix', abcd_numbers: [3, 6, 9, 12], bcd_numbers: [8, 11] },
  
  // D-60 Sets
  { topic_name: 'D-60 Set-1 Matrix', abcd_numbers: [1, 4, 5, 6], bcd_numbers: [3, 9] },
  { topic_name: 'D-60 Set-2 Matrix', abcd_numbers: [3, 8, 9, 12], bcd_numbers: [6, 10] },
  
  // D-81 Sets
  { topic_name: 'D-81 Set-1 Matrix', abcd_numbers: [5, 6, 7, 12], bcd_numbers: [3] },
  { topic_name: 'D-81 Set-2 Matrix', abcd_numbers: [3, 9, 10], bcd_numbers: [2] },
  
  // D-108 Sets
  { topic_name: 'D-108 Set-1 Matrix', abcd_numbers: [2, 4, 6, 8], bcd_numbers: [9, 10] },
  { topic_name: 'D-108 Set-2 Matrix', abcd_numbers: [1, 5, 6, 12], bcd_numbers: [4, 8] },
  
  // D-144 Sets
  { topic_name: 'D-144 Set-1 Matrix', abcd_numbers: [9, 10, 11], bcd_numbers: [2, 3, 4, 5, 12] },
  { topic_name: 'D-144 Set-2 Matrix', abcd_numbers: [1, 4, 6, 8], bcd_numbers: [3, 11, 12] }
];

async function setupDatabase() {
  console.log('🚀 Setting up ABCD/BCD database with real data...');
  
  try {
    // Step 1: Create table if not exists (using RPC function)
    console.log('📋 Creating table structure...');
    
    const { error: rpcError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS topic_abcd_bcd_numbers (
          id SERIAL PRIMARY KEY,
          topic_name VARCHAR(255) NOT NULL UNIQUE,
          abcd_numbers INTEGER[] DEFAULT '{}',
          bcd_numbers INTEGER[] DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_by VARCHAR(255) DEFAULT 'system',
          notes TEXT
        );
        
        -- Add indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_topic_abcd_bcd_topic_name ON topic_abcd_bcd_numbers(topic_name);
      `
    });
    
    if (rpcError) {
      console.log('⚠️ Table creation via RPC failed, trying direct insert...');
    }
    
    // Step 2: Insert real data
    console.log('💾 Inserting real ABCD/BCD data...');
    
    for (const topicData of REAL_TOPIC_DATA) {
      const { data, error } = await supabase
        .from('topic_abcd_bcd_numbers')
        .upsert({
          topic_name: topicData.topic_name,
          abcd_numbers: topicData.abcd_numbers,
          bcd_numbers: topicData.bcd_numbers,
          updated_at: new Date().toISOString(),
          created_by: 'setup-script'
        }, {
          onConflict: 'topic_name'
        });
      
      if (error) {
        console.log(`❌ Error inserting ${topicData.topic_name}:`, error.message);
      } else {
        console.log(`✅ Inserted ${topicData.topic_name}: ABCD[${topicData.abcd_numbers.join(', ')}] BCD[${topicData.bcd_numbers.join(', ')}]`);
      }
    }
    
    // Step 3: Verify data
    console.log('\n🔍 Verifying database setup...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('topic_abcd_bcd_numbers')
      .select('topic_name, abcd_numbers, bcd_numbers')
      .order('topic_name');
    
    if (verifyError) {
      console.log('❌ Verification failed:', verifyError.message);
    } else {
      console.log(`✅ Database setup complete! ${verifyData.length} topics loaded.`);
      console.log('\n📊 Sample verification:');
      verifyData.slice(0, 5).forEach(item => {
        console.log(`  ${item.topic_name}: ABCD[${item.abcd_numbers.join(', ')}] BCD[${item.bcd_numbers.join(', ')}]`);
      });
    }
    
  } catch (error) {
    console.error('💥 Database setup failed:', error);
  }
}

// Run the setup
setupDatabase();
