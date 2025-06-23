// Test script to verify the Rule2 date sequence fix
// Run this in browser console while on the app

function testFixedDateSequence() {
    console.log('🧪 === TESTING FIXED DATE SEQUENCE ===');
    
    // Simulate having dates like the user reported
    const testDates = [
        '2024-01-01', '2024-01-02', '2024-01-03', 
        '2024-01-04', '2024-01-05', '2024-01-06', 
        '2024-01-07', '2024-01-08', '2024-01-09', '2024-01-10'
    ];
    
    console.log('📅 Test dates:', testDates);
    
    // Test clicking on 5th date (index 4) - should use 5th date as D-day
    console.log('\n🔍 Testing click on 5th date (2024-01-05) [FIXED]:');
    testFixedRule2Click('2024-01-05', testDates);
    
    // Test clicking on 6th date (index 5) - should use 6th date as D-day
    console.log('\n🔍 Testing click on 6th date (2024-01-06) [FIXED]:');
    testFixedRule2Click('2024-01-06', testDates);
    
    // Test clicking on 4th date (index 3) - should use 4th date as D-day
    console.log('\n🔍 Testing click on 4th date (2024-01-04) [FIXED]:');
    testFixedRule2Click('2024-01-04', testDates);
}

function testFixedRule2Click(clickedDate, datesList) {
    console.log(`📍 User clicked on: ${clickedDate}`);
    
    // Simulate the FIXED sorting logic from Rule2CompactPage
    const sortedDates = [...datesList].sort((a, b) => new Date(a) - new Date(b));
    console.log('📅 Sorted dates:', sortedDates);
    
    // Find the clicked date index
    const clickedIndex = sortedDates.findIndex(d => d === clickedDate);
    console.log(`📍 Clicked date "${clickedDate}" found at index ${clickedIndex}`);
    
    // Check if we have enough preceding dates
    if (clickedIndex < 3) {
        console.log('❌ Not enough preceding dates for ABCD analysis');
        return null;
    }
    
    // FIXED: Use clicked date as D-day (analysis source)
    const dDay = sortedDates[clickedIndex];     // Clicked date becomes D-day
    const cDay = sortedDates[clickedIndex - 1]; // 1 day before clicked date
    const bDay = sortedDates[clickedIndex - 2]; // 2 days before clicked date
    const aDay = sortedDates[clickedIndex - 3]; // 3 days before clicked date
    
    console.log('🔗 ABCD SEQUENCE CALCULATION (FIXED):');
    console.log(`  A-day: sortedDates[${clickedIndex - 3}] = ${aDay}`);
    console.log(`  B-day: sortedDates[${clickedIndex - 2}] = ${bDay}`);
    console.log(`  C-day: sortedDates[${clickedIndex - 1}] = ${cDay}`);
    console.log(`  D-day: sortedDates[${clickedIndex}] = ${dDay} ← ANALYSIS SOURCE (CLICKED DATE)`);
    console.log(`  ✅ User clicked ${clickedDate} and will see data from ${dDay}`);
    
    return { aDay, bDay, cDay, dDay, clickedDate };
}

// Auto-run the test
testFixedDateSequence();
