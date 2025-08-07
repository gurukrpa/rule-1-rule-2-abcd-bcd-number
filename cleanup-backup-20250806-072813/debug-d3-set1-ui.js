// Browser console test for D-3 Set-1 hasTopicData debugging
// Run this in the browser console after uploading Excel data on the Future Planets Analysis page

console.log('🔍 Starting D-3 Set-1 hasTopicData debugging...');

// 1. Check current planetsData state
console.log('\n📊 Current planetsData structure:');
console.log('Available topics in planetsData:', Object.keys(window.planetsData || {}));

// 2. Specifically look for D-3 Set-1 variations
const allTopics = Object.keys(window.planetsData || {});
const d3Topics = allTopics.filter(topic => topic.includes('D-3'));
const set1Topics = allTopics.filter(topic => topic.includes('Set-1'));

console.log('\n🎯 D-3 related topics:', d3Topics);
console.log('🎯 Set-1 related topics:', set1Topics.slice(0, 5), '...');

// 3. Find exact D-3 Set-1 match
const d3Set1Topic = allTopics.find(topic => topic.includes('D-3') && topic.includes('Set-1'));
console.log('\n🎯 D-3 Set-1 topic found:', d3Set1Topic);

if (d3Set1Topic && window.planetsData) {
  console.log('🎯 D-3 Set-1 data structure:', {
    elements: Object.keys(window.planetsData[d3Set1Topic] || {}),
    firstElement: window.planetsData[d3Set1Topic] ? Object.keys(window.planetsData[d3Set1Topic])[0] : 'N/A'
  });
  
  // 4. Test the hasTopicData logic
  const topicData = window.planetsData[d3Set1Topic];
  if (topicData) {
    console.log('\n🧪 Testing hasTopicData logic for D-3 Set-1:');
    
    let elementCount = 0;
    let elementsWithData = 0;
    let totalDataPoints = 0;
    
    Object.entries(topicData).forEach(([elementCode, elementData]) => {
      elementCount++;
      const planetsWithData = Object.values(elementData).filter(planetData => planetData.hasData);
      if (planetsWithData.length > 0) {
        elementsWithData++;
        totalDataPoints += planetsWithData.length;
      }
      console.log(`  ${elementCode}: ${planetsWithData.length} planets with data`);
    });
    
    const hasTopicData = Object.values(topicData).some(elementData => 
      Object.values(elementData).some(planetData => planetData.hasData)
    );
    
    console.log('\n✅ Results:');
    console.log('Elements total:', elementCount);
    console.log('Elements with data:', elementsWithData);
    console.log('Total data points:', totalDataPoints);
    console.log('hasTopicData:', hasTopicData);
  }
} else {
  console.warn('❌ D-3 Set-1 topic not found in planetsData!');
}

// 5. Compare with what the UI thinks
const topicsToDisplay = document.querySelectorAll('[data-topic-name]');
console.log('\n🖥️ Topics being displayed in UI:', topicsToDisplay.length);

let d3Set1Element = null;
topicsToDisplay.forEach(element => {
  const topicName = element.getAttribute('data-topic-name');
  if (topicName && topicName.includes('D-3') && topicName.includes('Set-1')) {
    d3Set1Element = element;
    console.log('🎯 Found D-3 Set-1 UI element:', topicName);
    
    // Check if it shows "No Data in Excel"
    const noDataSpan = element.querySelector('span:contains("🔍 No Data in Excel")');
    const dataAvailableSpan = element.querySelector('[data-label="Data Available"]');
    
    console.log('Shows "No Data in Excel":', !!noDataSpan);
    console.log('Shows "Data Available":', !!dataAvailableSpan);
  }
});

if (!d3Set1Element) {
  console.warn('❌ D-3 Set-1 UI element not found in DOM!');
}

console.log('\n🎯 Debug complete. Check logs above for discrepancies.');
