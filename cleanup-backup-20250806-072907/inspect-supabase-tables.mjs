#!/usr/bin/env node

/**
 * Supabase Tables Inspector
 * 
 * This script retrieves and displays all tables from your Supabase database
 * along with their structure, columns, and relationships.
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

async function getAllTables() {
    try {
        console.log('🔍 FETCHING ALL SUPABASE TABLES');
        console.log('================================');
        console.log(`Connected to: ${supabaseUrl}`);
        console.log('');

        // Query to get all user tables (excluding system tables)
        const { data: tables, error: tablesError } = await supabase
            .rpc('sql', {
                query: `
                    SELECT 
                        table_name,
                        table_type,
                        table_schema
                    FROM information_schema.tables 
                    WHERE table_schema = 'public'
                    AND table_type = 'BASE TABLE'
                    ORDER BY table_name;
                `
            });

        if (tablesError) {
            console.error('❌ Error fetching tables:', tablesError);
            return;
        }

        if (!tables || tables.length === 0) {
            console.log('📋 No tables found in the public schema');
            return;
        }

        console.log(`📊 Found ${tables.length} table(s) in your Supabase database:`);
        console.log('');

        // Process each table
        for (const table of tables) {
            await getTableDetails(table.table_name);
            console.log('');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function getTableDetails(tableName) {
    try {
        console.log(`📋 TABLE: ${tableName}`);
        console.log('='.repeat(tableName.length + 8));

        // Get column information
        const { data: columns, error: columnsError } = await supabase
            .rpc('sql', {
                query: `
                    SELECT 
                        column_name,
                        data_type,
                        is_nullable,
                        column_default,
                        character_maximum_length,
                        numeric_precision,
                        numeric_scale
                    FROM information_schema.columns 
                    WHERE table_name = '${tableName}'
                    AND table_schema = 'public'
                    ORDER BY ordinal_position;
                `
            });

        if (columnsError) {
            console.log(`❌ Error fetching columns for ${tableName}:`, columnsError);
            return;
        }

        // Display columns
        console.log('📝 Columns:');
        if (columns && columns.length > 0) {
            columns.forEach(col => {
                const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)';
                const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
                const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
                
                console.log(`   • ${col.column_name}: ${col.data_type}${length} ${nullable}${defaultVal}`);
            });
        }

        // Get constraints (primary keys, foreign keys, etc.)
        const { data: constraints, error: constraintsError } = await supabase
            .rpc('sql', {
                query: `
                    SELECT 
                        tc.constraint_name,
                        tc.constraint_type,
                        kcu.column_name,
                        ccu.table_name AS foreign_table_name,
                        ccu.column_name AS foreign_column_name
                    FROM information_schema.table_constraints tc
                    LEFT JOIN information_schema.key_column_usage kcu
                        ON tc.constraint_name = kcu.constraint_name
                    LEFT JOIN information_schema.constraint_column_usage ccu
                        ON ccu.constraint_name = tc.constraint_name
                    WHERE tc.table_name = '${tableName}'
                    AND tc.table_schema = 'public'
                    ORDER BY tc.constraint_type, tc.constraint_name;
                `
            });

        if (!constraintsError && constraints && constraints.length > 0) {
            console.log('🔑 Constraints:');
            
            const primaryKeys = constraints.filter(c => c.constraint_type === 'PRIMARY KEY');
            const foreignKeys = constraints.filter(c => c.constraint_type === 'FOREIGN KEY');
            const uniqueKeys = constraints.filter(c => c.constraint_type === 'UNIQUE');
            const checkConstraints = constraints.filter(c => c.constraint_type === 'CHECK');

            if (primaryKeys.length > 0) {
                console.log('   🔑 Primary Keys:');
                primaryKeys.forEach(pk => {
                    console.log(`      • ${pk.column_name}`);
                });
            }

            if (foreignKeys.length > 0) {
                console.log('   🔗 Foreign Keys:');
                foreignKeys.forEach(fk => {
                    console.log(`      • ${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
                });
            }

            if (uniqueKeys.length > 0) {
                console.log('   ✨ Unique Constraints:');
                uniqueKeys.forEach(uk => {
                    console.log(`      • ${uk.column_name} (${uk.constraint_name})`);
                });
            }

            if (checkConstraints.length > 0) {
                console.log('   ✅ Check Constraints:');
                checkConstraints.forEach(cc => {
                    console.log(`      • ${cc.constraint_name}`);
                });
            }
        }

        // Get row count
        try {
            const { data: countData, error: countError } = await supabase
                .from(tableName)
                .select('*', { count: 'exact', head: true });

            if (!countError) {
                console.log(`📊 Row Count: ${countData?.length || 0} records`);
            }
        } catch (countErr) {
            console.log('📊 Row Count: Unable to determine');
        }

        // Get indexes
        const { data: indexes, error: indexesError } = await supabase
            .rpc('sql', {
                query: `
                    SELECT 
                        indexname as index_name,
                        indexdef as index_definition
                    FROM pg_indexes 
                    WHERE tablename = '${tableName}'
                    AND schemaname = 'public'
                    ORDER BY indexname;
                `
            });

        if (!indexesError && indexes && indexes.length > 0) {
            console.log('🔍 Indexes:');
            indexes.forEach(idx => {
                console.log(`   • ${idx.index_name}`);
                console.log(`     ${idx.index_definition}`);
            });
        }

    } catch (error) {
        console.log(`❌ Error getting details for table ${tableName}:`, error.message);
    }
}

async function getTableSamples() {
    try {
        console.log('\n📋 TABLE SAMPLES');
        console.log('=================');
        
        // Get a sample of data from each table
        const { data: tables, error } = await supabase
            .rpc('sql', {
                query: `
                    SELECT table_name
                    FROM information_schema.tables 
                    WHERE table_schema = 'public'
                    AND table_type = 'BASE TABLE'
                    ORDER BY table_name;
                `
            });

        if (error || !tables) {
            console.log('❌ Could not fetch table list for samples');
            return;
        }

        for (const table of tables) {
            try {
                const { data: sample, error: sampleError } = await supabase
                    .from(table.table_name)
                    .select('*')
                    .limit(3);

                console.log(`\n📊 Sample from ${table.table_name}:`);
                if (sampleError) {
                    console.log(`   ❌ Error: ${sampleError.message}`);
                } else if (!sample || sample.length === 0) {
                    console.log('   📭 No data');
                } else {
                    console.log(`   📋 ${sample.length} record(s):`);
                    sample.forEach((record, index) => {
                        console.log(`   ${index + 1}. ${JSON.stringify(record, null, 2).replace(/\n/g, '\n      ')}`);
                    });
                }
            } catch (err) {
                console.log(`   ❌ Error fetching sample: ${err.message}`);
            }
        }
    } catch (error) {
        console.log('❌ Error getting table samples:', error.message);
    }
}

// Main execution
async function main() {
    await getAllTables();
    
    console.log('\n' + '='.repeat(50));
    console.log('Do you want to see sample data from each table? (y/n)');
    
    // For automated execution, we'll show samples automatically
    console.log('Showing sample data...\n');
    await getTableSamples();
    
    console.log('\n✅ Database inspection complete!');
}

// Run the inspection
main().catch(console.error);
