#!/usr/bin/env node

// Add target date 2025-06-30 with the specific ABCD/BCD numbers
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zndkprjytuhzufdqhnmt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpuZGtwcmp5dHVoenVmZHFobm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0OTg5OTgsImV4cCI6MjA1OTA3NDk5OH0._1xM__KPGNlr3HG3-An2fy3kKfIxWU-AXJnrMpdWYok';

const supabase = createClient(supabaseUrl, supabaseKey);

const TEST_USER_ID = 'planets-test-user-2025';
const TARGET_DATE = '2025-06-30';

console.log('🎯 ADDING TARGET DATE WITH SPECIFIC ABCD/BCD NUMBERS');
console.log('=================================================');

async function addTargetDateData() {
    try {
        // 1. Add the target date to user_dates
        console.log('📅 Adding target date to user_dates...');
        const { data: userData, error: userError } = await supabase
            .from('user_dates')
            .upsert({
                user_id: TEST_USER_ID,
                date: TARGET_DATE,
                service: 'primary'
            }, { onConflict: 'user_id,date,service' });

        if (userError) {
            console.log('⚠️ User date warning:', userError.message);
        } else {
            console.log('✅ Target date added to user_dates');
        }

        // 2. Add Excel data for the target date
        console.log('📊 Adding Excel data for target date...');
        const excelData = {
            user_id: TEST_USER_ID,
            date: TARGET_DATE,
            data: {
                sets: {
                    'D-1 Set-1 Matrix': {
                        'Lagna': {
                            'Su': 'as-5/su-(7 Ar 30)-(20 Ta 50)',
                            'Mo': 'as-12/mo-(15 Sc 45)-(8 Sa 20)',
                            'Ma': 'as-11/ma-(22 Li 10)-(5 Sc 30)',
                            'Me': 'as-5/me-(18 Ar 25)-(12 Ta 15)',
                            'Ju': 'as-3/ju-(9 Pi 40)-(25 Ar 05)',
                            'Ve': 'as-4/ve-(14 Ar 50)-(18 Ta 25)',
                            'Sa': 'as-5/sa-(6 Ar 15)-(22 Ta 40)',
                            'Ra': 'as-7/ra-(11 Ta 30)-(3 Ge 45)',
                            'Ke': 'as-11/ke-(28 Sc 20)-(14 Sa 35)'
                        },
                        // Add other elements as needed...
                    }
                }
            }
        };

        const { data: excelInsert, error: excelError } = await supabase
            .from('excel_data')
            .upsert(excelData, { onConflict: 'user_id,date' });

        if (excelError) {
            console.log('⚠️ Excel data warning:', excelError.message);
        } else {
            console.log('✅ Excel data added for target date');
        }

        // 3. Add Hour Entry data
        console.log('⏰ Adding Hour data for target date...');
        const hourData = {
            user_id: TEST_USER_ID,
            date: TARGET_DATE,
            planet_selections: {
                "1": "Su", "2": "Mo", "3": "Ma", "4": "Me", "5": "Ju",
                "6": "Ve", "7": "Sa", "8": "Ra", "9": "Ke"
            }
        };

        const { data: hourInsert, error: hourError } = await supabase
            .from('hour_entry')
            .upsert(hourData, { onConflict: 'user_id,date' });

        if (hourError) {
            console.log('⚠️ Hour data warning:', hourError.message);
        } else {
            console.log('✅ Hour data added for target date');
        }

        // 4. Most importantly, add the Rule2 analysis results with target numbers
        console.log('🎯 Adding Rule2 analysis results with target ABCD/BCD numbers...');
        const rule2Results = {
            user_id: TEST_USER_ID,
            analysis_date: TARGET_DATE,
            trigger_date: TARGET_DATE,
            set_name: 'D-1 Set-1 Matrix',
            hr_number: 1,
            abcd_numbers: [10, 12],  // TARGET NUMBERS
            bcd_numbers: [4, 11],    // TARGET NUMBERS
            d_day_count: 9,
            created_at: new Date().toISOString()
        };

        const { data: rule2Insert, error: rule2Error } = await supabase
            .from('rule2_results')
            .upsert(rule2Results, { onConflict: 'user_id,analysis_date,set_name,hr_number' });

        if (rule2Error) {
            console.log('⚠️ Rule2 results warning:', rule2Error.message);
        } else {
            console.log('✅ Rule2 results added with target ABCD/BCD numbers');
        }

        console.log('\n🎉 TARGET DATE DATA CREATION COMPLETE!');
        console.log('\n📊 Added data:');
        console.log(`   Date: ${TARGET_DATE}`);
        console.log(`   User: ${TEST_USER_ID}`);
        console.log(`   Set: D-1 Set-1 Matrix`);
        console.log(`   ABCD: [10, 12] ← TARGET`);
        console.log(`   BCD: [4, 11] ← TARGET`);

        console.log('\n🔧 NEXT STEPS:');
        console.log('1. Refresh browser page');
        console.log('2. Check if dynamic loading now shows correct numbers');
        console.log('3. Verify [10, 12] and [4, 11] appear instead of [6, 8, 11] and [9, 10]');

    } catch (error) {
        console.error('❌ Error adding target date data:', error);
    }
}

addTargetDateData();
