// Debug script to check July 7th N-1 pattern issue
// Run this in browser console when on the Planets Analysis page

console.log('🔍 DEBUG: July 7th N-1 Pattern Issue');

async function debugN1Pattern() {
  try {
    // Check localStorage for available dates
    const storageKey = 'abcd_dates_sing maya';
    const storedDates = localStorage.getItem(storageKey);
    
    if (storedDates) {
      const dates = JSON.parse(storedDates);
      console.log('📅 Available dates in localStorage:', dates);
      
      // Sort dates to see chronological order
      const sortedDates = [...dates].sort((a, b) => new Date(a) - new Date(b));
      console.log('📅 Sorted dates (chronological):', sortedDates);
      
      // Test N-1 logic for July 7th
      const selectedDate = '2025-07-07';
      const selectedDateObj = new Date(selectedDate);
      
      // Calculate N-1 date
      const n1DateObj = new Date(selectedDateObj);
      n1DateObj.setDate(n1DateObj.getDate() - 1);
      const n1Date = n1DateObj.toISOString().split('T')[0];
      
      console.log(`🎯 Testing N-1 pattern for ${selectedDate}:`);
      console.log(`   N-1 date should be: ${n1Date}`);
      console.log(`   N-1 date available: ${dates.includes(n1Date)}`);
      
      // Find closest previous date
      let closestPreviousDate = null;
      for (let i = sortedDates.length - 1; i >= 0; i--) {
        const availableDate = new Date(sortedDates[i]);
        console.log(`   Checking ${sortedDates[i]} < ${selectedDate}: ${availableDate < selectedDateObj}`);
        if (availableDate < selectedDateObj) {
          closestPreviousDate = sortedDates[i];
          console.log(`   ✅ Found closest previous: ${closestPreviousDate}`);
          break;
        }
      }
      
      console.log(`📊 Result: Should use ${closestPreviousDate || 'latest available'} for analysis`);
      
      // Check what the current implementation is doing
      console.log('\n🔍 Checking current page state...');
      const analysisDateElement = document.querySelector('[data-testid="analysis-date"]') || 
                                 document.body.textContent.match(/Analysis Date: (\d{2}\/\d{2}\/\d{4})/);
      if (analysisDateElement) {
        console.log('📅 Current analysis date shown:', analysisDateElement[1] || analysisDateElement.textContent);
      }
      
    } else {
      console.log('❌ No dates found in localStorage');
    }
    
  } catch (error) {
    console.error('❌ Error in debug script:', error);
  }
}

// Run the debug
debugN1Pattern();

// Also provide manual commands
console.log('\n🧪 Manual commands to try:');
console.log('1. Check dates: JSON.parse(localStorage.getItem("abcd_dates_sing maya"))');
console.log('2. Expected closest to July 7: Should be July 3, not June 30');
