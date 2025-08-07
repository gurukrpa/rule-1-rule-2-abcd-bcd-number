// Quick verification script for gradient number boxes
// Run this in browser console after clicking a number box

console.log('🔍 GRADIENT VERIFICATION');
console.log('========================');

// Find all number box buttons
const numberBoxes = document.querySelectorAll('button[class*="w-6 h-6"]');
console.log(`Found ${numberBoxes.length} number box buttons`);

// Check each button's styling
numberBoxes.forEach((button, index) => {
  const hasGradientClass = button.className.includes('bg-gradient-to-r');
  const hasInlineStyle = button.style.background && button.style.background.includes('gradient');
  const computedStyle = window.getComputedStyle(button);
  const computedBg = computedStyle.background || computedStyle.backgroundImage;
  
  console.log(`Button ${index + 1} (${button.textContent}):`);
  console.log(`  Gradient class: ${hasGradientClass}`);
  console.log(`  Inline style: ${hasInlineStyle}`);
  console.log(`  Computed style: ${computedBg.substring(0, 100)}...`);
  console.log(`  All classes: ${button.className}`);
  
  if (hasGradientClass || hasInlineStyle || computedBg.includes('gradient')) {
    console.log(`  ✅ Has gradient styling`);
  } else {
    console.log(`  ❌ No gradient detected`);
  }
  console.log('');
});

// Test clicking if no gradients found
const hasAnyGradient = Array.from(numberBoxes).some(btn => 
  btn.className.includes('bg-gradient-to-r') || 
  (btn.style.background && btn.style.background.includes('gradient'))
);

if (!hasAnyGradient && numberBoxes.length > 0) {
  console.log('🖱️ No gradients found, testing click on first button...');
  
  const firstButton = numberBoxes[0];
  console.log(`Clicking button "${firstButton.textContent}"`);
  
  firstButton.click();
  
  setTimeout(() => {
    const afterClickHasGradient = firstButton.className.includes('bg-gradient-to-r') || 
                                  (firstButton.style.background && firstButton.style.background.includes('gradient'));
    
    if (afterClickHasGradient) {
      console.log('✅ Gradient appeared after click!');
    } else {
      console.log('❌ Still no gradient after click');
      console.log(`Post-click classes: ${firstButton.className}`);
      console.log(`Post-click style: ${firstButton.style.cssText}`);
    }
  }, 500);
}

console.log('\n💡 If you still don\'t see gradients:');
console.log('1. Make sure you have at least 5 dates (number boxes only show from 5th date)');
console.log('2. Check browser console for React errors');
console.log('3. Try hard refresh (Cmd+Shift+R)');
console.log('4. Verify you\'re on the Rule1Page (Past Days page)');
