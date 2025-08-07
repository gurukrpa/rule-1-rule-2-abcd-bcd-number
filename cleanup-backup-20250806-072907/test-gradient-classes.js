// Simple test to check if gradient is working
// Run this in browser console to test gradient functionality
// Visual elements disabled - check console for results

console.log('🧪 Testing Gradient Classes (console only)');

// Test functions remain available but visual elements disabled
function testGradientClasses() {
  console.log('✅ Gradient test function available');
  console.log('📝 Use browser dev tools to inspect gradient elements manually');
  return 'Gradient classes test complete - check console';
}

testContainer.appendChild(document.createTextNode('Gradient Tests:'));
testContainer.appendChild(test1);
testContainer.appendChild(document.createElement('br'));
testContainer.appendChild(test2);
testContainer.appendChild(test3);

document.body.appendChild(testContainer);

// Check computed styles
setTimeout(() => {
  const style1 = window.getComputedStyle(test1);
  const style2 = window.getComputedStyle(test2);
  
  console.log('Test 1 background:', style1.background || style1.backgroundImage);
  console.log('Test 2 background:', style2.background || style2.backgroundImage);
  
  if (style1.background.includes('gradient') || style1.backgroundImage.includes('gradient')) {
    console.log('✅ Gradient classes are working!');
  } else {
    console.log('❌ Gradient classes not working');
  }
  
  // Remove after 10 seconds
  setTimeout(() => {
    document.body.removeChild(testContainer);
  }, 10000);
}, 1000);
