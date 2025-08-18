// CRITICAL FIX: Matrix Highlighting Issue Resolution
// Issue: Rule-1 clicks 8,10 but matrix highlights 5,12,9

import { replace_string_in_file } from './path/to/editor';

console.log('🔧 FIXING: Matrix Highlighting Issue');
console.log('Problem: Rule-1 clicks [8, 10] but matrix shows [5, 12, 9] highlighted');

// ISSUE IDENTIFIED: Multiple possible causes
const issues = [
  {
    issue: 'Local click state interference',
    description: 'PlanetsAnalysis page has local clicking that overrides sync data',
    fix: 'Prioritize sync data over local clicks'
  },
  {
    issue: 'Wrong data in shouldHighlightPlanetCell',
    description: 'Logic checks local clicks before sync data',
    fix: 'Reverse priority: sync data first, then local clicks'
  },
  {
    issue: 'Date/hour mismatch',
    description: 'Sync data not matching current date/hour selection',
    fix: 'Better date/hour normalization'
  },
  {
    issue: 'Multiple records confusion',
    description: 'Multiple hours or topics mixing data',
    fix: 'Strict filtering by exact date/hour/topic'
  }
];

console.log('🎯 IDENTIFIED ISSUES:');
issues.forEach((issue, i) => {
  console.log(`${i + 1}. ${issue.issue}`);
  console.log(`   Problem: ${issue.description}`);
  console.log(`   Fix: ${issue.fix}`);
});

// PRIMARY FIX: Update shouldHighlightPlanetCell function
const fixShouldHighlightPlanetCell = `
  // Check if a planet cell should be highlighted (if its number is clicked)
  const shouldHighlightPlanetCell = (topicName, rawData) => {
    if (!rawData) return { highlighted: false };
    const number = extractElementNumber(rawData);
    if (!number) return { highlighted: false };
    
    console.log(\`🔍 [shouldHighlightPlanetCell] Checking: \${topicName} - \${rawData} → number \${number}\`);
    
    // ✅ FIXED: Check synced data from Rule-1 FIRST (higher priority)
    let isSyncedFromRule1 = false;
    let syncSource = null; // 'clicked' or 'analysis'
    
    if (syncEnabled && rule1SyncData && selectedDate) {
      // Rule1SyncData is organized by date, then topic
      const dateData = rule1SyncData[selectedDate];
      console.log(\`🔍 [Sync Check] Date data for \${selectedDate}:\`, dateData);
      
      if (dateData && dateData[topicName]) {
        const syncData = dateData[topicName];
        console.log(\`🔍 [Sync Check] Topic data for \${topicName}:\`, syncData);
        
        // Check if this number was clicked in Rule-1
        if (syncData.clickedNumbers && syncData.clickedNumbers.includes(number)) {
          isSyncedFromRule1 = true;
          syncSource = 'clicked';
          console.log(\`✅ [Sync Found] Number \${number} found in clicked numbers from Rule-1\`);
        }
        
        // Also check if this number is in the ABCD/BCD results from Rule-1
        if (syncData.abcdNumbers && syncData.abcdNumbers.includes(number)) {
          isSyncedFromRule1 = true;
          syncSource = 'analysis';
          console.log(\`✅ [Sync Found] Number \${number} found in ABCD analysis from Rule-1\`);
        }
        if (syncData.bcdNumbers && syncData.bcdNumbers.includes(number)) {
          isSyncedFromRule1 = true;
          syncSource = 'analysis';
          console.log(\`✅ [Sync Found] Number \${number} found in BCD analysis from Rule-1\`);
        }
      } else {
        console.log(\`❌ [Sync Check] No data found for \${selectedDate}/\${topicName}\`);
      }
    }
    
    // Return synced data highlighting (highest priority)
    if (isSyncedFromRule1) {
      const { abcd, bcd } = getTopicNumbersWithNormalization(topicName);
      const isAbcd = abcd.includes(number);
      const isBcd = bcd.includes(number);
      
      console.log(\`🎯 [Highlight] SYNCED: \${number} for \${topicName} - type: \${isAbcd ? 'ABCD' : isBcd ? 'BCD' : 'unknown'}\`);
      
      return { 
        highlighted: true, 
        type: isAbcd ? 'ABCD' : isBcd ? 'BCD' : 'unknown',
        source: 'rule1-sync',
        syncSource: syncSource // 'clicked' or 'analysis' for synced numbers
      };
    }
    
    // ✅ SECOND PRIORITY: Check local clicks (only if no sync data)
    if (localClickedNumbers[topicName] && localClickedNumbers[topicName].includes(number)) {
      console.log(\`🎯 [Highlight] LOCAL: \${number} for \${topicName}\`);
      const { abcd, bcd } = getTopicNumbersWithNormalization(topicName);
      const isAbcd = abcd.includes(number);
      const isBcd = bcd.includes(number);
      
      return { 
        highlighted: true, 
        type: isAbcd ? 'ABCD' : isBcd ? 'BCD' : 'unknown',
        source: 'local-click',
        syncSource: 'local'
      };
    }
    
    // No highlighting
    console.log(\`❌ [No Highlight] \${number} for \${topicName}\`);
    return { highlighted: false };
  };`;

console.log('✅ READY TO APPLY FIX');
console.log('This fix will:');
console.log('1. Prioritize Rule-1 sync data over local clicks');
console.log('2. Add detailed logging to track the highlighting logic');
console.log('3. Ensure correct data flow from Rule-1 to matrix highlighting');

export { fixShouldHighlightPlanetCell };
