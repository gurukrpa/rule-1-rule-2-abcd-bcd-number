// Set-1 Hour 1 Data Extractor for All Topics
// This script extracts and displays data for all Set-1 topics in Hour 1

window.set1Hour1DataExtractor = {
  
  // Get React component state
  getComponentState() {
    const root = document.querySelector('#root');
    const reactFiber = Object.keys(root).find(key => 
      key.startsWith('__reactInternalInstance') || 
      key.startsWith('__reactFiber')
    );
    
    if (reactFiber && root[reactFiber]) {
      let fiber = root[reactFiber];
      while (fiber && !fiber.stateNode?.state) {
        fiber = fiber.child || fiber.sibling;
      }
      return fiber?.stateNode?.state || null;
    }
    return null;
  },

  // Extract all Set-1 topics
  getSet1Topics() {
    const state = this.getComponentState();
    if (!state || !state.availableTopics) return [];
    
    return state.availableTopics.filter(topic => 
      topic.includes('Set-1') || topic.includes('Set 1')
    );
  },

  // Get data for specific topic, date, and hour
  getTopicData(topicName, dateKey, hour = 1) {
    const state = this.getComponentState();
    if (!state) return null;

    const { allDaysData, clickedNumbers, abcdBcdAnalysis } = state;
    
    // Excel/Raw data
    const dayData = allDaysData[dateKey];
    const hrData = dayData?.hrData?.[`HR${hour}`];
    const topicRawData = hrData?.sets?.[topicName];
    
    // Clicked numbers
    const userClicks = clickedNumbers[topicName]?.[dateKey]?.[`HR${hour}`] || [];
    
    // ABCD/BCD analysis
    const analysis = abcdBcdAnalysis[topicName]?.[dateKey];
    const abcdNumbers = analysis?.abcdNumbers || [];
    const bcdNumbers = analysis?.bcdNumbers || [];
    
    return {
      topicName,
      dateKey,
      hour: `HR${hour}`,
      rawData: topicRawData,
      userClicks,
      abcdNumbers,
      bcdNumbers,
      hasRawData: !!topicRawData,
      hasAnalysis: !!analysis,
      totalClickableNumbers: [...abcdNumbers, ...bcdNumbers].length,
      userClickedCount: userClicks.length
    };
  },

  // Extract all Set-1 data for Hour 1
  extractAllSet1Hour1Data(targetDate = null) {
    console.log('🔍 EXTRACTING ALL SET-1 HOUR 1 DATA');
    console.log('='.repeat(50));
    
    const state = this.getComponentState();
    if (!state) {
      console.error('❌ Could not access component state');
      return null;
    }

    const { date, allDaysData } = state;
    const dateToUse = targetDate || date;
    const set1Topics = this.getSet1Topics();
    
    console.log(`📅 Target Date: ${dateToUse}`);
    console.log(`🎯 Found ${set1Topics.length} Set-1 topics:`, set1Topics);
    
    const results = {};
    
    set1Topics.forEach(topicName => {
      const data = this.getTopicData(topicName, dateToUse, 1);
      results[topicName] = data;
      
      console.log(`\n📊 ${topicName}:`);
      console.log(`  • Has Raw Data: ${data.hasRawData ? '✅' : '❌'}`);
      console.log(`  • Has Analysis: ${data.hasAnalysis ? '✅' : '❌'}`);
      console.log(`  • ABCD Numbers: [${data.abcdNumbers.join(', ')}]`);
      console.log(`  • BCD Numbers: [${data.bcdNumbers.join(', ')}]`);
      console.log(`  • User Clicked: [${data.userClicks.join(', ')}]`);
      console.log(`  • Clickable Count: ${data.totalClickableNumbers}`);
      console.log(`  • User Clicked Count: ${data.userClickedCount}`);
      
      if (data.hasRawData && data.rawData) {
        const elements = Object.keys(data.rawData);
        console.log(`  • Raw Data Elements: ${elements.length} (${elements.join(', ')})`);
      }
    });
    
    return results;
  },

  // Get detailed matrix data for Set-1 topics
  extractSet1MatrixData(targetDate = null) {
    console.log('🔍 EXTRACTING SET-1 MATRIX DATA FOR HOUR 1');
    console.log('='.repeat(50));
    
    const state = this.getComponentState();
    if (!state) return null;

    const { date, allDaysData } = state;
    const dateToUse = targetDate || date;
    const set1Topics = this.getSet1Topics();
    
    const matrixData = {};
    
    set1Topics.forEach(topicName => {
      const dayData = allDaysData[dateToUse];
      const hrData = dayData?.hrData?.['HR1'];
      const topicData = hrData?.sets?.[topicName];
      
      if (topicData) {
        matrixData[topicName] = {};
        
        // Extract all elements (like SUN, MON, TUE, etc.)
        for (const elementName in topicData) {
          const elementData = topicData[elementName];
          matrixData[topicName][elementName] = {
            hasData: elementData.hasData,
            rawData: elementData.rawData,
            compactData: this.extractCompactFormat(elementData.rawData)
          };
        }
        
        console.log(`\n🗂️ ${topicName} Matrix Elements:`);
        Object.keys(matrixData[topicName]).forEach(element => {
          const elem = matrixData[topicName][element];
          console.log(`  • ${element}: ${elem.hasData ? '✅' : '❌'} | Raw: "${elem.rawData}" | Compact: "${elem.compactData}"`);
        });
      }
    });
    
    return matrixData;
  },

  // Helper function to extract compact format
  extractCompactFormat(rawData) {
    if (!rawData || rawData === '—') return '—';
    
    // Extract numbers from the raw data
    const numbers = rawData.match(/\d+/g);
    return numbers ? numbers.join(' ') : rawData;
  },

  // Export data as JSON for further analysis
  exportSet1Hour1Data(targetDate = null) {
    const data = this.extractAllSet1Hour1Data(targetDate);
    const matrixData = this.extractSet1MatrixData(targetDate);
    
    const exportData = {
      timestamp: new Date().toISOString(),
      date: targetDate || this.getComponentState()?.date,
      hour: 'HR1',
      set1Analysis: data,
      set1MatrixData: matrixData,
      summary: {
        totalSet1Topics: Object.keys(data || {}).length,
        topicsWithAnalysis: Object.values(data || {}).filter(t => t.hasAnalysis).length,
        topicsWithRawData: Object.values(data || {}).filter(t => t.hasRawData).length,
        totalClickableNumbers: Object.values(data || {}).reduce((sum, t) => sum + t.totalClickableNumbers, 0),
        totalUserClicks: Object.values(data || {}).reduce((sum, t) => sum + t.userClickedCount, 0)
      }
    };
    
    console.log('\n📋 EXPORT SUMMARY:');
    console.log(JSON.stringify(exportData.summary, null, 2));
    
    // Store in window for easy access
    window.set1Hour1ExportData = exportData;
    
    console.log('\n💾 Data exported to: window.set1Hour1ExportData');
    console.log('📂 Use JSON.stringify(window.set1Hour1ExportData, null, 2) to view formatted');
    
    return exportData;
  },

  // Quick summary
  quickSummary(targetDate = null) {
    console.log('📊 QUICK SET-1 HOUR 1 SUMMARY');
    console.log('='.repeat(30));
    
    const data = this.extractAllSet1Hour1Data(targetDate);
    if (!data) return;
    
    const topics = Object.keys(data);
    const withAnalysis = topics.filter(t => data[t].hasAnalysis);
    const withRawData = topics.filter(t => data[t].hasRawData);
    const withClicks = topics.filter(t => data[t].userClickedCount > 0);
    
    console.log(`🎯 Total Set-1 Topics: ${topics.length}`);
    console.log(`🧮 With Analysis: ${withAnalysis.length}`);
    console.log(`📊 With Raw Data: ${withRawData.length}`);
    console.log(`👆 With User Clicks: ${withClicks.length}`);
    
    if (withClicks.length > 0) {
      console.log('\n👆 Topics with clicks:');
      withClicks.forEach(topic => {
        console.log(`  • ${topic}: ${data[topic].userClickedCount} clicks`);
      });
    }
    
    return {
      totalTopics: topics.length,
      withAnalysis: withAnalysis.length,
      withRawData: withRawData.length,
      withClicks: withClicks.length,
      topicsWithClicks: withClicks
    };
  }
};

// Auto-run quick summary when script loads
console.log('🔧 Set-1 Hour 1 Data Extractor Loaded');
console.log('📋 Quick commands:');
console.log('  • window.set1Hour1DataExtractor.quickSummary()');
console.log('  • window.set1Hour1DataExtractor.extractAllSet1Hour1Data()');
console.log('  • window.set1Hour1DataExtractor.exportSet1Hour1Data()');

// Run quick summary automatically
setTimeout(() => {
  if (document.querySelector('#root')) {
    window.set1Hour1DataExtractor.quickSummary();
  }
}, 1000);
