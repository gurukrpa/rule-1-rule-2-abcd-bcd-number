#!/usr/bin/env node

// Inspect All Supabase Tables
// This script will retrieve all tables and their data from Supabase

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in environment variables');
    console.log('Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 SUPABASE DATABASE INSPECTION');
console.log('=====================================\n');

// List of all known tables to check
const tablesToCheck = [
    'number_box_clicks',
    'abcd_bcd_analysis_results', 
    'rule2_analysis_results',
    'user_dates_abcd',
    'excel_data',
    'hour_entries'
];

async function inspectTable(tableName) {
    try {
        console.log(`📊 TABLE: ${tableName}`);
        console.log('─'.repeat(50));

        // Get table data
        const { data, error, count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact' });

        if (error) {
            console.log(`❌ Error accessing table: ${error.message}\n`);
            return;
        }

        console.log(`📈 Total Records: ${count || 0}`);
        
        if (data && data.length > 0) {
            console.log(`🔑 Columns: ${Object.keys(data[0]).join(', ')}`);
            console.log(`\n📋 Sample Records (first 3):`);
            
            data.slice(0, 3).forEach((record, index) => {
                console.log(`\n  Record ${index + 1}:`);
                Object.entries(record).forEach(([key, value]) => {
                    const displayValue = typeof value === 'string' && value.length > 50 
                        ? value.substring(0, 50) + '...' 
                        : value;
                    console.log(`    ${key}: ${displayValue}`);
                });
            });

            if (data.length > 3) {
                console.log(`\n  ... and ${data.length - 3} more records`);
            }
        } else {
            console.log('📝 No records found');
        }

        console.log('\n');
        
    } catch (err) {
        console.log(`❌ Unexpected error with table ${tableName}: ${err.message}\n`);
    }
}

async function inspectAllTables() {
    console.log(`🚀 Checking ${tablesToCheck.length} tables...\n`);
    
    for (const table of tablesToCheck) {
        await inspectTable(table);
    }
    
    console.log('✅ Database inspection complete!');
    console.log('=====================================');
}

// Run the inspection
inspectAllTables().catch(console.error);
