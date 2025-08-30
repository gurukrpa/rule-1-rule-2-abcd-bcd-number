// 🔍 BROWSER CONSOLE DIAGNOSTIC SCRIPT
// Run this in browser console on localhost:5173/planets-analysis

console.log('🚀 Starting PlanetsAnalysisPage diagnostic...');

// Check if the fetchLastDateAnalysis function is being called
const originalConsoleLog = console.log;
let fetchCalled = false;

// Check localStorage for any relevant data
console.log('📦 LocalStorage data:', {
  user: localStorage.getItem('user'),
  selectedHour: localStorage.getItem('selectedHour'),
  planetsData: localStorage.getItem('planetsData')
});

// Check if realAnalysisData is being set
setTimeout(() => {
  // Look for React components in window
  const reactFiber = document.querySelector('#root')._reactInternalInstance || 
                    document.querySelector('#root')._reactInternals;
  
  console.log('🔍 Checking page state...');
  
  // Check if the success/error messages are being set
  const successElement = document.querySelector('.text-green-700');
  const errorElement = document.querySelector('.text-red-700');
  
  if (successElement) {
    console.log('✅ Success message found:', successElement.textContent);
  }
  
  if (errorElement) {
    console.log('❌ Error message found:', errorElement.textContent);
  }
  
  // Check the current displayed numbers
  const abcdElements = document.querySelectorAll('[class*="bg-green-100"] .font-mono');
  const bcdElements = document.querySelectorAll('[class*="bg-blue-100"] .font-mono');
  
  console.log('📊 Currently displayed ABCD:', 
    Array.from(abcdElements).map(el => el.textContent));
  console.log('📊 Currently displayed BCD:', 
    Array.from(bcdElements).map(el => el.textContent));
  
  // Check network requests
  console.log('🌐 Check Network tab for Supabase requests to topic_analysis_results');
  
}, 2000);

// Override fetch to monitor Supabase calls
const originalFetch = window.fetch;
window.fetch = function(...args) {
  if (args[0] && args[0].includes('topic_analysis_results')) {
    console.log('🌐 Supabase request detected:', args[0]);
    console.log('📤 Request details:', args[1]);
  }
  return originalFetch.apply(this, args).then(response => {
    if (args[0] && args[0].includes('topic_analysis_results')) {
      response.clone().json().then(data => {
        console.log('📥 Supabase response:', data);
      }).catch(() => {
        console.log('📥 Supabase response: (non-JSON)');
      });
    }
    return response;
  });
};

console.log('✅ Diagnostic script loaded. Refresh the page to capture data.');
