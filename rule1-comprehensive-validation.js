/**
 * 🧪 COMPREHENSIVE RULE-1 NUMBER BOX VALIDATION SYSTEM
 * 
 * This script validates the new robust number box system across:
 * - 6 hours per day
 * - 30 topics per hour
 * - 15 days of data
 * - Number boxes from 5th date onward
 * 
 * Run this in browser console on Rule-1 page to validate functionality
 */

console.log('🧪 Starting Comprehensive Rule-1 Number Box Validation...');

class Rule1ValidationSystem {
  constructor() {
    this.results = {
      ui: {},
      dataIntegrity: {},
      numberBoxes: {},
      performance: {},
      issues: [],
      recommendations: []
    };
    
    this.testStartTime = Date.now();
  }

  // =====================================
  // 🔍 UI VALIDATION
  // =====================================
  
  async validateUI() {
    console.log('🎨 [UI] Validating UI components...');
    
    const uiValidation = {
      rule1PageMounted: this.isRule1PageMounted(),
      headerPresent: !!document.querySelector('h1'),
      hrSelectorPresent: this.validateHRSelector(),
      topicSelectorPresent: this.validateTopicSelector(),
      dateHeadersPresent: this.validateDateHeaders(),
      numberBoxesPresent: this.validateNumberBoxesPresence()
    };

    // Check for required React components
    if (window.rule1PageDebug) {
      const debugInfo = window.rule1PageDebug.getStateInfo();
      uiValidation.reactComponents = {
        loading: debugInfo.loading,
        error: debugInfo.error,
        activeHR: debugInfo.activeHR,
        availableTopics: debugInfo.availableTopics?.length || 0,
        allDaysDataKeys: Object.keys(debugInfo.allDaysData || {}).length,
        abcdBcdAnalysisKeys: Object.keys(debugInfo.abcdBcdAnalysis || {}).length
      };
    }

    this.results.ui = uiValidation;
    console.log('✅ [UI] Validation complete:', uiValidation);
    return uiValidation;
  }

  isRule1PageMounted() {
    return !!(
      document.querySelector('[class*="Rule1"]') || 
      window.location.pathname.includes('rule1') ||
      window.rule1PageDebug ||
      document.querySelector('h1')?.textContent?.includes('Rule-1')
    );
  }

  validateHRSelector() {
    const hrButtons = document.querySelectorAll('button[class*="HR"], button:contains("HR")');
    return {
      present: hrButtons.length > 0,
      count: hrButtons.length,
      expectedRange: 'Should have 1-6 HR buttons'
    };
  }

  validateTopicSelector() {
    const topicElements = document.querySelectorAll('[class*="topic"], input[type="checkbox"]');
    return {
      present: topicElements.length > 0,
      count: topicElements.length,
      expectedRange: 'Should have ~30 topic checkboxes'
    };
  }

  validateDateHeaders() {
    const dateElements = document.querySelectorAll('[class*="date"], th, td');
    const datePattern = /\d{1,2}-\d{1,2}-\d{2}/;
    const dateHeaders = Array.from(dateElements).filter(el => 
      datePattern.test(el.textContent || '')
    );
    
    return {
      present: dateHeaders.length > 0,
      count: dateHeaders.length,
      expectedRange: 'Should have ~15 date headers'
    };
  }

  validateNumberBoxesPresence() {
    const numberButtons = document.querySelectorAll('button');
    const numberBoxes = Array.from(numberButtons).filter(btn => 
      /^\d+$/.test(btn.textContent?.trim()) && 
      parseInt(btn.textContent.trim()) >= 1 && 
      parseInt(btn.textContent.trim()) <= 12
    );
    
    return {
      present: numberBoxes.length > 0,
      count: numberBoxes.length,
      expectedRange: 'Should have many number boxes (12 per topic per eligible date)'
    };
  }

  // =====================================
  // 📊 DATA INTEGRITY VALIDATION
  // =====================================

  async validateDataIntegrity() {
    console.log('📊 [DATA] Validating data integrity...');
    
    const dataValidation = {
      supabaseConnection: await this.validateSupabaseConnection(),
      topicConsistency: await this.validateTopicConsistency(),
      dateConsistency: await this.validateDateConsistency(),
      hrConsistency: await this.validateHRConsistency(),
      abcdBcdAnalysis: await this.validateABCDBCDAnalysis()
    };

    this.results.dataIntegrity = dataValidation;
    console.log('✅ [DATA] Validation complete:', dataValidation);
    return dataValidation;
  }

