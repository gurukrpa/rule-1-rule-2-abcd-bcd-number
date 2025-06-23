import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://azkqdfrsyzcjmvuqgzwt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6a3FkZnJzeXpjam12dXFnend0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUyMTEzNjEsImV4cCI6MjA1MDc4NzM2MX0.dRKQDRwJLwTrYB2ZhILiV4E6RVZ6L0Rj6C6SdDEOu2M';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 CREATING TEST DATA FOR ABCD APPLICATION');

const TEST_USER_ID = 'testuser123';
const TEST_DATES = ['2025-01-10', '2025-01-11', '2025-01-12', '2025-01-13', '2025-01-14'];

// Create user
console.log('👤 Creating test user...');
const userResult = await supabase
  .from('users')
  .upsert({
    id: TEST_USER_ID,
    username: 'TestUser',
    hr: 24,
    name: 'Test User for ABCD',
    dates: TEST_DATES
  }, { onConflict: 'id' });

if (userResult.error) {
  console.log('❌ Error creating user:', userResult.error.message);
} else {
  console.log('✅ Created test user');
}

// Create Excel and Hour data
for (let i = 0; i < TEST_DATES.length; i++) {
  const date = TEST_DATES[i];
  console.log(`📊 Creating data for ${date}...`);
  
  // Create 30 topic sets
  const sets = {};
  const topicNames = [
    'D-1 Set-1 Matrix', 'D-1 Set-2 Matrix', 'D-2 Set-1 Matrix', 'D-2 Set-2 Matrix',
    'D-3 Set-1 Matrix', 'D-3 Set-2 Matrix', 'D-4 Set-1 Matrix', 'D-4 Set-2 Matrix',
    'D-5 Set-1 Matrix', 'D-5 Set-2 Matrix', 'D-7 Set-1 Matrix', 'D-7 Set-2 Matrix',
    'D-9 Set-1 Matrix', 'D-9 Set-2 Matrix', 'D-10 Set-1 Matrix', 'D-10 Set-2 Matrix',
    'D-11 Set-1 Matrix', 'D-11 Set-2 Matrix', 'D-12 Set-1 Matrix', 'D-12 Set-2 Matrix',
    'D-27 Set-1 Matrix', 'D-27 Set-2 Matrix', 'D-30 Set-1 Matrix', 'D-30 Set-2 Matrix',
    'D-60 Set-1 Matrix', 'D-60 Set-2 Matrix', 'D-81 Set-1 Matrix', 'D-81 Set-2 Matrix',
    'D-108 Set-1 Matrix', 'D-108 Set-2 Matrix', 'D-144 Set-1 Matrix', 'D-144 Set-2 Matrix'
  ];

  topicNames.forEach((topicName, topicIndex) => {
    const elementBlock = {};
    const elements = ['as', 'mo', 'hl', 'gl', 'vig', 'var', 'sl', 'pp', 'in'];
    const planets = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'];

    elements.forEach((element, elemIndex) => {
      const planetMap = {};
      planets.forEach((planet, planetIndex) => {
        const baseNumber = 10 + i + topicIndex + elemIndex + planetIndex;
        const number = (baseNumber % 50) + 1;
        planetMap[planet] = `${element}-${number}`;
      });
      elementBlock[element] = planetMap;
    });
    
    sets[topicName] = elementBlock;
  });

  // Insert Excel data
  const excelResult = await supabase
    .from('excel_data')
    .upsert({
      user_id: TEST_USER_ID,
      date: date,
      file_name: `test_excel_${date}.xlsx`,
      data: { sets }
    }, { onConflict: 'user_id,date' });

  if (excelResult.error) {
    console.log(`❌ Excel error for ${date}:`, excelResult.error.message);
  } else {
    console.log(`✅ Excel data for ${date}`);
  }

  // Create planet selections
  const planetSelections = {};
  const planets = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'];
  
  for (let hr = 1; hr <= 24; hr++) {
    const planetIndex = (hr - 1 + i) % planets.length;
    planetSelections[hr] = planets[planetIndex];
  }

  // Insert Hour Entry data
  const hourResult = await supabase
    .from('hour_entry')
    .upsert({
      user_id: TEST_USER_ID,
      date_key: date,
      planet_selections: planetSelections,
      saved_at: new Date().toISOString()
    }, { onConflict: 'user_id,date_key' });

  if (hourResult.error) {
    console.log(`❌ Hour error for ${date}:`, hourResult.error.message);
  } else {
    console.log(`✅ Hour data for ${date}`);
  }
}

// Verify
const { data: verifyExcel } = await supabase
  .from('excel_data')
  .select('date')
  .eq('user_id', TEST_USER_ID);

const { data: verifyHour } = await supabase
  .from('hour_entry')
  .select('date_key')
  .eq('user_id', TEST_USER_ID);

console.log(`\n📊 Verification: ${verifyExcel?.length || 0} Excel, ${verifyHour?.length || 0} Hour entries`);
console.log('🎉 Test data creation complete!');
console.log('\n🔧 NEXT STEPS:');
console.log('1. Refresh your ABCD application');
console.log('2. Select "TestUser" in the user dropdown');
console.log('3. You should see 5 dates with green status');
console.log('4. Click "Rule-1" on the 5th date');
console.log('5. Rule1Page should now show data instead of "No data available"');
