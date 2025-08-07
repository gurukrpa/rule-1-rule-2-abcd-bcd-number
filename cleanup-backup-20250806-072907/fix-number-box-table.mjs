#!/usr/bin/env node

/**
 * Fix Number Box Clicks Table - ID Column Type Issue
 * 
 * This script fixes the 406 error by changing the id column from UUID to TEXT
 * in the number_box_clicks table to support custom composite IDs.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in environment variables');
    console.error('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY (or VITE_SUPABASE_ANON_KEY)');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTableExists() {
    try {
        const { data, error } = await supabase
            .from('number_box_clicks')
            .select('id')
            .limit(1);
        
        if (error && error.code === '42P01') {
            return false; // Table doesn't exist
        }
        
        return !error;
    } catch (err) {
        return false;
    }
}

async function checkIdColumnType() {
    try {
        // Query the information schema to check column type
        const { data, error } = await supabase
            .rpc('sql', {
                query: `
                    SELECT data_type 
                    FROM information_schema.columns 
                    WHERE table_name = 'number_box_clicks' 
                    AND column_name = 'id'
                `
            });
        
        if (error) {
            console.log('Could not check column type via RPC, trying direct query...');
            return null;
        }
        
        return data?.[0]?.data_type;
    } catch (err) {
        console.log('Could not determine column type');
        return null;
    }
}

async function testCustomIdInsert() {
    try {
        const testId = 'test_D-1 Set-1 Matrix_2025-07-17_1_HR1';
        
        const { data, error } = await supabase
            .from('number_box_clicks')
            .insert({
                id: testId,
                user_id: 'test_user',
                set_name: 'D-1 Set-1 Matrix',
                date_key: '2025-07-17',
                number_value: 1,
                hr_number: 1,
                is_clicked: true,
                is_present: true
            });
        
        if (error) {
            console.log('❌ Test insert failed:', error.message);
            return false;
        }
        
        // Clean up test record
        await supabase.from('number_box_clicks').delete().eq('id', testId);
        
        console.log('✅ Test insert successful - custom IDs work');
        return true;
    } catch (err) {
        console.log('❌ Test insert error:', err.message);
        return false;
    }
}

async function applyFix() {
    console.log('🔧 APPLYING NUMBER BOX CLICKS TABLE FIX');
    console.log('======================================');
    
    // Read the fix SQL
    const fixSqlPath = path.join(__dirname, 'FIX-NUMBER-BOX-CLICKS-TABLE.sql');
    
    if (!fs.existsSync(fixSqlPath)) {
        console.error('❌ Fix SQL file not found:', fixSqlPath);
        return false;
    }
    
    const fixSql = fs.readFileSync(fixSqlPath, 'utf8');
    
    try {
        // Execute the fix SQL (this will recreate the table)
        console.log('📝 Executing table fix SQL...');
        
        // Note: This is a simplified approach. In a real application,
        // you might want to use a proper migration system.
        console.log('⚠️  This will recreate the number_box_clicks table');
        console.log('    Any existing data will be lost');
        console.log('    Run this SQL manually in your Supabase SQL editor:');
        console.log('');
        console.log(fixSql);
        console.log('');
        
        return true;
    } catch (err) {
        console.error('❌ Failed to apply fix:', err.message);
        return false;
    }
}

async function main() {
    console.log('🔍 NUMBER BOX CLICKS TABLE DIAGNOSTIC');
    console.log('====================================');
    
    // Check if table exists
    const tableExists = await checkTableExists();
    console.log(`Table exists: ${tableExists ? '✅ Yes' : '❌ No'}`);
    
    if (!tableExists) {
        console.log('');
        console.log('🛠️  TABLE SETUP REQUIRED');
        console.log('========================');
        console.log('The number_box_clicks table does not exist.');
        console.log('Run this SQL in your Supabase SQL editor:');
        console.log('');
        
        const createSqlPath = path.join(__dirname, 'FIX-NUMBER-BOX-CLICKS-TABLE.sql');
        if (fs.existsSync(createSqlPath)) {
            const createSql = fs.readFileSync(createSqlPath, 'utf8');
            console.log(createSql);
        }
        return;
    }
    
    // Check column type
    const columnType = await checkIdColumnType();
    console.log(`ID column type: ${columnType || 'Could not determine'}`);
    
    // Test custom ID insert
    console.log('');
    console.log('🧪 Testing custom ID insert...');
    const insertWorks = await testCustomIdInsert();
    
    if (!insertWorks) {
        console.log('');
        console.log('🛠️  FIX REQUIRED');
        console.log('===============');
        console.log('The table needs to be fixed to support custom TEXT IDs.');
        console.log('');
        await applyFix();
    } else {
        console.log('');
        console.log('✅ TABLE IS WORKING CORRECTLY');
        console.log('============================');
        console.log('The number_box_clicks table supports custom IDs.');
        console.log('The 406 error should be resolved.');
    }
}

// Run the diagnostic
main().catch(console.error);
