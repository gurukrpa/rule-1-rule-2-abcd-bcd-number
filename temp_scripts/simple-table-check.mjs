#!/usr/bin/env node

/**
 * Simple Supabase Tables Check
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zndkprjytuhzufdqhnmt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuZGtwcmp5dHVoenVmZHFobm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0OTg5OTgsImV4cCI6MjA1OTA3NDk5OH0._1xM__KPGNlr3HG3-An2fy3kKfIxWU-AXJnrMpdWYok';

console.log('🔍 Simple Supabase Tables Check');
console.log('================================');

const supabase = createClient(supabaseUrl, supabaseKey);

// List of tables to check
const tablesToCheck = [
    'number_box_clicks',
    'abcd_bcd_analysis_results', 
    'rule2_analysis_results',
    'user_dates_abcd',
    'excel_data',
    'hour_entries'
];

async function checkTable(tableName) {
    try {
        console.log(`\n📋 Checking table: ${tableName}`);
        
        const { data, error, count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.log(`❌ Error: ${error.message}`);
            return false;
        }

        console.log(`✅ Table exists with ${count || 0} records`);
        
        // Get a sample record to see structure
        const { data: sample } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);

        if (sample && sample.length > 0) {
            console.log(`📝 Columns: ${Object.keys(sample[0]).join(', ')}`);
            console.log(`📊 Sample: ${JSON.stringify(sample[0], null, 2)}`);
        } else {
            console.log('📭 No data in table');
        }
        
        return true;
    } catch (err) {
        console.log(`❌ Exception: ${err.message}`);
        return false;
    }
}

async function main() {
    console.log(`Connected to: ${supabaseUrl}`);
    
    for (const table of tablesToCheck) {
        await checkTable(table);
    }
    
    console.log('\n✅ Check complete!');
}

main().catch(err => {
    console.error('❌ Script error:', err);
});