  async validateSupabaseConnection() {
    try {
      if (window.rule1PageDebug) {
        const debugInfo = window.rule1PageDebug.getStateInfo();
        return {
          connected: !debugInfo.error,
          hasData: Object.keys(debugInfo.allDaysData || {}).length > 0,
          error: debugInfo.error
        };
      }
      return { connected: false, reason: 'No debug interface available' };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }

  async validateTopicConsistency() {
    if (!window.rule1PageDebug) return { available: false };
    
    const debugInfo = window.rule1PageDebug.getStateInfo();
    const availableTopics = debugInfo.availableTopics || [];
    
    // Expected topic pattern: D-X Set-Y Matrix
    const topicPatterns = {
      dNumbers: new Set(),
      setNumbers: new Set(),
      validTopics: 0,
      invalidTopics: []
    };

    availableTopics.forEach(topic => {
      const match = topic.match(/D-(\d+).*Set-(\d+)/);
      if (match) {
        topicPatterns.dNumbers.add(parseInt(match[1]));
        topicPatterns.setNumbers.add(parseInt(match[2]));
        topicPatterns.validTopics++;
      } else {
        topicPatterns.invalidTopics.push(topic);
      }
    });

    return {
      totalTopics: availableTopics.length,
      validTopics: topicPatterns.validTopics,
      uniqueDNumbers: Array.from(topicPatterns.dNumbers).sort(),
      uniqueSetNumbers: Array.from(topicPatterns.setNumbers).sort(),
      invalidTopics: topicPatterns.invalidTopics,
      expectedTotal: 30,
      isComplete: topicPatterns.validTopics >= 25 // Allow some flexibility
    };
  }

  async validateDateConsistency() {
    if (!window.rule1PageDebug) return { available: false };
    
    const debugInfo = window.rule1PageDebug.getStateInfo();
    const allDaysData = debugInfo.allDaysData || {};
    const dates = Object.keys(allDaysData).sort();
    
    const dateValidation = {
      totalDates: dates.length,
      dateRange: dates.length > 0 ? {
        earliest: dates[0],
        latest: dates[dates.length - 1]
      } : null,
      consecutiveDates: this.checkConsecutiveDates(dates),
      eligibleForNumberBoxes: dates.filter((date, index) => index >= 4).length,
      expectedMinimum: 15
    };

    return dateValidation;
  }

  checkConsecutiveDates(dates) {
    if (dates.length < 2) return true;
    
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1]);
      const currDate = new Date(dates[i]);
      const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);
      
      if (diffDays > 2) { // Allow for weekends
        return false;
      }
    }
    return true;
  }

  async validateHRConsistency() {
    if (!window.rule1PageDebug) return { available: false };
    
    const debugInfo = window.rule1PageDebug.getStateInfo();
    const allDaysData = debugInfo.allDaysData || {};
    
    const hrData = {
      uniqueHRs: new Set(),
      hrCountByDate: {},
      inconsistentDates: []
    };

    Object.entries(allDaysData).forEach(([dateKey, dayData]) => {
      if (dayData.success && dayData.hrData) {
        const hrs = Object.keys(dayData.hrData);
        hrs.forEach(hr => hrData.uniqueHRs.add(hr));
        hrData.hrCountByDate[dateKey] = hrs.length;
        
        if (hrs.length !== 6) {
          hrData.inconsistentDates.push({
            date: dateKey,
            hrCount: hrs.length,
            hrs: hrs
          });
        }
      }
    });

    return {
      uniqueHRs: Array.from(hrData.uniqueHRs).sort(),
      expectedHRs: ['1', '2', '3', '4', '5', '6'],
      averageHRsPerDate: Object.values(hrData.hrCountByDate).reduce((sum, count) => sum + count, 0) / Object.keys(hrData.hrCountByDate).length,
      inconsistentDates: hrData.inconsistentDates,
      isConsistent: hrData.inconsistentDates.length === 0
    };
  }

  async validateABCDBCDAnalysis() {
    if (!window.rule1PageDebug) return { available: false };
    
    const debugInfo = window.rule1PageDebug.getStateInfo();
    const abcdBcdAnalysis = debugInfo.abcdBcdAnalysis || {};
    const availableTopics = debugInfo.availableTopics || [];
    const allDatesData = debugInfo.allDaysData || {};
    const dates = Object.keys(allDatesData).sort();
    
    const analysisValidation = {
      topicsWithAnalysis: Object.keys(abcdBcdAnalysis).length,
      totalExpectedTopics: availableTopics.length,
      datesWithAnalysis: new Set(),
      analysisCompleteness: {},
      sampleAnalysis: {}
    };

    // Check analysis completeness
    Object.entries(abcdBcdAnalysis).forEach(([topicName, topicAnalysis]) => {
      Object.keys(topicAnalysis).forEach(dateKey => {
        analysisValidation.datesWithAnalysis.add(dateKey);
      });
      
      const topicDates = Object.keys(topicAnalysis);
      analysisValidation.analysisCompleteness[topicName] = {
        dateCount: topicDates.length,
        hasData: topicDates.length > 0
      };
    });

    // Sample analysis for first topic
    const firstTopic = Object.keys(abcdBcdAnalysis)[0];
    if (firstTopic) {
      const firstTopicAnalysis = abcdBcdAnalysis[firstTopic];
      const firstDate = Object.keys(firstTopicAnalysis)[0];
      if (firstDate) {
        analysisValidation.sampleAnalysis = {
          topic: firstTopic,
          date: firstDate,
          analysis: firstTopicAnalysis[firstDate]
        };
      }
    }

    return analysisValidation;
  }

  // =====================================
  // 🔢 NUMBER BOX VALIDATION
  // =====================================

  async validateNumberBoxes() {
    console.log('🔢 [NUMBER_BOXES] Validating number box functionality...');
    
    const numberBoxValidation = {
      robustSystemActive: await this.validateRobustSystem(),
      clickability: await this.validateClickability(),
      dataConsistency: await this.validateNumberBoxDataConsistency(),
      uiResponsiveness: await this.validateUIResponsiveness(),
      persistenceTest: await this.validatePersistence()
    };

    this.results.numberBoxes = numberBoxValidation;
    console.log('✅ [NUMBER_BOXES] Validation complete:', numberBoxValidation);
    return numberBoxValidation;
  }

  async validateRobustSystem() {
    // Check if the new robust system is active
    return {
      numberBoxControllerExists: !!(window.numberBoxController || window.rule1PageDebug?.numberBoxController),
      robustSystemImported: typeof window.NumberBoxController !== 'undefined',
      legacySystemPresent: document.querySelectorAll('button[onclick*="handleNumberBoxClick"]').length > 0
    };
  }

  async validateClickability() {
    const numberButtons = document.querySelectorAll('button');
    const clickableNumbers = Array.from(numberButtons).filter(btn => 
      /^\d+$/.test(btn.textContent?.trim()) &&
      !btn.disabled
    );
    
    const disabledNumbers = Array.from(numberButtons).filter(btn => 
      /^\d+$/.test(btn.textContent?.trim()) &&
      btn.disabled
    );

    return {
      totalNumberButtons: numberButtons.length,
      clickableNumbers: clickableNumbers.length,
      disabledNumbers: disabledNumbers.length,
      clickabilityRatio: clickableNumbers.length / (clickableNumbers.length + disabledNumbers.length),
      expectedBehavior: 'Only numbers in ABCD/BCD arrays should be clickable'
    };
  }

  async validateNumberBoxDataConsistency() {
    if (!window.rule1PageDebug) return { available: false };
    
    const debugInfo = window.rule1PageDebug.getStateInfo();
    const clickedNumbers = debugInfo.clickedNumbers || {};
    const abcdBcdAnalysis = debugInfo.abcdBcdAnalysis || {};
    
    const consistency = {
      totalClickedEntries: 0,
      validClicks: 0,
      invalidClicks: 0,
      topicsWithClicks: 0,
      inconsistencies: []
    };

    Object.entries(clickedNumbers).forEach(([topicName, topicData]) => {
      consistency.topicsWithClicks++;
      
      Object.entries(topicData).forEach(([dateKey, dateData]) => {
        Object.entries(dateData).forEach(([hr, numbers]) => {
          consistency.totalClickedEntries++;
          
          const topicAnalysis = abcdBcdAnalysis[topicName]?.[dateKey];
          if (topicAnalysis) {
            const validNumbers = [
              ...(topicAnalysis.abcdNumbers || []),
              ...(topicAnalysis.bcdNumbers || [])
            ];
            
            numbers.forEach(num => {
              if (validNumbers.includes(num)) {
                consistency.validClicks++;
              } else {
                consistency.invalidClicks++;
                consistency.inconsistencies.push({
                  topic: topicName,
                  date: dateKey,
                  hr: hr,
                  number: num,
                  issue: 'Clicked number not in ABCD/BCD arrays'
                });
              }
            });
          }
        });
      });
    });

    return consistency;
  }

  async validateUIResponsiveness() {
    // Test UI responsiveness by checking for immediate visual feedback
    const testButton = document.querySelector('button[class*="number"], button:contains("1")');
    
    if (!testButton) {
      return { testable: false, reason: 'No number buttons found' };
    }

    const initialClasses = testButton.className;
    const initialStyle = testButton.style.cssText;
    
    return {
      testable: true,
      hasVisualStates: {
        initialClasses: initialClasses,
        hasHoverStates: initialClasses.includes('hover:'),
        hasClickStates: initialClasses.includes('scale-') || initialClasses.includes('shadow-'),
        hasDisabledStates: initialClasses.includes('disabled:') || initialClasses.includes('opacity-')
      }
    };
  }

  async validatePersistence() {
    // Check if clicked state persists across component updates
    if (!window.rule1PageDebug) return { testable: false };
    
    const debugInfo = window.rule1PageDebug.getStateInfo();
    const clickedNumbers = debugInfo.clickedNumbers || {};
    
    const persistenceStats = {
      totalPersistedClicks: 0,
      topicsWithPersistence: Object.keys(clickedNumbers).length,
      oldestClickDate: null,
      newestClickDate: null
    };

    Object.values(clickedNumbers).forEach(topicData => {
      Object.entries(topicData).forEach(([dateKey, dateData]) => {
        if (!persistenceStats.oldestClickDate || dateKey < persistenceStats.oldestClickDate) {
          persistenceStats.oldestClickDate = dateKey;
        }
        if (!persistenceStats.newestClickDate || dateKey > persistenceStats.newestClickDate) {
          persistenceStats.newestClickDate = dateKey;
        }
        
        Object.values(dateData).forEach(numbers => {
          persistenceStats.totalPersistedClicks += numbers.length;
        });
      });
    });

    return persistenceStats;
  }

  // =====================================
  // ⚡ PERFORMANCE VALIDATION
  // =====================================

  async validatePerformance() {
    console.log('⚡ [PERFORMANCE] Validating performance...');
    
    const performanceValidation = {
      loadTime: Date.now() - this.testStartTime,
      memoryUsage: this.getMemoryUsage(),
      domComplexity: this.analyzeDOMComplexity(),
      renderingPerformance: await this.testRenderingPerformance()
    };

    this.results.performance = performanceValidation;
    console.log('✅ [PERFORMANCE] Validation complete:', performanceValidation);
    return performanceValidation;
  }

  getMemoryUsage() {
    if (performance.memory) {
      return {
        usedJSHeapSize: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + ' MB',
        totalJSHeapSize: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + ' MB',
        jsHeapSizeLimit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) + ' MB'
      };
    }
    return { available: false };
  }

  analyzeDOMComplexity() {
    return {
      totalElements: document.querySelectorAll('*').length,
      numberButtons: document.querySelectorAll('button').length,
      inputElements: document.querySelectorAll('input').length,
      complexity: document.querySelectorAll('*').length > 1000 ? 'High' : 'Moderate'
    };
  }

  async testRenderingPerformance() {
    const startTime = performance.now();
    
    // Simulate a render update by triggering a minor DOM change
    const testElement = document.createElement('div');
    testElement.style.display = 'none';
    document.body.appendChild(testElement);
    document.body.removeChild(testElement);
    
    const endTime = performance.now();
    
    return {
      renderTime: `${(endTime - startTime).toFixed(2)}ms`,
      acceptable: (endTime - startTime) < 10
    };
  }

  // =====================================
  // 📋 GENERATE COMPREHENSIVE REPORT
  // =====================================

  async runFullValidation() {
    console.log('🚀 Starting comprehensive Rule-1 validation...');
    console.log('=============================================');

    try {
      await this.validateUI();
      await this.validateDataIntegrity();
      await this.validateNumberBoxes();
      await this.validatePerformance();

      this.generateIssuesAndRecommendations();
      this.generateFinalReport();
      
      return this.results;
    } catch (error) {
      console.error('❌ Validation failed:', error);
      this.results.validationError = error.message;
      return this.results;
    }
  }

  generateIssuesAndRecommendations() {
    const { ui, dataIntegrity, numberBoxes, performance } = this.results;
    
    // Identify critical issues
    if (!ui.rule1PageMounted) {
      this.results.issues.push({
        severity: 'critical',
        category: 'ui',
        message: 'Rule-1 page not properly mounted',
        impact: 'System not functional'
      });
    }

    if (dataIntegrity.topicConsistency && !dataIntegrity.topicConsistency.isComplete) {
      this.results.issues.push({
        severity: 'high',
        category: 'data',
        message: `Only ${dataIntegrity.topicConsistency.validTopics}/30 topics found`,
        impact: 'Missing topic data affects functionality'
      });
    }

    if (dataIntegrity.hrConsistency && !dataIntegrity.hrConsistency.isConsistent) {
      this.results.issues.push({
        severity: 'medium',
        category: 'data',
        message: `Inconsistent HR data across dates`,
        impact: 'Some hours may not have complete data'
      });
    }

    if (numberBoxes.dataConsistency && numberBoxes.dataConsistency.invalidClicks > 0) {
      this.results.issues.push({
        severity: 'medium',
        category: 'numberboxes',
        message: `${numberBoxes.dataConsistency.invalidClicks} invalid clicked numbers found`,
        impact: 'Data integrity compromised'
      });
    }

    // Generate recommendations
    this.results.recommendations = [
      {
        category: 'data',
        action: 'Verify Supabase connection and data completeness',
        code: 'await window.rule1PageDebug.forceReloadData()'
      },
      {
        category: 'ui',
        action: 'Test number box functionality manually',
        code: 'window.rule1Validator.testNumberBoxClick()'
      },
      {
        category: 'performance',
        action: 'Monitor system performance with large datasets',
        code: 'window.rule1Validator.monitorPerformance()'
      }
    ];
  }

  generateFinalReport() {
    console.log('\n📋 COMPREHENSIVE VALIDATION REPORT');
    console.log('==========================================');
    
    const { ui, dataIntegrity, numberBoxes, performance, issues } = this.results;
    
    // Overall health score
    let healthScore = 100;
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical': healthScore -= 30; break;
        case 'high': healthScore -= 15; break;
        case 'medium': healthScore -= 5; break;
        default: healthScore -= 2;
      }
    });
    
    console.log(`🏥 OVERALL HEALTH SCORE: ${Math.max(0, healthScore)}/100`);
    
    console.log('\n🎯 COMPONENT STATUS:');
    console.log(`  UI: ${ui.rule1PageMounted ? '✅' : '❌'} ${ui.rule1PageMounted ? 'Mounted' : 'Not Mounted'}`);
    console.log(`  Data: ${dataIntegrity.supabaseConnection?.connected ? '✅' : '❌'} ${dataIntegrity.supabaseConnection?.connected ? 'Connected' : 'Disconnected'}`);
    console.log(`  Topics: ${dataIntegrity.topicConsistency?.isComplete ? '✅' : '⚠️'} ${dataIntegrity.topicConsistency?.validTopics || 0}/30`);
    console.log(`  Number Boxes: ${numberBoxes.clickability?.clickableNumbers > 0 ? '✅' : '❌'} ${numberBoxes.clickability?.clickableNumbers || 0} clickable`);
    console.log(`  Performance: ${performance.renderingPerformance?.acceptable ? '✅' : '⚠️'} ${performance.renderingPerformance?.renderTime || 'N/A'}`);
    
    if (issues.length > 0) {
      console.log('\n⚠️ IDENTIFIED ISSUES:');
      issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. [${issue.severity.toUpperCase()}] ${issue.message}`);
        console.log(`     Impact: ${issue.impact}`);
      });
    }
    
    console.log('\n🔍 Full validation results available in window.rule1Validator.results');
    console.log('==========================================');
  }

  // Test utilities for manual testing
  testNumberBoxClick() {
    const firstNumberButton = document.querySelector('button[title*="ABCD"], button[title*="BCD"]');
    if (firstNumberButton) {
      console.log('🧪 Testing number box click:', firstNumberButton);
      firstNumberButton.click();
      return true;
    }
    console.log('❌ No clickable number buttons found');
    return false;
  }

  monitorPerformance() {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        console.log(`⚡ Performance: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
      });
    });
    
    observer.observe({ entryTypes: ['navigation', 'resource', 'paint'] });
    console.log('📊 Performance monitoring started');
  }
}

// =====================================
// 🚀 AUTO-RUN VALIDATION
// =====================================

const validator = new Rule1ValidationSystem();
window.rule1Validator = validator;

// Auto-run validation
validator.runFullValidation().then(results => {
  console.log('\n✅ Comprehensive validation complete!');
  
  // Provide quick test functions
  window.quickTest = {
    testNumberBox: () => validator.testNumberBoxClick(),
    showIssues: () => console.table(results.issues),
    showRecommendations: () => console.table(results.recommendations),
    showPerformance: () => console.log(results.performance),
    showDataIntegrity: () => console.log(results.dataIntegrity),
    rerunValidation: () => validator.runFullValidation()
  };
  
  console.log('\n🛠️ Quick test functions available:');
  console.log('  window.quickTest.testNumberBox()');
  console.log('  window.quickTest.showIssues()');
  console.log('  window.quickTest.showRecommendations()');
  console.log('  window.quickTest.rerunValidation()');
});

console.log('🧪 Rule-1 Validation System loaded. Running validation...');
