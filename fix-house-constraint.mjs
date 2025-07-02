#!/usr/bin/env node

/**
 * Fix house table constraint issue
 * This script diagnoses and fixes the "no unique constraint matching ON CONFLICT" error
 */

import { createClient } from '@supabase/supabase-js';

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = 'https://wmfbknptxtowgwqzpfto.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZmJrbnB0eHRvd2d3cXpwZnRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMTgzNjA1MywiZXhwIjoyMDM3NDEyMDUzfQ.9YOKn45HQfCQHe9UlFOWY1jDlRYFd-FLw5FH6Q7T4g4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseDatabaseConstraints() {
  console.log('🔍 Diagnosing house table constraints...\n');

  try {
    // Check current constraints on house table
    const { data: constraints, error: constraintError } = await supabase.rpc('sql', {
      query: `
        SELECT conname as constraint_name, 
               contype as constraint_type,
               pg_get_constraintdef(oid) as constraint_definition
        FROM pg_constraint 
        WHERE conrelid = 'house'::regclass;
      `
    });

    if (constraintError) {
      console.error('❌ Error checking constraints:', constraintError);
      return false;
    }

    console.log('📋 Current constraints on house table:');
    if (constraints && constraints.length > 0) {
      constraints.forEach(constraint => {
        console.log(`  - ${constraint.constraint_name} (${constraint.constraint_type}): ${constraint.constraint_definition}`);
      });
    } else {
      console.log('  - No constraints found');
    }

    // Check table structure
    const { data: tableInfo, error: tableError } = await supabase.rpc('sql', {
      query: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'house' 
        ORDER BY ordinal_position;
      `
    });

    if (!tableError && tableInfo) {
      console.log('\n📊 House table structure:');
      tableInfo.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(nullable)'}`);
      });
    }

    return true;
  } catch (error) {
    console.error('❌ Error in diagnosis:', error);
    return false;
  }
}

async function createMissingConstraint() {
  console.log('\n🔧 Creating missing unique constraint...');

  try {
    const { error } = await supabase.rpc('sql', {
      query: `
        ALTER TABLE house 
        ADD CONSTRAINT house_unique_key 
        UNIQUE (user_id, hr_number, day_number, date, topic);
      `
    });

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️ Constraint already exists');
        return true;
      } else {
        console.error('❌ Error creating constraint:', error);
        return false;
      }
    }

    console.log('✅ Successfully created unique constraint');
    return true;
  } catch (error) {
    console.error('❌ Error creating constraint:', error);
    return false;
  }
}

async function fixUserDataConstraintIssue() {
  console.log('🛠️ Fixing UserData house table constraint issue\n');

  // Step 1: Diagnose current state
  const diagnosisSuccess = await diagnoseDatabaseConstraints();
  if (!diagnosisSuccess) {
    console.log('❌ Could not complete diagnosis');
    return;
  }

  // Step 2: Create missing constraint
  const constraintSuccess = await createMissingConstraint();
  if (!constraintSuccess) {
    console.log('❌ Could not create constraint');
    return;
  }

  // Step 3: Verify fix
  console.log('\n✅ Verification:');
  await diagnoseDatabaseConstraints();

  console.log('\n🎉 Constraint issue should now be fixed!');
  console.log('\n💡 Alternative solutions if this doesn\'t work:');
  console.log('   1. Use INSERT with ON DUPLICATE KEY UPDATE (MySQL style)');
  console.log('   2. Use separate INSERT/UPDATE logic');
  console.log('   3. Remove duplicates before upsert');
}

// Run the fix
fixUserDataConstraintIssue().catch(console.error);
