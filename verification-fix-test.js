// Copy and paste this into browser console after the fix to test if saves work
// Run this on the Rule-1 page with HR2 selected

console.log('🧪 TESTING NUMBER BOX SAVE FIX...');

// Check if we can access the required services
const hasCleanService = typeof window.cleanSupabaseService !== 'undefined';
console.log('CleanSupabaseService available:', hasCleanService);

// Test function to verify user ID extraction
function testUserIdExtraction() {
  // Simulate different selectedUser formats
  const testCases = [
    { selectedUser: 'simpleString', expected: 'simpleString' },
    { selectedUser: { id: 'objectWithId', name: 'Test User' }, expected: 'objectWithId' },
    { selectedUser: null, expected: null },
    { selectedUser: undefined, expected: undefined }
  ];
  
  testCases.forEach((testCase, index) => {
    const actualUserId = testCase.selectedUser?.id || testCase.selectedUser;
    const passed = actualUserId === testCase.expected;
    console.log(`Test ${index + 1}: ${passed ? '✅ PASS' : '❌ FAIL'}`, {
      input: testCase.selectedUser,
      expected: testCase.expected,
      actual: actualUserId
    });
  });
}

// Manual save test function
async function testManualSave() {
  if (!hasCleanService) {
    console.error('❌ CleanSupabaseService not available for testing');
    return;
  }
  
  // Get today's date key
  const today = new Date();
  const dateKey = today.toISOString().split('T')[0];
  
  const testData = {
    userId: 'test-user-fix-verification',
    topicName: 'Rule 1 Topic',
    dateKey: dateKey,
    hour: 'HR2',
    clickedNumber: 99999, // Unique test number
    isMatched: false
  };
  
  console.log('🔍 Testing manual save with:', testData);
  
  try {
    const result = await window.cleanSupabaseService.saveTopicClick(
      testData.userId,
      testData.topicName,
      testData.dateKey,
      testData.hour,
      testData.clickedNumber,
      testData.isMatched
    );
    console.log('✅ Manual save test SUCCESSFUL:', result);
    
    // Now test retrieval
    const retrieved = await window.cleanSupabaseService.getTopicClicks(
      testData.userId,
      testData.topicName,
      testData.dateKey
    );
    console.log('✅ Retrieval test result:', retrieved);
    
  } catch (error) {
    console.error('❌ Manual save test FAILED:', error);
  }
}

// Run the tests
testUserIdExtraction();

// Only run manual save test if user confirms
console.log('📝 To test actual database save, run: testManualSave()');
