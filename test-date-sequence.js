// Test script to simulate the date sequence issue
// Run this in browser console while on the app

function testDateSequence() {
    console.log('🧪 === TESTING DATE SEQUENCE ISSUE ===');
    
    // Simulate having dates like the user reported
    const testDates = [
        '2024-01-01', '2024-01-02', '2024-01-03', 
        '2024-01-04', '2024-01-05', '2024-01-06', 
        '2024-01-07', '2024-01-08', '2024-01-09', '2024-01-10'
    ];
    
    console.log('📅 Test dates:', testDates);
    
    // Test clicking on 5th date (index 4)
    console.log('\n🔍 Testing click on 5th date (2024-01-05):');
    testRule2Click('2024-01-05', testDates);
    
    // Test clicking on 6th date (index 5)  
    console.log('\n🔍 Testing click on 6th date (2024-01-06):');
    testRule2Click('2024-01-06', testDates);
}

function testRule2Click(clickedDate, datesList) {
    console.log(`📍 User clicked on: ${clickedDate}`);
    
    // Simulate the sorting logic from Rule2CompactPage
    const sortedDates = [...datesList].sort((a, b) => new Date(a) - new Date(b));
    console.log('📅 Sorted dates:', sortedDates);
    
    // Find the clicked date index
    const clickedIndex = sortedDates.findIndex(d => d === clickedDate);
    console.log(`📍 Clicked date "${clickedDate}" found at index ${clickedIndex}`);
    
    // Calculate ABCD sequence (like in Rule2CompactPage)
    if (clickedIndex >= 4) {
        const aDay = sortedDates[clickedIndex - 4];
        const bDay = sortedDates[clickedIndex - 3];
        const cDay = sortedDates[clickedIndex - 2];
        const dDay = sortedDates[clickedIndex - 1];
        
        console.log('🔗 ABCD SEQUENCE CALCULATION:');
        console.log(`  A-day: sortedDates[${clickedIndex - 4}] = ${aDay}`);
        console.log(`  B-day: sortedDates[${clickedIndex - 3}] = ${bDay}`);
        console.log(`  C-day: sortedDates[${clickedIndex - 2}] = ${cDay}`);
        console.log(`  D-day: sortedDates[${clickedIndex - 1}] = ${dDay} ← ANALYSIS SOURCE`);
        console.log(`  Clicked: sortedDates[${clickedIndex}] = ${clickedDate} (should match clicked date)`);
        
        // This is where the bug might be - D-day is used for analysis but user expects clicked date
        console.log(`\n⚠️  ISSUE: User clicked ${clickedDate} but analysis will use ${dDay} data!`);
        
        return { aDay, bDay, cDay, dDay, clickedDate };
    } else {
        console.log('❌ Not enough previous dates for ABCD analysis');
        return null;
    }
}

// Auto-run the test
testDateSequence();
