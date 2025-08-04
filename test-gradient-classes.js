// Simple test to check if gradient is working
// Run this in browser console to test gradient functionality

console.log('🧪 Testing Gradient Classes');

// Create test elements
const testContainer = document.createElement('div');
testContainer.style.position = 'fixed';
testContainer.style.top = '10px';
testContainer.style.right = '10px';
testContainer.style.zIndex = '9999';
testContainer.style.padding = '10px';
testContainer.style.backgroundColor = 'white';
testContainer.style.border = '1px solid black';
testContainer.style.borderRadius = '5px';

// Test 1: Basic gradient
const test1 = document.createElement('div');
test1.className = 'bg-gradient-to-r from-green-400 to-emerald-500';
test1.style.width = '100px';
test1.style.height = '30px';
test1.style.margin = '5px';
test1.textContent = 'Gradient Test';
test1.style.color = 'white';
test1.style.display = 'flex';
test1.style.alignItems = 'center';
test1.style.justifyContent = 'center';
test1.style.fontSize = '12px';

// Test 2: Button with same classes as number box
const test2 = document.createElement('button');
test2.className = 'w-6 h-6 text-xs font-bold rounded border transition-all transform bg-gradient-to-r from-green-400 to-emerald-500 text-white border-emerald-400 shadow-md scale-105';
test2.textContent = '7';
test2.style.margin = '5px';

// Test 3: Regular green for comparison
const test3 = document.createElement('button');
test3.className = 'w-6 h-6 text-xs font-bold rounded border bg-green-200 text-green-800 border-green-300';
test3.textContent = '8';
test3.style.margin = '5px';

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
