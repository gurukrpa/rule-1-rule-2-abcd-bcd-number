// Find dates that have both Excel and Hour data
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function findCompleteDataDates() {
  console.log('🔍 FINDING DATES WITH COMPLETE DATA');
  console.log('====================================\n');

  // Get all Excel data
  const { data: excelEntries } = await supabase
    .from('excel_data')
    .select('user_id, date, file_name');

  console.log('📊 Excel Data Entries:');
  excelEntries.forEach(entry => {
    console.log(`   - User ${entry.user_id}: ${entry.file_name} on ${entry.date}`);
  });

  // Get all Hour entries
  const { data: hourEntries } = await supabase
    .from('hour_entries')
    .select('user_id, date_key, hour_data');

  console.log('\n⏰ Hour Entry Data:');
  hourEntries.forEach(entry => {
    const planetCount = Object.keys(entry.hour_data?.planetSelections || {}).length;
    console.log(`   - User ${entry.user_id}: ${planetCount} HR selections on ${entry.date_key}`);
  });

  // Find matches
  console.log('\n🔍 Finding Complete Data Sets (Excel + Hour):');
  let foundMatch = false;

  for (const excelEntry of excelEntries) {
    const matchingHour = hourEntries.find(
      hour => hour.user_id === excelEntry.user_id && hour.date_key === excelEntry.date
    );

    if (matchingHour) {
      foundMatch = true;
      const planetCount = Object.keys(matchingHour.hour_data?.planetSelections || {}).length;
      console.log(`   ✅ COMPLETE: User ${excelEntry.user_id} on ${excelEntry.date}`);
      console.log(`      - Excel: ${excelEntry.file_name}`);
      console.log(`      - Hour: ${planetCount} HR selections`);
    }
  }

  if (!foundMatch) {
    console.log('   ❌ No complete data sets found (no matching Excel + Hour entries)');
    console.log('\n💡 This explains why IndexPage shows "missing or add 4 days"!');
    console.log('   IndexPage needs BOTH Excel and Hour data for the same user/date.');
  }
}

findCompleteDataDates().then(() => {
  console.log('\n✅ Analysis complete!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Analysis failed:', err);
  process.exit(1);
});
