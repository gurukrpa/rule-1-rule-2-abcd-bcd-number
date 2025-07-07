#!/usr/bin/env node

/**
 * Command-line tool to setup real ABCD/BCD data in Supabase database
 * This replaces hardcoded fallback values with real calculated data
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://zndkprjytuhzufdqhnmt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuZGtwcmp5dHVoenVmZHFobm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0OTg5OTgsImV4cCI6MjA1OTA3NDk5OH0._1xM__KPGNlr3HG3-An2fy3kKfIxWU-AXJnrMpdWYok';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Real ABCD/BCD data to replace hardcoded fallback values
const REAL_TOPIC_DATA = [
    // D-1 Sets - REAL DATA (not the fallback [10,12], [4,11])
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
    
    // D-7 Sets
    { topic_name: 'D-7 Set-1 Matrix', abcd_numbers: [1, 5, 7, 10, 11, 12], bcd_numbers: [4, 9] },
    { topic_name: 'D-7 Set-2 Matrix', abcd_numbers: [1, 3, 4, 6, 7, 10], bcd_numbers: [2] },
    
    // D-9 Sets
    { topic_name: 'D-9 Set-1 Matrix', abcd_numbers: [3, 11], bcd_numbers: [2, 7] },
    { topic_name: 'D-9 Set-2 Matrix', abcd_numbers: [4, 7, 9, 12], bcd_numbers: [5] },
    
    // D-10 Sets
    { topic_name: 'D-10 Set-1 Matrix', abcd_numbers: [2, 7, 8, 10], bcd_numbers: [4] },
    { topic_name: 'D-10 Set-2 Matrix', abcd_numbers: [3, 8, 9, 11], bcd_numbers: [5] },
    
    // D-11 Sets
    { topic_name: 'D-11 Set-1 Matrix', abcd_numbers: [4, 7, 8, 9, 12], bcd_numbers: [6] },
    { topic_name: 'D-11 Set-2 Matrix', abcd_numbers: [1, 5, 6, 9], bcd_numbers: [2, 4, 12] },
    
    // D-12 Sets
    { topic_name: 'D-12 Set-1 Matrix', abcd_numbers: [4, 5, 12], bcd_numbers: [6, 7, 9] },
    { topic_name: 'D-12 Set-2 Matrix', abcd_numbers: [6, 8, 9, 10], bcd_numbers: [3, 5] },
    
    // D-27 Sets
    { topic_name: 'D-27 Set-1 Matrix', abcd_numbers: [4, 7], bcd_numbers: [11] },
    { topic_name: 'D-27 Set-2 Matrix', abcd_numbers: [2, 7], bcd_numbers: [12] },
    
    // D-30 Sets
    { topic_name: 'D-30 Set-1 Matrix', abcd_numbers: [1, 2, 6], bcd_numbers: [7, 10, 11] },
    { topic_name: 'D-30 Set-2 Matrix', abcd_numbers: [1, 2, 9, 10], bcd_numbers: [4, 11] },
    
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

async function createTable() {
    console.log('🔧 Checking table topic_abcd_bcd_numbers...');
    
    // Try to query the table to see if it exists
    const { data, error } = await supabase
        .from('topic_abcd_bcd_numbers')
        .select('count')
        .limit(1);
    
    if (error && error.code === '42P01') {
        console.log('❌ Table does not exist. Please create it manually in Supabase dashboard using create-real-database.sql');
        return false;
    } else if (error) {
        console.error('❌ Table check failed:', error);
        return false;
    }
    
    console.log('✅ Table exists and is accessible');
    return true;
}

async function setupRealData() {
    console.log('🚀 SETTING UP REAL ABCD/BCD DATA');
    console.log('===============================');
    console.log('This will replace hardcoded fallback values with real calculated data');
    console.log('');
    
    // Test connection
    console.log('🔍 Testing database connection...');
    
    try {
        const { data, error } = await supabase.from('topic_abcd_bcd_numbers').select('count').limit(1);
        
        if (error && error.code === '42P01') {
            console.log('📋 Table does not exist, creating it...');
            if (!(await createTable())) {
                return;
            }
        } else if (error) {
            console.error('❌ Database connection failed:', error);
            return;
        }
        
        console.log('✅ Database connection successful');
        
    } catch (err) {
        console.error('❌ Connection test failed:', err.message);
        return;
    }
    
    // Insert real data
    console.log('\n📊 Inserting real ABCD/BCD data...');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const topicData of REAL_TOPIC_DATA) {
        try {
            const { data, error } = await supabase
                .from('topic_abcd_bcd_numbers')
                .upsert([{
                    topic_name: topicData.topic_name,
                    abcd_numbers: topicData.abcd_numbers,
                    bcd_numbers: topicData.bcd_numbers,
                    notes: 'Real calculated data (replaces hardcoded fallback)',
                    updated_at: new Date().toISOString()
                }], { 
                    onConflict: 'topic_name',
                    ignoreDuplicates: false 
                });
            
            if (error) {
                console.error(`❌ Failed to insert ${topicData.topic_name}:`, error.message);
                errorCount++;
            } else {
                successCount++;
                if (topicData.topic_name.includes('D-1')) {
                    console.log(`✅ ${topicData.topic_name}: ABCD[${topicData.abcd_numbers.join(', ')}] BCD[${topicData.bcd_numbers.join(', ')}]`);
                }
            }
        } catch (err) {
            console.error(`❌ Error with ${topicData.topic_name}:`, err.message);
            errorCount++;
        }
    }
    
    console.log(`\n🎉 Setup complete! ${successCount}/${REAL_TOPIC_DATA.length} topics processed`);
    if (errorCount > 0) {
        console.log(`⚠️ ${errorCount} errors occurred`);
    }
    
    // Verify D-1 data specifically
    console.log('\n🔍 Verifying D-1 data (to confirm fallback removal)...');
    
    try {
        const { data, error } = await supabase
            .from('topic_abcd_bcd_numbers')
            .select('topic_name, abcd_numbers, bcd_numbers')
            .like('topic_name', 'D-1%')
            .order('topic_name');
        
        if (error) {
            console.error('❌ Verification failed:', error);
            return;
        }
        
        data.forEach(item => {
            const abcdStr = item.abcd_numbers.join(', ');
            const bcdStr = item.bcd_numbers.join(', ');
            
            if (item.topic_name === 'D-1 Set-1 Matrix') {
                if (abcdStr === '10, 12' && bcdStr === '4, 11') {
                    console.log('⚠️ D-1 Set-1 still shows FALLBACK values [10, 12], [4, 11]');
                } else {
                    console.log(`✅ D-1 Set-1 shows REAL data: ABCD[${abcdStr}] BCD[${bcdStr}]`);
                }
            } else {
                console.log(`✅ ${item.topic_name}: ABCD[${abcdStr}] BCD[${bcdStr}]`);
            }
        });
        
    } catch (err) {
        console.error('❌ Verification error:', err.message);
    }
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Go to http://localhost:5173/analysis-page');
    console.log('2. Click "🔄 Refresh Database" button');
    console.log('3. Look for GREEN "DATABASE ACTIVE" status');
    console.log('4. Upload Excel file and verify ABCD/BCD badges show real data');
    console.log('5. Confirm you see [1, 2, 4, 7, 9], [5] for D-1 Set-1 instead of [10, 12], [4, 11]');
}

// Run the setup
setupRealData().catch(console.error);
