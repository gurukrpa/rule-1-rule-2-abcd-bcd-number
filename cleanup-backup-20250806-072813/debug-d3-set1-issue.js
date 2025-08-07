/**
 * Debug D-3 Set-1 Excel Extraction Issue
 * Node.js version to investigate the problem
 */

console.log('🔍 DEBUGGING: D-3 Set-1 Excel Extraction Issue');

// Check if the topic name matching is working correctly
function checkTopicNameMatching() {
  console.log('\n📊 TOPIC NAME MATCHING CHECK:');
  
  // Expected topic names from ALL_TOPICS
  const ALL_TOPICS = [
    'D-1 Set-1 Matrix', 'D-1 Set-2 Matrix',
    'D-3 Set-1 Matrix', 'D-3 Set-2 Matrix',
    'D-4 Set-1 Matrix', 'D-4 Set-2 Matrix',
    'D-5 Set-1 Matrix', 'D-5 Set-2 Matrix',
    'D-7 Set-1 Matrix', 'D-7 Set-2 Matrix',
    'D-9 Set-1 Matrix', 'D-9 Set-2 Matrix',
    'D-10 Set-1 Matrix', 'D-10 Set-2 Matrix',
    'D-11 Set-1 Matrix', 'D-11 Set-2 Matrix',
    'D-12 Set-1 Matrix', 'D-12 Set-2 Matrix',
    'D-27 Set-1 Matrix', 'D-27 Set-2 Matrix',
    'D-30 Set-1 Matrix', 'D-30 Set-2 Matrix',
    'D-60 Set-1 Matrix', 'D-60 Set-2 Matrix',
    'D-81 Set-1 Matrix', 'D-81 Set-2 Matrix',
    'D-108 Set-1 Matrix', 'D-108 Set-2 Matrix',
    'D-144 Set-1 Matrix', 'D-144 Set-2 Matrix'
  ];
  
  // Check topic detection logic
  const testTopicNames = [
    'D-3 Set-1 Matrix',
    'D-3 Set-2 Matrix', 
    'D-1 Set-1 Matrix',
    'D-4 Set-1 Matrix'
  ];
  
  testTopicNames.forEach(topic => {
    const isExpected = ALL_TOPICS.includes(topic);
    const hasMatrix = topic.includes('Matrix');
    const hasD = topic.includes('D-');
    const hasSet = topic.includes('Set-');
    
    console.log(`  "${topic}": Expected=${isExpected}, Matrix=${hasMatrix}, D-=${hasD}, Set=${hasSet}`);
  });
}

// Check element name mapping
function checkElementMapping() {
  console.log('\n📝 ELEMENT MAPPING CHECK:');
  
  const elementNameMapping = {
    'as': 'as',
    'mo': 'mo', 
    'hl': 'hl',
    'gl': 'gl',
    'vig': 'vig',
    'var': 'var',
    'sl': 'sl',
    'pp': 'pp',
    'in': 'in',
    
    // Excel uses these names - map to our codes
    'lagna': 'as',
    'ascendant': 'as',
    'moon': 'mo',
    'hora lagna': 'hl',
    'ghati lagna': 'gl', 
    'vighati lagna': 'vig',
    'varnada lagna': 'var',
    'sree lagna': 'sl',
    'pranapada lagna': 'pp',
    'indu lagna': 'in'
  };
  
  console.log('Element mappings:', elementNameMapping);
  
  // Test specific mappings
  const testElements = ['lagna', 'moon', 'hora lagna', 'as', 'mo'];
  testElements.forEach(element => {
    const mapped = elementNameMapping[element.toLowerCase()];
    console.log(`  "${element}" -> ${mapped || 'NOT MAPPED'}`);
  });
}

// Main diagnostic
function diagnoseD3Set1Issue() {
  console.log('\n🎯 DIAGNOSING D-3 Set-1 ISSUE:');
  
  console.log('\n1. Topic Detection Pattern:');
  const testString = 'D-3 Set-1 Matrix';
  console.log(`   Test string: "${testString}"`);
  console.log(`   Contains 'Matrix': ${testString.includes('Matrix')}`);
  console.log(`   Contains 'D-': ${testString.includes('D-')}`);
  console.log(`   Contains 'Set-': ${testString.includes('Set-')}`);
  console.log(`   Would be detected: ${testString.includes('Matrix') && (testString.includes('D-') || testString.includes('Set-'))}`);
  
  console.log('\n2. Possible Issues:');
  console.log('   - Excel file might not have "D-3 Set-1 Matrix" exactly');
  console.log('   - Topic name might have extra spaces or characters');
  console.log('   - Elements under D-3 Set-1 might not be mapped correctly');
  console.log('   - Data extraction might be failing for this specific topic');
  
  console.log('\n3. Expected Excel Structure for D-3 Set-1:');
  console.log('   Row with "D-3 Set-1 Matrix"');
  console.log('   Followed by planet headers (x, Sun, Moon, etc.)');
  console.log('   Followed by element rows (as, mo, hl, etc.)');
  console.log('   Each element row should have 9 planet values');
}

// Check browser console instructions
function showBrowserInstructions() {
  console.log('\n🌐 BROWSER CONSOLE DEBUGGING:');
  console.log('To debug in the browser after Excel upload:');
  console.log('');
  console.log('1. Open browser developer tools (F12)');
  console.log('2. Go to Console tab');
  console.log('3. Upload your Excel file');
  console.log('4. Look for these console messages:');
  console.log('   - "📊 [Future] Found set: D-3 Set-1 Matrix"');
  console.log('   - "📝 [Future] Lagna (as): X planets with data"');
  console.log('   - Any error messages about D-3 Set-1');
  console.log('');
  console.log('5. If D-3 Set-1 is not found, check:');
  console.log('   - Exact spelling in Excel');
  console.log('   - Row structure around D-3 Set-1');
  console.log('   - Element codes under that section');
}

// Run all checks
checkTopicNameMatching();
checkElementMapping();
diagnoseD3Set1Issue();
showBrowserInstructions();

console.log('\n✅ Diagnostic complete. Check browser console after Excel upload for detailed logs.');
