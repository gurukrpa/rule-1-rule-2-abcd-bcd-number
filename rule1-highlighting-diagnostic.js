// Comprehensive Rule-1 Page Number Box Highlighting Diagnostic Script
// This script diagnoses why clicked numbers are showing but not highlighting for specific topics

window.rule1HighlightingDiagnostic = {
  
  // Get current component state
  getCurrentState() {
    const app = document.querySelector('#root').__reactInternalInstance$?.return?.stateNode ||
                document.querySelector('#root')._reactInternalFiber?.return?.stateNode ||
                document.querySelector('#root')._reactInternalInstance?.child?.stateNode;
    
    if (!app) {
      console.error('❌ Could not find React app instance');
      return null;
    }
    
    return app.state || app;
  },

  // Comprehensive highlighting diagnosis for a specific topic
  diagnoseTopicHighlighting(topicName, dateKey) {
    console.log(`🔍 HIGHLIGHTING DIAGNOSTIC FOR ${topicName} on ${dateKey}`);
    console.log('='.repeat(80));
    
    const state = this.getCurrentState();
    if (!state) return;

    const { clickedNumbers, abcdBcdAnalysis, activeHR } = state;
    
    console.log(`📊 Current Active HR: ${activeHR}`);
    console.log(`📅 Analyzing Date: ${dateKey}`);
    console.log(`🎯 Topic: ${topicName}`);
    
    // Check clicked numbers for this topic/date/HR
    const userClickedNumbers = clickedNumbers[topicName]?.[dateKey]?.[`HR${activeHR}`] || [];
    console.log(`👆 User Clicked Numbers for HR${activeHR}:`, userClickedNumbers);
    
    // Check ABCD/BCD analysis for this topic/date
    const analysisData = abcdBcdAnalysis[topicName]?.[dateKey];
    console.log(`🧮 ABCD/BCD Analysis Data:`, analysisData);
    
    if (!analysisData) {
      console.warn(`⚠️ NO ABCD/BCD ANALYSIS DATA found for ${topicName} on ${dateKey}`);
      console.log('This could be why numbers are not highlighting!');
      return;
    }
    
    const { abcdNumbers = [], bcdNumbers = [] } = analysisData;
    console.log(`🔢 ABCD Numbers:`, abcdNumbers);
    console.log(`🔢 BCD Numbers:`, bcdNumbers);
    
    // Check each clicked number
    console.log(`\n🔍 DETAILED ANALYSIS OF EACH CLICKED NUMBER:`);
    userClickedNumbers.forEach(clickedNum => {
      const isInAbcd = abcdNumbers.includes(clickedNum);
      const isInBcd = bcdNumbers.includes(clickedNum);
      const shouldHighlight = isInAbcd || isInBcd;
      
      console.log(`  Number ${clickedNum}:`);
      console.log(`    • Clicked by user: ✅`);
      console.log(`    • In ABCD array: ${isInAbcd ? '✅' : '❌'}`);
      console.log(`    • In BCD array: ${isInBcd ? '✅' : '❌'}`);
      console.log(`    • Should highlight: ${shouldHighlight ? '✅' : '❌'}`);
      
      if (!shouldHighlight) {
        console.warn(`    ⚠️ This number WON'T highlight because it's not in current ABCD/BCD analysis!`);
      }
    });
    
    return {
      topicName,
      dateKey,
      activeHR,
      userClickedNumbers,
      abcdNumbers,
      bcdNumbers,
      hasAnalysisData: !!analysisData
    };
  },

  // Diagnose all topics for a specific date
  diagnoseAllTopicsForDate(dateKey) {
    console.log(`🌍 DIAGNOSING ALL TOPICS FOR DATE: ${dateKey}`);
    console.log('='.repeat(80));
    
    const state = this.getCurrentState();
    if (!state) return;

    const { availableTopics, clickedNumbers, abcdBcdAnalysis, activeHR } = state;
    
    const results = [];
    
    availableTopics.forEach(topicName => {
      const userClickedNumbers = clickedNumbers[topicName]?.[dateKey]?.[`HR${activeHR}`] || [];
      const hasClicks = userClickedNumbers.length > 0;
      const hasAnalysis = !!abcdBcdAnalysis[topicName]?.[dateKey];
      
      if (hasClicks) {
        console.log(`\n📊 ${topicName}:`);
        console.log(`  • Has clicked numbers: ✅ (${userClickedNumbers.length})`);
        console.log(`  • Has ABCD/BCD analysis: ${hasAnalysis ? '✅' : '❌'}`);
        
        if (!hasAnalysis) {
          console.warn(`  ⚠️ ISSUE: Clicked numbers exist but no analysis data!`);
        }
        
        results.push({
          topicName,
          hasClicks,
          hasAnalysis,
          clickedCount: userClickedNumbers.length,
          issue: hasClicks && !hasAnalysis
        });
      }
    });
    
    const issueTopics = results.filter(r => r.issue);
    if (issueTopics.length > 0) {
      console.log(`\n🚨 FOUND ${issueTopics.length} TOPICS WITH HIGHLIGHTING ISSUES:`);
      issueTopics.forEach(topic => {
        console.log(`  • ${topic.topicName} - ${topic.clickedCount} clicked numbers but no analysis data`);
      });
    }
    
    return results;
  },

  // Check if ABCD/BCD analysis is missing for specific topics
  checkMissingAnalysis() {
    console.log(`🔍 CHECKING FOR MISSING ABCD/BCD ANALYSIS DATA`);
    console.log('='.repeat(80));
    
    const state = this.getCurrentState();
    if (!state) return;

    const { availableTopics, abcdBcdAnalysis, allDaysData } = state;
    
    const availableDates = Object.keys(allDaysData).sort((a, b) => new Date(a) - new Date(b));
    const analysisableDates = availableDates.slice(4); // Dates from 5th onward
    
    console.log(`📅 Available dates for analysis:`, analysisableDates);
    console.log(`🎯 Total topics:`, availableTopics.length);
    
    const missingAnalysis = [];
    
    availableTopics.forEach(topicName => {
      analysisableDates.forEach(dateKey => {
        const hasAnalysis = !!abcdBcdAnalysis[topicName]?.[dateKey];
        if (!hasAnalysis) {
          missingAnalysis.push({ topicName, dateKey });
        }
      });
    });
    
    if (missingAnalysis.length > 0) {
      console.log(`\n🚨 MISSING ANALYSIS DATA FOR ${missingAnalysis.length} TOPIC-DATE COMBINATIONS:`);
      missingAnalysis.forEach(({ topicName, dateKey }) => {
        console.log(`  • ${topicName} on ${dateKey}`);
      });
    } else {
      console.log(`✅ All topics have analysis data for all analysable dates`);
    }
    
    return missingAnalysis;
  },

  // Check loadClickedNumbers function execution
  checkClickedNumbersLoading() {
    console.log(`🔍 CHECKING CLICKED NUMBERS LOADING STATUS`);
    console.log('='.repeat(80));
    
    const state = this.getCurrentState();
    if (!state) return;

    const { clickedNumbers, selectedUser, activeHR, numberBoxLoading } = state;
    
    console.log(`👤 Selected User: ${selectedUser}`);
    console.log(`⏰ Active HR: ${activeHR}`);
    console.log(`⏳ Number Box Loading: ${numberBoxLoading}`);
    console.log(`📊 Clicked Numbers State:`, clickedNumbers);
    
    const totalClicks = Object.values(clickedNumbers).reduce((total, topicData) => {
      return total + Object.values(topicData).reduce((topicTotal, dateData) => {
        return topicTotal + Object.values(dateData).reduce((dateTotal, hourData) => {
          return dateTotal + hourData.length;
        }, 0);
      }, 0);
    }, 0);
    
    console.log(`📈 Total clicked numbers loaded: ${totalClicks}`);
    
    if (totalClicks === 0) {
      console.warn(`⚠️ NO CLICKED NUMBERS LOADED - This could indicate:`);
      console.log(`  • Database has no clicks for user ${selectedUser}`);
      console.log(`  • Database connection issue`);
      console.log(`  • loadClickedNumbers() function not called or failed`);
    }
    
    return {
      selectedUser,
      activeHR,
      numberBoxLoading,
      totalClicks,
      clickedNumbers
    };
  },

  // Full comprehensive diagnostic
  runFullDiagnostic() {
    console.log(`🚀 RUNNING FULL RULE-1 HIGHLIGHTING DIAGNOSTIC`);
    console.log('='.repeat(80));
    
    const state = this.getCurrentState();
    if (!state) return;

    const { date, availableTopics } = state;
    
    console.log(`🎯 Current Display Date: ${date}`);
    console.log(`📊 Available Topics: ${availableTopics.length}`);
    
    // 1. Check clicked numbers loading
    console.log(`\n1️⃣ CHECKING CLICKED NUMBERS LOADING`);
    const loadingStatus = this.checkClickedNumbersLoading();
    
    // 2. Check missing analysis
    console.log(`\n2️⃣ CHECKING FOR MISSING ANALYSIS DATA`);
    const missingAnalysis = this.checkMissingAnalysis();
    
    // 3. Diagnose current date
    console.log(`\n3️⃣ DIAGNOSING CURRENT DATE: ${date}`);
    const currentDateResults = this.diagnoseAllTopicsForDate(date);
    
    // 4. Summary
    console.log(`\n📋 DIAGNOSTIC SUMMARY`);
    console.log('='.repeat(40));
    console.log(`• Total clicked numbers: ${loadingStatus.totalClicks}`);
    console.log(`• Missing analysis combinations: ${missingAnalysis.length}`);
    console.log(`• Topics with highlighting issues on current date: ${currentDateResults.filter(r => r.issue).length}`);
    
    if (missingAnalysis.length > 0) {
      console.log(`\n🔧 RECOMMENDED ACTIONS:`);
      console.log(`1. Check if Rule-2 analysis is running properly`);
      console.log(`2. Verify abcdBcdAnalysis state is being populated`);
      console.log(`3. Check loadRule2AnalysisResults() function`);
    }
    
    return {
      loadingStatus,
      missingAnalysis,
      currentDateResults
    };
  },

  // Quick helper to test specific problematic topic
  testTopic(topicName, dateKey = null) {
    const state = this.getCurrentState();
    if (!state) return;
    
    const testDate = dateKey || state.date;
    console.log(`🧪 TESTING TOPIC: ${topicName} on ${testDate}`);
    
    return this.diagnoseTopicHighlighting(topicName, testDate);
  }
};

// Auto-run basic diagnostic when script loads
console.log('🔧 Rule-1 Highlighting Diagnostic Script Loaded');
console.log('Run: window.rule1HighlightingDiagnostic.runFullDiagnostic()');
console.log('Or test specific topic: window.rule1HighlightingDiagnostic.testTopic("D-1 Set-1 Matrix")');
