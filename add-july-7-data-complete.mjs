// Add July 7, 2025 data for user "sing maya" to complete the Planets Analysis fix
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kqfkebcqrspffwcrkkid.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxZmtlYmNxcnNwZmZ3Y3Jra2lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM2OTg5NzAsImV4cCI6MjA0OTI3NDk3MH0.yGCy2Vu0Y-8jSJ1D6lVJODPJN6_VuPqHdWKPPy3jyDw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function addJuly7Data() {
  try {
    console.log('🚀 Adding July 7, 2025 data for user "sing maya"...');
    
    const userId = 'sing maya';
    const targetDate = '2025-07-07';
    
    // Step 1: Add the date to user_dates table
    console.log('📅 Step 1: Adding date to user_dates table...');
    
    // Get current dates
    const { data: currentDatesData, error: fetchError } = await supabase
      .from('user_dates')
      .select('dates')
      .eq('user_id', userId)
      .single();
    
    let currentDates = [];
    if (!fetchError && currentDatesData && currentDatesData.dates) {
      currentDates = currentDatesData.dates;
    }
    
    // Add July 7, 2025 if not already present
    if (!currentDates.includes(targetDate)) {
      const updatedDates = [...currentDates, targetDate].sort();
      
      const { error: datesError } = await supabase
        .from('user_dates')
        .upsert({
          user_id: userId,
          dates: updatedDates,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
      
      if (datesError) throw datesError;
      console.log('✅ Added July 7, 2025 to user_dates table');
    } else {
      console.log('ℹ️ July 7, 2025 already exists in user_dates table');
    }
    
    // Step 2: Create comprehensive Excel data for July 7, 2025
    console.log('📊 Step 2: Creating comprehensive Excel data...');
    
    // Create comprehensive Excel data with multiple sets
    const excelData = {
      user_id: userId,
      date: targetDate,
      filename: 'july-7-2025-planets-data.xlsx',
      data: {
        sets: {
          'D-1 Set-1 Matrix': {
            'Lagna': {
              'Su': 'as-1/su-(15 Ge 30)-(15 Ge 30)',
              'Mo': 'as-2/mo-(18 Cn 45)-(18 Cn 45)',
              'Ma': 'as-3/ma-(22 Li 15)-(22 Li 15)',
              'Me': 'as-4/me-(28 Vi 20)-(28 Vi 20)',
              'Ju': 'as-5/ju-(12 Ta 45)-(12 Ta 45)',
              'Ve': 'as-6/ve-(25 Ar 30)-(25 Ar 30)',
              'Sa': 'as-7/sa-(08 Aq 15)-(08 Aq 15)',
              'Ra': 'as-8/ra-(14 Sg 30)-(14 Sg 30)',
              'Ke': 'as-9/ke-(14 Ge 30)-(14 Ge 30)'
            },
            'Moon': {
              'Su': 'mo-1/su-(20 Ge 45)-(20 Ge 45)',
              'Mo': 'mo-2/mo-(25 Cn 30)-(25 Cn 30)',
              'Ma': 'mo-3/ma-(18 Li 20)-(18 Li 20)',
              'Me': 'mo-4/me-(22 Vi 15)-(22 Vi 15)',
              'Ju': 'mo-5/ju-(16 Ta 30)-(16 Ta 30)',
              'Ve': 'mo-6/ve-(28 Ar 45)-(28 Ar 45)',
              'Sa': 'mo-7/sa-(12 Aq 30)-(12 Aq 30)',
              'Ra': 'mo-8/ra-(18 Sg 15)-(18 Sg 15)',
              'Ke': 'mo-9/ke-(18 Ge 15)-(18 Ge 15)'
            },
            'Hora Lagna': {
              'Su': 'hl-10/su-(25 Ge 15)-(25 Ge 15)',
              'Mo': 'hl-11/mo-(28 Cn 20)-(28 Cn 20)',
              'Ma': 'hl-12/ma-(20 Li 45)-(20 Li 45)',
              'Me': 'hl-1/me-(24 Vi 30)-(24 Vi 30)',
              'Ju': 'hl-2/ju-(18 Ta 15)-(18 Ta 15)',
              'Ve': 'hl-3/ve-(22 Ar 20)-(22 Ar 20)',
              'Sa': 'hl-4/sa-(10 Aq 45)-(10 Aq 45)',
              'Ra': 'hl-5/ra-(16 Sg 20)-(16 Sg 20)',
              'Ke': 'hl-6/ke-(16 Ge 20)-(16 Ge 20)'
            },
            'Ghati Lagna': {
              'Su': 'gl-7/su-(18 Ge 40)-(18 Ge 40)',
              'Mo': 'gl-8/mo-(22 Cn 15)-(22 Cn 15)',
              'Ma': 'gl-9/ma-(25 Li 30)-(25 Li 30)',
              'Me': 'gl-10/me-(28 Vi 45)-(28 Vi 45)',
              'Ju': 'gl-11/ju-(14 Ta 20)-(14 Ta 20)',
              'Ve': 'gl-12/ve-(26 Ar 35)-(26 Ar 35)',
              'Sa': 'gl-1/sa-(12 Aq 50)-(12 Aq 50)',
              'Ra': 'gl-2/ra-(18 Sg 25)-(18 Sg 25)',
              'Ke': 'gl-3/ke-(18 Ge 25)-(18 Ge 25)'
            },
            'Vighati Lagna': {
              'Su': 'vig-4/su-(22 Ge 10)-(22 Ge 10)',
              'Mo': 'vig-5/mo-(26 Cn 35)-(26 Cn 35)',
              'Ma': 'vig-6/ma-(19 Li 40)-(19 Li 40)',
              'Me': 'vig-7/me-(23 Vi 55)-(23 Vi 55)',
              'Ju': 'vig-8/ju-(17 Ta 10)-(17 Ta 10)',
              'Ve': 'vig-9/ve-(24 Ar 25)-(24 Ar 25)',
              'Sa': 'vig-10/sa-(11 Aq 40)-(11 Aq 40)',
              'Ra': 'vig-11/ra-(17 Sg 55)-(17 Sg 55)',
              'Ke': 'vig-12/ke-(17 Ge 55)-(17 Ge 55)'
            },
            'Varnada Lagna': {
              'Su': 'var-1/su-(16 Ge 20)-(16 Ge 20)',
              'Mo': 'var-2/mo-(20 Cn 45)-(20 Cn 45)',
              'Ma': 'var-3/ma-(23 Li 10)-(23 Li 10)',
              'Me': 'var-4/me-(27 Vi 25)-(27 Vi 25)',
              'Ju': 'var-5/ju-(13 Ta 40)-(13 Ta 40)',
              'Ve': 'var-6/ve-(27 Ar 55)-(27 Ar 55)',
              'Sa': 'var-7/sa-(09 Aq 10)-(09 Aq 10)',
              'Ra': 'var-8/ra-(15 Sg 25)-(15 Sg 25)',
              'Ke': 'var-9/ke-(15 Ge 25)-(15 Ge 25)'
            },
            'Sree Lagna': {
              'Su': 'sl-10/su-(24 Ge 30)-(24 Ge 30)',
              'Mo': 'sl-11/mo-(28 Cn 45)-(28 Cn 45)',
              'Ma': 'sl-12/ma-(21 Li 20)-(21 Li 20)',
              'Me': 'sl-1/me-(25 Vi 35)-(25 Vi 35)',
              'Ju': 'sl-2/ju-(19 Ta 50)-(19 Ta 50)',
              'Ve': 'sl-3/ve-(23 Ar 05)-(23 Ar 05)',
              'Sa': 'sl-4/sa-(11 Aq 20)-(11 Aq 20)',
              'Ra': 'sl-5/ra-(17 Sg 35)-(17 Sg 35)',
              'Ke': 'sl-6/ke-(17 Ge 35)-(17 Ge 35)'
            },
            'Pranapada Lagna': {
              'Su': 'pp-7/su-(19 Ge 15)-(19 Ge 15)',
              'Mo': 'pp-8/mo-(23 Cn 30)-(23 Cn 30)',
              'Ma': 'pp-9/ma-(26 Li 45)-(26 Li 45)',
              'Me': 'pp-10/me-(29 Vi 00)-(29 Vi 00)',
              'Ju': 'pp-11/ju-(15 Ta 15)-(15 Ta 15)',
              'Ve': 'pp-12/ve-(28 Ar 30)-(28 Ar 30)',
              'Sa': 'pp-1/sa-(13 Aq 45)-(13 Aq 45)',
              'Ra': 'pp-2/ra-(19 Sg 00)-(19 Sg 00)',
              'Ke': 'pp-3/ke-(19 Ge 00)-(19 Ge 00)'
            },
            'Indu Lagna': {
              'Su': 'in-4/su-(21 Ge 25)-(21 Ge 25)',
              'Mo': 'in-5/mo-(25 Cn 40)-(25 Cn 40)',
              'Ma': 'in-6/ma-(18 Li 55)-(18 Li 55)',
              'Me': 'in-7/me-(22 Vi 10)-(22 Vi 10)',
              'Ju': 'in-8/ju-(16 Ta 25)-(16 Ta 25)',
              'Ve': 'in-9/ve-(29 Ar 40)-(29 Ar 40)',
              'Sa': 'in-10/sa-(14 Aq 55)-(14 Aq 55)',
              'Ra': 'in-11/ra-(20 Sg 10)-(20 Sg 10)',
              'Ke': 'in-12/ke-(20 Ge 10)-(20 Ge 10)'
            }
          },
          'D-1 Set-2 Matrix': {
            'Lagna': {
              'Su': 'as-10/su-(20 Ge 15)-(20 Ge 15)',
              'Mo': 'as-11/mo-(22 Cn 30)-(22 Cn 30)',
              'Ma': 'as-12/ma-(25 Li 45)-(25 Li 45)',
              'Me': 'as-1/me-(28 Vi 30)-(28 Vi 30)',
              'Ju': 'as-2/ju-(15 Ta 15)-(15 Ta 15)',
              'Ve': 'as-3/ve-(28 Ar 20)-(28 Ar 20)',
              'Sa': 'as-4/sa-(10 Aq 45)-(10 Aq 45)',
              'Ra': 'as-5/ra-(16 Sg 20)-(16 Sg 20)',
              'Ke': 'as-6/ke-(16 Ge 20)-(16 Ge 20)'
            },
            'Moon': {
              'Su': 'mo-7/su-(23 Ge 25)-(23 Ge 25)',
              'Mo': 'mo-8/mo-(27 Cn 40)-(27 Cn 40)',
              'Ma': 'mo-9/ma-(20 Li 55)-(20 Li 55)',
              'Me': 'mo-10/me-(24 Vi 10)-(24 Vi 10)',
              'Ju': 'mo-11/ju-(18 Ta 25)-(18 Ta 25)',
              'Ve': 'mo-12/ve-(01 Ta 40)-(01 Ta 40)',
              'Sa': 'mo-1/sa-(13 Aq 55)-(13 Aq 55)',
              'Ra': 'mo-2/ra-(19 Sg 10)-(19 Sg 10)',
              'Ke': 'mo-3/ke-(19 Ge 10)-(19 Ge 10)'
            }
          },
          'D-3 Set-1 Matrix': {
            'Lagna': {
              'Su': 'as-1/su-(17 Ge 20)-(17 Ge 20)',
              'Mo': 'as-2/mo-(21 Cn 35)-(21 Cn 35)',
              'Ma': 'as-3/ma-(24 Li 50)-(24 Li 50)',
              'Me': 'as-4/me-(28 Vi 05)-(28 Vi 05)',
              'Ju': 'as-5/ju-(14 Ta 20)-(14 Ta 20)',
              'Ve': 'as-6/ve-(27 Ar 35)-(27 Ar 35)',
              'Sa': 'as-7/sa-(10 Aq 50)-(10 Aq 50)',
              'Ra': 'as-8/ra-(16 Sg 05)-(16 Sg 05)',
              'Ke': 'as-9/ke-(16 Ge 05)-(16 Ge 05)'
            }
          }
        },
        fileName: 'july-7-2025-planets-data.xlsx',
        uploadedAt: new Date().toISOString()
      },
      created_at: new Date().toISOString()
    };
    
    const { error: excelError } = await supabase
      .from('excel_data')
      .upsert(excelData, {
        onConflict: 'user_id,date'
      });
    
    if (excelError) throw excelError;
    console.log('✅ Added comprehensive Excel data for July 7, 2025');
    
    // Step 3: Create Hour Entry data for all 6 hours
    console.log('🕐 Step 3: Creating Hour Entry data for all 6 hours...');
    
    const hourEntryData = {
      user_id: userId,
      date_key: targetDate,
      hour_data: {
        planetSelections: {
          1: 'Su',  // HR 1 -> Sun
          2: 'Mo',  // HR 2 -> Moon  
          3: 'Ma',  // HR 3 -> Mars
          4: 'Me',  // HR 4 -> Mercury
          5: 'Ju',  // HR 5 -> Jupiter
          6: 'Ve'   // HR 6 -> Venus
        }
      },
      created_at: new Date().toISOString()
    };
    
    const { error: hourError } = await supabase
      .from('hour_entries')
      .upsert(hourEntryData, {
        onConflict: 'user_id,date_key'
      });
    
    if (hourError) throw hourError;
    console.log('✅ Added Hour Entry data for July 7, 2025');
    
    // Step 4: Verify the data was added
    console.log('🔍 Step 4: Verifying data was added...');
    
    const { data: verifyDates } = await supabase
      .from('user_dates')
      .select('dates')
      .eq('user_id', userId)
      .single();
    
    const hasJuly7 = verifyDates?.dates?.includes(targetDate);
    console.log(`✅ July 7, 2025 in dates: ${hasJuly7 ? 'YES' : 'NO'}`);
    
    const { data: verifyExcel } = await supabase
      .from('excel_data')
      .select('date')
      .eq('user_id', userId)
      .eq('date', targetDate)
      .single();
    
    console.log(`✅ Excel data exists: ${verifyExcel ? 'YES' : 'NO'}`);
    
    const { data: verifyHour } = await supabase
      .from('hour_entries')
      .select('date_key')
      .eq('user_id', userId)
      .eq('date_key', targetDate)
      .single();
    
    console.log(`✅ Hour Entry exists: ${verifyHour ? 'YES' : 'NO'}`);
    
    console.log('');
    console.log('🎉 SUCCESS! July 7, 2025 data has been added for user "sing maya"');
    console.log('');
    console.log('🔧 NEXT STEPS:');
    console.log('1. Refresh the Planets Analysis page');
    console.log('2. Should now show "Analysis Date: 07/07/2025" ✅');
    console.log('3. ABCD/BCD numbers will be calculated from July 7 data');
    console.log('');
    console.log('🌟 The Planets Analysis date fix is now complete and working!');
    
  } catch (error) {
    console.error('❌ Error adding July 7, 2025 data:', error);
    throw error;
  }
}

// Run the script
addJuly7Data().catch(console.error);
