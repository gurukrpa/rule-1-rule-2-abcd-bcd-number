/**
 * Debug D-1 Set-1 Wrong Numbers - Browser Console Script
 * 
 * Copy and paste this into the browser console while on the Planets Analysis page
 * to debug why "A: 1,2,4,9" is showing instead of "ABCD: 1,2,4,7,9" and "BCD: 5"
 */

console.log('🔍 DEBUGGING D-1 SET-1 WRONG NUMBERS ISSUE');
console.log('===========================================');

console.log('\n📋 Expected vs Current:');
console.log('✅ Expected: ABCD[1,2,4,7,9], BCD[5]');
console.log('❌ Seeing: A[1,2,4,9] (missing 7, no BCD)');

// Step 1: Check if we're on the right page
console.log('\n🌐 Step 1: Page Environment Check');
console.log('Current URL:', window.location.href);
console.log('Is planets-analysis page?', window.location.href.includes('planets-analysis'));

// Step 2: Check React component state
console.log('\n⚛️ Step 2: React Component State Analysis');
try {
    // Find React root
    const rootElement = document.querySelector('#root');
    if (rootElement && rootElement._reactInternalFiber) {
        console.log('✅ React fiber found (legacy)');
    } else if (rootElement && rootElement._reactInternals) {
        console.log('✅ React internals found (modern)');
    } else {
        console.log('⚠️ React root not accessible - try React DevTools');
    }
} catch (error) {
    console.log('❌ Error accessing React state:', error.message);
}

// Step 3: Check localStorage for user data
console.log('\n💾 Step 3: localStorage Analysis');
const userInfo = localStorage.getItem('userInfo');
const selectedUser = localStorage.getItem('selectedUser');

if (userInfo) {
    try {
        const parsed = JSON.parse(userInfo);
        console.log('👤 UserInfo found:', { userId: parsed.userId, hr: parsed.hr });
    } catch (e) {
        console.log('👤 UserInfo found but not JSON:', userInfo.substring(0, 50));
    }
} else {
    console.log('❌ No userInfo in localStorage');
}

if (selectedUser) {
    console.log('👤 Selected user:', selectedUser);
} else {
    console.log('❌ No selectedUser in localStorage');
}

// Step 4: Test fallback data integrity
console.log('\n🧪 Step 4: Testing Fallback Data');
const TOPIC_NUMBERS = {
    'D-1 Set-1 Matrix': { abcd: [1, 2, 4, 7, 9], bcd: [5] }
};

const d1Set1Fallback = TOPIC_NUMBERS['D-1 Set-1 Matrix'];
console.log('📊 Fallback D-1 Set-1:', d1Set1Fallback);
console.log('🔍 Contains 7?', d1Set1Fallback.abcd.includes(7));
console.log('🔍 Contains 5 in BCD?', d1Set1Fallback.bcd.includes(5));

if (d1Set1Fallback.abcd.includes(7) && d1Set1Fallback.bcd.includes(5)) {
    console.log('✅ Fallback data is CORRECT');
} else {
    console.log('❌ Fallback data is WRONG');
}

// Step 5: Check global window objects for analysis data
console.log('\n🌍 Step 5: Global Objects Check');
const globalKeys = Object.keys(window).filter(key => 
    key.toLowerCase().includes('analysis') || 
    key.toLowerCase().includes('planets') ||
    key.toLowerCase().includes('abcd')
);

if (globalKeys.length > 0) {
    console.log('🔍 Found global analysis objects:', globalKeys);
    globalKeys.forEach(key => {
        try {
            console.log(`${key}:`, typeof window[key], window[key]);
        } catch (e) {
            console.log(`${key}: Error accessing -`, e.message);
        }
    });
} else {
    console.log('⚠️ No global analysis objects found');
}

// Step 6: Examine DOM for current topic display
console.log('\n🎨 Step 6: DOM Analysis');
const topicHeaders = document.querySelectorAll('h3, h4, .topic-header, [class*="topic"], [class*="matrix"]');
console.log(`📋 Found ${topicHeaders.length} potential topic headers`);

// Look for D-1 Set-1 specifically
const d1Set1Elements = Array.from(document.querySelectorAll('*')).filter(el => 
    el.textContent && el.textContent.includes('D-1') && el.textContent.includes('Set-1')
);

console.log(`🎯 Found ${d1Set1Elements.length} elements containing "D-1 Set-1"`);
d1Set1Elements.forEach((el, index) => {
    console.log(`D-1 Set-1 Element ${index + 1}:`, el.textContent.trim().substring(0, 100));
});

// Step 7: Look for ABCD/BCD number displays
console.log('\n🔢 Step 7: Number Display Analysis');
const numberElements = Array.from(document.querySelectorAll('*')).filter(el => 
    el.textContent && (
        el.textContent.includes('ABCD') || 
        el.textContent.includes('BCD') ||
        el.textContent.includes('[') ||
        /\b[1-9],\s*[1-9]/.test(el.textContent)
    )
);

console.log(`🔍 Found ${numberElements.length} elements with number patterns`);
numberElements.slice(0, 10).forEach((el, index) => {
    const text = el.textContent.trim();
    if (text.length < 200) {
        console.log(`Numbers ${index + 1}: "${text}"`);
    }
});

// Step 8: Check for hour selection state
console.log('\n🕐 Step 8: Hour Selection Analysis');
const hourButtons = document.querySelectorAll('button, .hour, [class*="hr"], [class*="hour"]');
console.log(`⏰ Found ${hourButtons.length} potential hour-related elements`);

const activeHourElements = Array.from(hourButtons).filter(el => 
    el.classList.contains('active') || 
    el.classList.contains('selected') ||
    el.getAttribute('aria-selected') === 'true'
);

console.log(`🎯 Found ${activeHourElements.length} active hour elements`);
activeHourElements.forEach((el, index) => {
    console.log(`Active Hour ${index + 1}:`, el.textContent.trim(), el.className);
});

// Step 9: Final diagnostic summary
console.log('\n🎯 DIAGNOSTIC SUMMARY');
console.log('===================');
console.log('1. If fallback data is correct: Issue is in real analysis data or state management');
console.log('2. If DOM shows wrong numbers: Issue is in UI rendering or data binding');
console.log('3. If hour selection is wrong: Issue is in hour switching logic');
console.log('4. Check browser Network tab for failed API calls');
console.log('5. Check React DevTools for component state');

console.log('\n💡 NEXT STEPS:');
console.log('1. Switch to different hours and re-run this script');
console.log('2. Check console for [PlanetsAnalysis] log messages');
console.log('3. Look for getTopicNumbers() or getTopicNumbersWithNormalization() calls');
console.log('4. Verify realAnalysisData state is not null or incomplete');

console.log('\n✅ Diagnostic complete - check above output for clues!');

// Return a summary object for easy access
window.debugSummary = {
    fallbackCorrect: d1Set1Fallback.abcd.includes(7) && d1Set1Fallback.bcd.includes(5),
    userDataExists: !!userInfo && !!selectedUser,
    d1Set1ElementsFound: d1Set1Elements.length,
    numberElementsFound: numberElements.length,
    activeHoursFound: activeHourElements.length,
    recommendation: 'Check React DevTools for component state and console logs for data loading issues'
};

console.log('\n📊 Summary object stored in window.debugSummary for easy access');
return window.debugSummary;
