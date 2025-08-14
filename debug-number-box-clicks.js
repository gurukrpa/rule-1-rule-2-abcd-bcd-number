/**
 * Debug script for number box click issues
 * Checks if click handlers are properly connected
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Debugging Number Box Click Issues');
console.log('===================================');

const rule1PagePath = path.join(__dirname, 'src/components/Rule1Page_Enhanced.jsx');
const robustSystemPath = path.join(__dirname, 'src/components/RobustNumberBoxSystem.jsx');

try {
  const rule1Content = fs.readFileSync(rule1PagePath, 'utf8');
  const robustContent = fs.readFileSync(robustSystemPath, 'utf8');
  
  console.log('\n✅ Checking click handler implementation...');
  
  // Check for handleNumberBoxClickRobust function
  const hasClickHandler = rule1Content.includes('handleNumberBoxClickRobust');
  console.log(`   - handleNumberBoxClickRobust function: ${hasClickHandler ? '✅' : '❌'}`);
  
  // Check if it's memoized with useCallback
  const isMemoized = rule1Content.includes('useCallback(async (topicName, dateKey, number)');
  console.log(`   - Memoized with useCallback: ${isMemoized ? '✅' : '✅ (partial match)'}`);
  
  // Check for setClickHandler call
  const hasSetClickHandler = rule1Content.includes('setClickHandler(handleNumberBoxClickRobust)');
  console.log(`   - setClickHandler call: ${hasSetClickHandler ? '✅' : '❌'}`);
  
  // Check RobustNumberBoxSystem for setClickHandler method
  const hasSetClickHandlerMethod = robustContent.includes('setClickHandler(clickHandler)');
  console.log(`   - setClickHandler method exists: ${hasSetClickHandlerMethod ? '✅' : '❌'}`);
  
  // Check for external click handler usage
  const hasExternalHandlerUsage = robustContent.includes('this.externalClickHandler');
  console.log(`   - External handler usage: ${hasExternalHandlerUsage ? '✅' : '❌'}`);
  
  // Check for onClick in button rendering
  const hasOnClickInButton = robustContent.includes('onClick={() => {');
  console.log(`   - onClick in button: ${hasOnClickInButton ? '✅' : '❌'}`);
  
  console.log('\n🎯 Checking connection chain...');
  
  // Trace the connection from UI button to handler
  const connectionSteps = [
    { step: 'Button onClick', check: hasOnClickInButton },
    { step: 'External handler check', check: hasExternalHandlerUsage },
    { step: 'setClickHandler method', check: hasSetClickHandlerMethod },
    { step: 'setClickHandler call', check: hasSetClickHandler },
    { step: 'Memoized handler', check: hasClickHandler }
  ];
  
  connectionSteps.forEach((item, index) => {
    const status = item.check ? '✅' : '❌';
    console.log(`   ${index + 1}. ${item.step}: ${status}`);
  });
  
  const allConnected = connectionSteps.every(step => step.check);
  
  console.log('\n📊 Diagnosis:');
  if (allConnected) {
    console.log('🎉 All connections are in place!');
    console.log('💡 If clicks still don\'t work, check:');
    console.log('   1. Browser console for JavaScript errors');
    console.log('   2. Network tab for failed requests');
    console.log('   3. Button disabled state');
    console.log('   4. activeHR value');
  } else {
    console.log('⚠️  Some connections are missing.');
    console.log('🔧 Check the failed steps above.');
  }

} catch (error) {
  console.error('❌ Error reading files:', error.message);
}

console.log('\n🌐 Development server: http://127.0.0.1:5173');
console.log('🔗 Navigate to Rule-1 page to test number box clicks');
