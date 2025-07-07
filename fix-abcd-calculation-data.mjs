// Quick Fix: Generate Test Data for ABCD/BCD Calculation
// This script creates the missing Excel uploads and hour entries for ABCD date sequence

import { createClient } from '@supabase/supabase-js';

// Supabase connection
const supabaseUrl = 'https://ehxszmgzjqrjpkpwvwfe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoeHN6bWd6anFyanBrcHd2d2ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU2NDcyMjksImV4cCI6MjA1MTIyMzIyOX0.C6iOD7P3ALqgAIVHQO6mqkRG5DF2Q93Jl1zK__9hGl0';
const supabase = createClient(supabaseUrl, supabaseKey);

// ABCD Date sequence that the system expects
const ABCD_DATES = {
  A: '2025-06-26',  // A-day
  B: '2025-06-30',  // B-day  
  C: '2025-07-03',  // C-day
  D: '2025-07-07'   // D-day
};

const USER_ID = 'user-1'; // Default user ID

// Sample Excel data structure with topics
const createSampleExcelData = (dateType) => ({
  fileName: `sample-${dateType}-day-${ABCD_DATES[dateType]}.xlsx`,
  data: {
    sets: {
      'D-1 Set-1 Matrix': {
        'Lagna': {
          'Su': 'as-7/su-(12 Sc 50)-(20 Ta 50)',
          'Mo': 'as-11/mo-(16 Pi 30)-(24 Vi 30)', 
          'Ma': 'as-3/ma-(8 Cn 40)-(16 Cp 40)',
          'Me': 'as-12/me-(17 Ar 20)-(25 Li 20)',
          'Ju': 'as-8/ju-(13 Sg 10)-(21 Ge 10)',
          'Ve': 'as-2/ve-(7 Ge 25)-(15 Sg 25)',
          'Sa': 'as-5/sa-(10 Vi 15)-(18 Pi 15)',
          'Ra': 'as-10/ra-(15 Aq 45)-(23 Le 45)',
          'Ke': 'as-4/ke-(9 Le 35)-(17 Aq 35)'
        },
        'Moon': {
          'Su': 'mo-9/su-(14 Cp 25)-(22 Cn 25)',
          'Mo': 'mo-1/mo-(6 Ta 55)-(14 Sc 55)',
          'Ma': 'mo-6/ma-(11 Li 40)-(19 Ar 40)',
          'Me': 'mo-15/me-(20 Ge 30)-(28 Sg 30)',
          'Ju': 'mo-3/ju-(8 Le 20)-(16 Aq 20)',
          'Ve': 'mo-12/ve-(17 Sc 45)-(25 Ta 45)',
          'Sa': 'mo-8/sa-(13 Aq 35)-(21 Le 35)',
          'Ra': 'mo-14/ra-(19 Cn 15)-(27 Cp 15)',
          'Ke': 'mo-7/ke-(12 Cp 25)-(20 Cn 25)'
        },
        'Hora Lagna': {
          'Su': 'hl-4/su-(9 Vi 10)-(17 Pi 10)',
          'Mo': 'hl-13/mo-(18 Ge 40)-(26 Sg 40)',
          'Ma': 'hl-9/ma-(14 Sg 50)-(22 Ge 50)',
          'Me': 'hl-1/me-(6 Ar 30)-(14 Li 30)',
          'Ju': 'hl-11/ju-(16 Aq 20)-(24 Le 20)',
          'Ve': 'hl-6/ve-(11 Sc 15)-(19 Ta 15)',
          'Sa': 'hl-2/sa-(7 Ta 45)-(15 Sc 45)',
          'Ra': 'hl-8/ra-(13 Li 35)-(21 Ar 35)',
          'Ke': 'hl-10/ke-(15 Pi 25)-(23 Vi 25)'
        }
      },
      'D-1 Set-2 Matrix': {
        'Lagna': {
          'Su': 'as-15/su-(20 Ar 30)-(28 Li 30)',
          'Mo': 'as-6/mo-(11 Vi 45)-(19 Pi 45)', 
          'Ma': 'as-9/ma-(14 Aq 20)-(22 Le 20)',
          'Me': 'as-3/me-(8 Ge 55)-(16 Sg 55)',
          'Ju': 'as-12/ju-(17 Sc 40)-(25 Ta 40)',
          'Ve': 'as-7/ve-(12 Cp 25)-(20 Cn 25)',
          'Sa': 'as-1/sa-(6 Ta 10)-(14 Sc 10)',
          'Ra': 'as-11/ra-(16 Li 35)-(24 Ar 35)',
          'Ke': 'as-5/ke-(10 Le 50)-(18 Aq 50)'
        },
        'Moon': {
          'Su': 'mo-8/su-(13 Ge 15)-(21 Sg 15)',
          'Mo': 'mo-14/mo-(19 Pi 40)-(27 Vi 40)',
          'Ma': 'mo-2/ma-(7 Cn 30)-(15 Cp 30)',
          'Me': 'mo-10/me-(15 Sg 20)-(23 Ge 20)',
          'Ju': 'mo-5/ju-(10 Sc 45)-(18 Ta 45)',
          'Ve': 'mo-13/ve-(18 Ar 25)-(26 Li 25)',
          'Sa': 'mo-7/sa-(12 Vi 35)-(20 Pi 35)',
          'Ra': 'mo-4/ra-(9 Cp 10)-(17 Cn 10)',
          'Ke': 'mo-11/ke-(16 Aq 55)-(24 Le 55)'
        }
      },
      'D-3 Set-1 Matrix': {
        'Lagna': {
          'Su': 'as-6/su-(11 Li 20)-(19 Ar 20)',
          'Mo': 'as-14/mo-(19 Ta 35)-(27 Sc 35)', 
          'Ma': 'as-2/ma-(7 Aq 45)-(15 Le 45)',
          'Me': 'as-9/me-(14 Cn 15)-(22 Cp 15)',
          'Ju': 'as-5/ju-(10 Pi 50)-(18 Vi 50)',
          'Ve': 'as-11/ve-(16 Sg 30)-(24 Ge 30)',
          'Sa': 'as-8/sa-(13 Sc 40)-(21 Ta 40)',
          'Ra': 'as-3/ra-(8 Ar 25)-(16 Li 25)',
          'Ke': 'as-12/ke-(17 Vi 10)-(25 Pi 10)'
        }
      }
    }
  }
});

