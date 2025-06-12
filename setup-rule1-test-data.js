// RULE-1 TEST DATA SETUP
// Run this in browser console to set up test data for Rule-1 Steps 2 & 3 verification

console.log('🧪 Setting up Rule-1 test data...');

// Create test user if needed
const userData = localStorage.getItem('abcd_users_data');
if (!userData) {
  const testUser = {
    id: '999',
    username: 'TestUser_Rule1',
    hr: 3
  };
  localStorage.setItem('abcd_users_data', JSON.stringify([testUser]));
  console.log('✅ Test user created:', testUser);
}

const users = JSON.parse(localStorage.getItem('abcd_users_data') || '[]');
const testUser = users[0];
console.log('👤 Using user:', testUser.username, 'ID:', testUser.id);

// Create test dates (need 5 dates for Rule-1 to be enabled)
const testDates = [
  '2025-01-01', // A
  '2025-01-02', // B  
  '2025-01-03', // C
  '2025-01-04', // D
  '2025-01-05'  // Rule-1 trigger date (5th)
];

const datesKey = `abcd_dates_${testUser.id}`;
localStorage.setItem(datesKey, JSON.stringify(testDates));
console.log('✅ Test dates created:', testDates);

// Create Excel and Hour Entry data for each date
testDates.forEach((date, index) => {
  if (index < 4) { // Only A, B, C, D dates need data
    const dateLabel = ['A', 'B', 'C', 'D'][index];
    
    // Excel data with specific patterns for ABCD/BCD testing
    const excelData = {
      date: date,
      data: {
        sets: {
          'D-1 Set-1 Matrix': {
            'Lagna': {
              'Su': `as-7-/su-(10 Sc 03)-(17 Ta 58)`, // Number 7 in all dates → ABCD
              'Mo': `as-${10 + index}-/mo-(20 Ar 15)-(25 Le 42)`,
              'Ma': `as-${20 + index}-/ma-(30 Pi 27)-(35 Vi 36)`
            },
            'Moon': {
              'Su': index === 0 || index === 3 ? `mo-3-/su-(15 Ge 48)-(22 Cp 19)` : 
                    index === 1 ? `mo-5-/su-(16 Ta 33)-(08 Aq 51)` : // B has 5
                    `mo-8-/su-(17 Cn 12)-(14 Sg 28)`, // C has 8, D will have 5 → BCD
              'Mo': `mo-${15 + index}-/mo-(25 Li 25)-(30 Sc 17)`,
              'Ra': index === 3 ? `mo-5-/ra-(18 Li 25)-(11 Sc 17)` : `mo-${25 + index}-/ra-(35 Aq 45)-(40 Sg 12)` // D has 5 → BCD
            },
            'Vighati Lagna': {
              'Su': `vig-${index + 1}-/su-(19 Ar 60)-(05 Pi 43)`, // Different numbers → no qualification
              'Mo': `vig-${10 + index}-/mo-(29 Li 25)-(34 Sc 17)`,
              'Ra': `vig-${20 + index}-/ra-(39 Cp 15)-(44 Le 36)`
            }
          }
        }
      }
    };
    
    const excelKey = `abcd_excelData_${testUser.id}_${date}`;
    localStorage.setItem(excelKey, JSON.stringify(excelData));
    
    // Hour entry data
    const hourData = {
      planetSelections: {
        '1': 'Su',
        '2': 'Mo',
        '3': 'Ra'
      }
    };
    
    const hourKey = `abcd_hourEntry_${testUser.id}_${date}`;
    localStorage.setItem(hourKey, JSON.stringify(hourData));
    
    console.log(`📊 Created data for ${date} (${dateLabel})`);
  }
});

console.log('');
console.log('✅ Test data setup complete!');
console.log('🎯 Expected Results:');
console.log('   - Lagna: ABCD qualifying (number 7 appears in A, B, C, D)');
console.log('   - Moon: BCD qualifying (number 5 appears in B, D but not A, C)');
console.log('   - Vighati Lagna: No qualification (different numbers)');
console.log('');
console.log(`🚀 Next: Navigate to /user/${testUser.id} and click Rule-1 for ${testDates[4]}`);
console.log('📋 Then run: verifyRule1Steps()');
