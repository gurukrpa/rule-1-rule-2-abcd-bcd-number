// Browser console script to test ABCD page dates loading
// Copy and paste this into the browser console on the ABCD page

console.log('🧪 Testing ABCD Page Dates Loading...');
console.log('=====================================');

// 1. Check if we're on the correct page
console.log('📍 Current URL:', window.location.href);
console.log('📍 Page title:', document.title);

// 2. Check for React components and state
console.log('\n🔍 Checking React Components...');

// Look for the dates count display
const datesDisplay = Array.from(document.querySelectorAll('*')).find(el => 
  el.textContent && el.textContent.includes('📅 Dates:')
);

if (datesDisplay) {
  console.log('✅ Found dates display:', datesDisplay.textContent);
} else {
  console.log('❌ Dates display not found');
}

// Look for user display
const userDisplay = Array.from(document.querySelectorAll('*')).find(el => 
  el.textContent && el.textContent.includes('✅ User:')
);

if (userDisplay) {
  console.log('✅ Found user display:', userDisplay.textContent);
} else {
  console.log('❌ User display not found');
}

// 3. Check for any error messages
console.log('\n⚠️ Checking for errors...');
const errorElements = Array.from(document.querySelectorAll('*')).filter(el => 
  el.textContent && (
    el.textContent.includes('Error') || 
    el.textContent.includes('Failed') ||
    el.textContent.includes('❌')
  )
);

if (errorElements.length > 0) {
  console.log('🚨 Found errors:');
  errorElements.forEach((el, i) => {
    console.log(`  ${i + 1}. ${el.textContent.trim()}`);
  });
} else {
  console.log('✅ No visible errors found');
}

// 4. Check for loading states
const loadingElements = Array.from(document.querySelectorAll('*')).filter(el => 
  el.textContent && el.textContent.includes('Loading')
);

if (loadingElements.length > 0) {
  console.log('⏳ Found loading states:');
  loadingElements.forEach((el, i) => {
    console.log(`  ${i + 1}. ${el.textContent.trim()}`);
  });
} else {
  console.log('✅ No loading states found');
}

// 5. Check if user is selected
console.log('\n👤 Checking user selection...');
const userSelects = document.querySelectorAll('select');
let userSelected = false;

userSelects.forEach(select => {
  if (select.value && select.value !== '') {
    console.log(`✅ User selected: ${select.value}`);
    userSelected = true;
  }
});

if (!userSelected) {
  console.log('❌ No user selected in dropdowns');
}

// 6. Check for dates list
console.log('\n📅 Checking dates list...');
const datesContainer = Array.from(document.querySelectorAll('*')).find(el => 
  el.textContent && el.textContent.includes('Dates List')
);

if (datesContainer) {
  console.log('✅ Found dates list container');
  
  // Count visible date items
  const dateItems = Array.from(document.querySelectorAll('*')).filter(el => 
    el.textContent && /\d{4}/.test(el.textContent) && el.textContent.includes('202')
  );
  
  console.log(`📊 Found ${dateItems.length} date-like elements`);
  
  if (dateItems.length > 0) {
    console.log('📅 Sample dates found:');
    dateItems.slice(0, 5).forEach((el, i) => {
      console.log(`  ${i + 1}. ${el.textContent.trim().substring(0, 50)}...`);
    });
  }
} else {
  console.log('❌ Dates list container not found');
}

// 7. Try to access React state if possible
console.log('\n⚛️ Attempting to access React state...');

// Look for React fiber
const reactRoot = Array.from(document.querySelectorAll('*')).find(el => 
  el._reactInternalFiber || el._reactInternals || el.__reactInternalInstance
);

if (reactRoot) {
  console.log('✅ Found React root element');
  
  // Try to find React state
  try {
    const fiber = reactRoot._reactInternalFiber || reactRoot._reactInternals;
    if (fiber) {
      console.log('✅ Found React fiber');
      // This is a simplified check - React internals can be complex
    }
  } catch (e) {
    console.log('⚠️ Could not access React internals');
  }
} else {
  console.log('❌ React root not found');
}

// 8. Check localStorage for any relevant data
console.log('\n💾 Checking localStorage...');
const storageKeys = Object.keys(localStorage);
const relevantKeys = storageKeys.filter(key => 
  key.includes('sing maya') || 
  key.includes('dates') || 
  key.includes('abcd') ||
  key.includes('user')
);

if (relevantKeys.length > 0) {
  console.log('📦 Found relevant localStorage keys:');
  relevantKeys.forEach(key => {
    const value = localStorage.getItem(key);
    console.log(`  ${key}: ${value ? value.substring(0, 100) + '...' : 'null'}`);
  });
} else {
  console.log('❌ No relevant localStorage data found');
}

console.log('\n🎯 SUMMARY:');
console.log('===========');

if (datesDisplay && datesDisplay.textContent.includes('Dates: 0')) {
  console.log('🚨 ISSUE CONFIRMED: Dates count is 0');
  console.log('💡 This suggests the datesList state is not being populated');
  console.log('🔧 Check Firebase service calls and data loading');
} else if (datesDisplay && datesDisplay.textContent.includes('Dates:')) {
  const match = datesDisplay.textContent.match(/Dates: (\d+)/);
  if (match) {
    console.log(`✅ Dates count: ${match[1]}`);
  }
} else {
  console.log('⚠️ Could not determine dates count');
}

console.log('\n🚀 Next steps:');
console.log('1. Ensure user "sing maya" is selected');
console.log('2. Check browser network tab for Firebase calls');
console.log('3. Check browser console for Firebase service logs');
console.log('4. Verify Firebase credentials and connection');
