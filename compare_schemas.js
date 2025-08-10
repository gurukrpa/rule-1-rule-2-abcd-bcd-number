// 🔍 Compare Database Schemas - Node.js Version
// This script compares table structures between production and automation

import { createClient } from '@supabase/supabase-js';

// Production Database
const prodClient = createClient(
    'https://zndkprjytuhzufdqhnmt.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuZGtwcmp5dHVoenVmZHFobm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkxNzY0NzYsImV4cCI6MjA0NDc1MjQ3Nn0.YgKPdqNV0HCaTaAGI4K5fFi9I5q-KpI4HQJfNQXYT2Q'
);

// Automation Database
const autoClient = createClient(
    'https://oqbusqbsmvwkwhggzvhl.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xYnVzcWJzbXZ3a3doZ2d6dmhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3MjMxMjYsImV4cCI6MjA3MDI5OTEyNn0.kXRSa-AdjuSIzOonl98OQi6H2eTjZ4WjQ_5l_m1eVq4'
);

async function getTableSchema(client, tableName, envName) {
    try {
        const { data, error } = await client.from(tableName).select('*').limit(1);
        
        if (error) {
            return { [tableName]: `❌ Error: ${error.message}` };
        }
        
        if (data && data.length > 0) {
            const columns = Object.keys(data[0]);
            return { [tableName]: columns };
        } else {
            return { [tableName]: `⚠️ Table exists but empty` };
        }
    } catch (err) {
        return { [tableName]: `💥 Exception: ${err.message}` };
    }
}

async function compareSchemas() {
    console.log('🎯 Comparing Database Schemas...');
    console.log('📅', new Date().toLocaleString());
    console.log('');

    const tables = ['users', 'user_dates', 'excel_data', 'hour_entries', 'house', 'hr_data'];
    
    const prodSchema = {};
    const autoSchema = {};

    console.log('📊 Analyzing Production Database...');
    for (const table of tables) {
        const result = await getTableSchema(prodClient, table, 'production');
        Object.assign(prodSchema, result);
    }

    console.log('📊 Analyzing Automation Database...');
    for (const table of tables) {
        const result = await getTableSchema(autoClient, table, 'automation');
        Object.assign(autoSchema, result);
    }

    console.log('');
    console.log('🔍 COMPARISON RESULTS:');
    console.log('=' .repeat(50));

    for (const table of tables) {
        console.log(`\n📋 Table: ${table.toUpperCase()}`);
        console.log('-'.repeat(30));
        
        const prodCols = prodSchema[table];
        const autoCols = autoSchema[table];
        
        console.log('🗄️  Production:', Array.isArray(prodCols) ? prodCols.join(', ') : prodCols);
        console.log('🧪 Automation:', Array.isArray(autoCols) ? autoCols.join(', ') : autoCols);
        
        if (Array.isArray(prodCols) && Array.isArray(autoCols)) {
            const prodSet = new Set(prodCols);
            const autoSet = new Set(autoCols);
            
            const missingInAuto = [...prodSet].filter(col => !autoSet.has(col));
            const extraInAuto = [...autoSet].filter(col => !prodSet.has(col));
            
            if (missingInAuto.length > 0) {
                console.log('❌ Missing in automation:', missingInAuto.join(', '));
            }
            if (extraInAuto.length > 0) {
                console.log('➕ Extra in automation:', extraInAuto.join(', '));
            }
            if (missingInAuto.length === 0 && extraInAuto.length === 0) {
                console.log('✅ Schemas match!');
            }
        }
    }

    console.log('');
    console.log('🎉 Schema comparison complete!');
}

compareSchemas().catch(console.error);
