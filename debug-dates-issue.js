// Debug the dates issue
const selectedDate = '2025-07-07';
const availableDates = ['2025-06-30', '2025-07-01', '2025-07-02', '2025-07-03', '2025-07-04', '2025-07-05', '2025-07-06'];

console.log('🔍 Debugging date selection issue...');
console.log('selectedDate:', selectedDate);
console.log('availableDates:', availableDates);

const sortedDates = [...availableDates].sort((a, b) => new Date(a) - new Date(b));
const analysisIndex = sortedDates.indexOf(selectedDate);

console.log('sortedDates:', sortedDates);
console.log('analysisIndex:', analysisIndex);

if (analysisIndex === -1) {
  console.log('❌ PROBLEM: selectedDate not found in availableDates!');
  console.log('This is why it falls back to using the latest available date');
} else {
  console.log('✅ selectedDate found at index', analysisIndex);
}