// Sample hour entry data with planet selections for HR 1-6
const createSampleHourEntry = (dateType) => ({
  planet_selections: {
    '1': 'Su',  // HR 1 = Sun
    '2': 'Mo',  // HR 2 = Moon
    '3': 'Ma',  // HR 3 = Mars
    '4': 'Me',  // HR 4 = Mercury
    '5': 'Ju',  // HR 5 = Jupiter
    '6': 'Ve'   // HR 6 = Venus
  }
});

async function generateTestData() {
  console.log('🔧 GENERATING TEST DATA FOR ABCD/BCD CALCULATION');
  console.log('================================================');
  
  try {
    // 1. Check if data already exists
    console.log('\n🔍 Checking existing data...');
    for (const [letter, date] of Object.entries(ABCD_DATES)) {
      const { data: excelData } = await supabase
        .from('excel_uploads')
        .select('id')
        .eq('user_id', USER_ID)
        .eq('date', date)
        .single();
      
      const { data: hourData } = await supabase
        .from('hour_entries')
        .select('id')
        .eq('user_id', USER_ID)
        .eq('date', date)
        .single();
      
      console.log(`   ${letter}-day (${date}): Excel=${excelData ? '✅' : '❌'}, Hour=${hourData ? '✅' : '❌'}`);
    }

    // 2. Generate missing Excel uploads
    console.log('\n📊 Creating Excel uploads...');
    for (const [letter, date] of Object.entries(ABCD_DATES)) {
      const excelData = createSampleExcelData(letter);
      
      const { error } = await supabase
        .from('excel_uploads')
        .upsert({
          user_id: USER_ID,
          date: date,
          file_name: excelData.fileName,
          data: excelData.data,
          uploaded_at: new Date().toISOString()
        });
      
      if (error) {
        console.log(`   ❌ ${letter}-day (${date}): ${error.message}`);
      } else {
        console.log(`   ✅ ${letter}-day (${date}): Excel data created`);
      }
    }

    // 3. Generate missing hour entries
    console.log('\n⏰ Creating hour entries...');
    for (const [letter, date] of Object.entries(ABCD_DATES)) {
      const hourEntry = createSampleHourEntry(letter);
      
      const { error } = await supabase
        .from('hour_entries')
        .upsert({
          user_id: USER_ID,
          date: date,
          planet_selections: hourEntry.planet_selections,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.log(`   ❌ ${letter}-day (${date}): ${error.message}`);
      } else {
        console.log(`   ✅ ${letter}-day (${date}): Hour entry created`);
      }
    }

    // 4. Create database table if it doesn't exist
    console.log('\n🗄️ Checking database table...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('topic_abcd_bcd_numbers')
      .select('count(*)', { count: 'exact' })
      .limit(1);

    if (tableError) {
      console.log('   ❌ topic_abcd_bcd_numbers table does not exist');
      console.log('   🔧 Please run the SQL script from setup-abcd-database.html');
    } else {
      console.log('   ✅ Database table exists');
    }

    console.log('\n🎉 TEST DATA GENERATION COMPLETE!');
    console.log('==================================');
    console.log('Next steps:');
    console.log('1. Go to http://localhost:5174 (Planets Analysis)');
    console.log('2. Upload any Excel file to trigger the analysis');
    console.log('3. Select HR 1 and watch the dynamic calculation');
    console.log('4. Check browser console for success messages');
    
    if (tableError) {
      console.log('\n⚠️  IMPORTANT: You still need to create the database table!');
      console.log('   Open: http://localhost:5174/setup-abcd-database.html');
    }

  } catch (error) {
    console.error('💥 Error generating test data:', error);
    
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.log('\n🔧 MISSING DATABASE TABLES:');
      console.log('Please run these commands in Supabase SQL Editor:');
      console.log('');
      console.log('-- Excel uploads table');
      console.log(`CREATE TABLE IF NOT EXISTS excel_uploads (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        file_name VARCHAR(255),
        data JSONB,
        uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, date)
      );`);
      console.log('');
      console.log('-- Hour entries table');
      console.log(`CREATE TABLE IF NOT EXISTS hour_entries (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        planet_selections JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, date)
      );`);
    }
  }
}

// Run the test data generation
generateTestData().then(() => {
  console.log('✅ Script completed');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
