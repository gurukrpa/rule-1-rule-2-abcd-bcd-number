#!/usr/bin/env node

/**
 * Supabase Tables Inspector - Alternative Method
 * 
 * This script retrieves and displays all tables from your Supabase database
 * using the REST API and standard queries.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in environment variables');
    console.error('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY (or VITE_SUPABASE_ANON_KEY)');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// List of common table names to check based on your application
const commonTables = [
    'number_box_clicks',
    'abcd_bcd_analysis_results',
    'rule2_analysis_results',
    'user_dates_abcd',
    'excel_data',
    'hour_entries',
    'users',
    'dates',
    'planets',
    'planet_data',
    'rule1_results',
    'rule2_results',
    'cache_data',
    'analysis_cache'
];

async function checkTableExists(tableName) {
    try {
        const { data, error, count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });

        if (error) {
            // Table doesn't exist or no permission
            return { exists: false, error: error.message, count: 0 };
        }

        return { exists: true, error: null, count: count || 0 };
    } catch (err) {
        return { exists: false, error: err.message, count: 0 };
    }
}

async function getTableSample(tableName, limit = 3) {
    try {
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(limit);

        if (error) {
            return { success: false, error: error.message, data: null };
        }

        return { success: true, error: null, data: data || [] };
    } catch (err) {
        return { success: false, error: err.message, data: null };
    }
}

async function getTableColumns(tableName) {
    try {
        // Try to get one record to infer column structure
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);

        if (error) {
            return { success: false, columns: [], error: error.message };
        }

        if (data && data.length > 0) {
            const columns = Object.keys(data[0]).map(key => ({
                name: key,
                type: typeof data[0][key],
                sample_value: data[0][key]
            }));
            return { success: true, columns, error: null };
        } else {
            return { success: true, columns: [], error: 'No data to infer columns' };
        }
    } catch (err) {
        return { success: false, columns: [], error: err.message };
    }
}

async function inspectAllTables() {
    console.log('🔍 SUPABASE TABLES INSPECTION');
    console.log('==============================');
    console.log(`Connected to: ${supabaseUrl}`);
    console.log('');

    const existingTables = [];
    const nonExistingTables = [];

    console.log('🔍 Checking common table names...');
    console.log('');

    // Check each common table
    for (const tableName of commonTables) {
        const tableInfo = await checkTableExists(tableName);
        
        if (tableInfo.exists) {
            existingTables.push({ name: tableName, count: tableInfo.count });
            console.log(`✅ ${tableName} - ${tableInfo.count} records`);
        } else {
            nonExistingTables.push({ name: tableName, error: tableInfo.error });
            console.log(`❌ ${tableName} - ${tableInfo.error}`);
        }
    }

    console.log('');
    console.log(`📊 SUMMARY: ${existingTables.length} existing tables, ${nonExistingTables.length} not found`);
    console.log('');

    // Detailed inspection of existing tables
    if (existingTables.length > 0) {
        console.log('📋 DETAILED TABLE INFORMATION');
        console.log('==============================');

        for (const table of existingTables) {
            console.log(`\n📋 TABLE: ${table.name}`);
            console.log('='.repeat(table.name.length + 8));
            console.log(`📊 Record Count: ${table.count}`);

            // Get column information
            const columnInfo = await getTableColumns(table.name);
            if (columnInfo.success && columnInfo.columns.length > 0) {
                console.log('📝 Columns:');
                columnInfo.columns.forEach(col => {
                    const sampleDisplay = col.sample_value !== null && col.sample_value !== undefined 
                        ? `(sample: ${JSON.stringify(col.sample_value)})` 
                        : '(sample: null)';
                    console.log(`   • ${col.name}: ${col.type} ${sampleDisplay}`);
                });
            } else {
                console.log('📝 Columns: Unable to determine structure');
                if (columnInfo.error) {
                    console.log(`   Error: ${columnInfo.error}`);
                }
            }

            // Get sample data
            const sampleInfo = await getTableSample(table.name, 2);
            if (sampleInfo.success && sampleInfo.data.length > 0) {
                console.log('📊 Sample Data:');
                sampleInfo.data.forEach((record, index) => {
                    console.log(`   ${index + 1}. ${JSON.stringify(record, null, 2).replace(/\n/g, '\n      ')}`);
                });
            } else {
                console.log('📊 Sample Data: No data available');
                if (sampleInfo.error) {
                    console.log(`   Error: ${sampleInfo.error}`);
                }
            }
        }
    }

    // Show non-existing tables
    if (nonExistingTables.length > 0) {
        console.log('\n❌ TABLES NOT FOUND');
        console.log('====================');
        nonExistingTables.forEach(table => {
            console.log(`• ${table.name} - ${table.error}`);
        });
    }

    console.log('\n✅ Table inspection complete!');
    console.log('\n💡 To create missing tables, use the SQL files in your project:');
    console.log('   • CREATE-NUMBER-BOX-CLICKS-TABLE.sql');
    console.log('   • CREATE-ABCD-BCD-TABLE.sql');
    console.log('   • CREATE-RULE2-ANALYSIS-RESULTS-TABLE.sql');
}

// Check for specific important tables
async function checkCriticalTables() {
    console.log('\n🔧 CRITICAL TABLES CHECK');
    console.log('=========================');

    const criticalTables = [
        'number_box_clicks',
        'abcd_bcd_analysis_results',
        'rule2_analysis_results'
    ];

    for (const tableName of criticalTables) {
        const tableInfo = await checkTableExists(tableName);
        
        if (tableInfo.exists) {
            console.log(`✅ ${tableName} - READY (${tableInfo.count} records)`);
            
            // For number_box_clicks, check if it has the correct structure
            if (tableName === 'number_box_clicks') {
                const sample = await getTableSample(tableName, 1);
                if (sample.success && sample.data.length > 0) {
                    const hasTextId = typeof sample.data[0].id === 'string';
                    console.log(`   📝 ID type: ${hasTextId ? 'TEXT ✅' : 'UUID ❌'} ${hasTextId ? '(406 fix applied)' : '(needs 406 fix)'}`);
                }
            }
        } else {
            console.log(`❌ ${tableName} - MISSING`);
            console.log(`   Error: ${tableInfo.error}`);
        }
    }
}

// Main execution
async function main() {
    await inspectAllTables();
    await checkCriticalTables();
}

// Run the inspection
main().catch(console.error);
