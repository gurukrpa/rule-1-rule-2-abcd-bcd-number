/**
 * 🔍 COMPREHENSIVE RULE-1 PAGE DIAGNOSTIC TOOL
 * 
 * This script investigates the missing topics issue for specific dates/hours
 * Example: D-4 Set-1 not appearing on 4-8-25 date
 */

console.log('🔍 Starting Rule-1 Page Comprehensive Diagnostic...');

class Rule1PageDiagnostic {
  constructor() {
    this.results = {
      ui: {},
      dates: {},
      topics: {},
      numberBoxes: {},
      supabaseConnection: {},
      dataFlow: {},
      issues: []
    };
  }

  // 1. UI COMPONENTS INVESTIGATION
  async investigateUI() {
    console.log('🎨 [UI] Investigating UI components...');
    
    const uiChecks = {
      rule1PageMounted: !!document.querySelector('[class*="Rule1"]') || 
                       window.location.pathname.includes('rule1') ||
                       !!window.rule1PageDebug,
      headerVisible: !!document.querySelector('h1'),
      topicSelectorVisible: !!document.querySelector('[class*="topic"]'),
      dateHeadersVisible: !!document.querySelectorAll('[class*="date"]').length,
      numberBoxesVisible: !!document.querySelectorAll('button[class*="number"]').length,
      hrSelectorVisible: !!document.querySelector('[class*="HR"]'),
      loadingStates: {
        generalLoading: !!document.querySelector('[class*="loading"]'),
        progressBars: document.querySelectorAll('[class*="progress"]').length
      }
    };

    // Check for React component state
    if (window.rule1PageDebug) {
      const debugInfo = window.rule1PageDebug.getStateInfo();
      uiChecks.reactState = {
        loading: debugInfo.loading,
        error: debugInfo.error,
        selectedUser: debugInfo.selectedUser,
        activeHR: debugInfo.activeHR,
        availableTopics: debugInfo.availableTopics?.length || 0,
        allDaysDataKeys: Object.keys(debugInfo.allDaysData || {}).length
      };
    }

    this.results.ui = uiChecks;
    console.log('✅ [UI] Investigation complete:', uiChecks);
    return uiChecks;
  }

  // 2. DATES INVESTIGATION
  async investigateDates() {
    console.log('📅 [DATES] Investigating dates handling...');
    
    const dateChecks = {
      availableDates: [],
      currentDate: new Date().toISOString().split('T')[0],
      targetDate: '2025-08-04', // 4-8-25
      dateFormat: {
        iso: '2025-08-04',
        display: '4-8-25',
        variants: ['2025-08-04', '04-08-2025', '4-8-25', '04-08-25', '2025-8-4']
      }
    };

    // Check if debug interface is available
    if (window.rule1PageDebug) {
      const debugInfo = window.rule1PageDebug.getStateInfo();
      const allDaysData = debugInfo.allDaysData || {};
      
      dateChecks.availableDates = Object.keys(allDaysData).sort();
      dateChecks.targetDateExists = dateChecks.availableDates.includes(dateChecks.targetDate) ||
                                   dateChecks.availableDates.some(d => d.includes('2025-08-04'));
      
      // Check for date variations
      dateChecks.dateVariations = dateChecks.dateFormat.variants.filter(variant => 
        dateChecks.availableDates.some(d => d.includes(variant.split('-')[2]) && 
                                           d.includes(variant.split('-')[1]) && 
                                           d.includes(variant.split('-')[0]))
      );

      // Analyze specific target date
      if (dateChecks.targetDateExists) {
        const targetDateData = allDaysData[dateChecks.targetDate] || 
                              allDaysData[Object.keys(allDaysData).find(d => d.includes('2025-08-04'))];
        
        dateChecks.targetDateAnalysis = {
          success: targetDateData?.success,
          hrDataAvailable: Object.keys(targetDateData?.hrData || {}).length,
          availableHRs: Object.keys(targetDateData?.hrData || {}),
          errorMessage: targetDateData?.error
        };
      }
    }

    this.results.dates = dateChecks;
    console.log('✅ [DATES] Investigation complete:', dateChecks);
    return dateChecks;
  }

  // 3. TOPICS INVESTIGATION
  async investigateTopics() {
    console.log('📊 [TOPICS] Investigating topics and D-4 Set-1 specifically...');
    
    const topicChecks = {
      targetTopic: 'D-4 Set-1 Matrix',
      topicVariations: [
        'D-4 Set-1 Matrix',
        'D-4 (trd) Set-1 Matrix', 
        'D-4 Set-1',
        'D-4 Set-1 Matrix',
        'D-4_Set-1_Matrix'
      ],
      discovered: [],
      missing: [],
      topicMatching: {}
    };

    if (window.rule1PageDebug) {
      const debugInfo = window.rule1PageDebug.getStateInfo();
      const availableTopics = debugInfo.availableTopics || [];
      const allDaysData = debugInfo.allDaysData || {};
      
      topicChecks.discovered = availableTopics;
      topicChecks.totalTopicsFound = availableTopics.length;
      
      // Check if target topic exists in any variation
      topicChecks.targetTopicFound = availableTopics.some(topic => 
        topic.includes('D-4') && topic.includes('Set-1')
      );
      
      // Find exact matches for D-4 Set-1
      topicChecks.d4Set1Matches = availableTopics.filter(topic => 
        topic.includes('D-4') && topic.includes('Set-1')
      );

      // Check topic presence across dates
      topicChecks.topicPresenceByDate = {};
      Object.entries(allDaysData).forEach(([dateKey, dayData]) => {
        if (dayData.success && dayData.hrData) {
          const hrKeys = Object.keys(dayData.hrData);
          topicChecks.topicPresenceByDate[dateKey] = {};
          
          hrKeys.forEach(hr => {
            const setsInThisHR = Object.keys(dayData.hrData[hr]?.sets || {});
            topicChecks.topicPresenceByDate[dateKey][hr] = {
              totalSets: setsInThisHR.length,
              hasD4Set1: setsInThisHR.some(set => set.includes('D-4') && set.includes('Set-1')),
              d4Set1Variations: setsInThisHR.filter(set => set.includes('D-4') && set.includes('Set-1'))
            };
          });
        }
      });

      // Specifically check target date for D-4 Set-1
      const targetDate = '2025-08-04';
      if (allDaysData[targetDate]) {
        topicChecks.targetDateTopicAnalysis = this.analyzeTopicOnDate(allDaysData[targetDate], 'D-4 Set-1');
      }
    }

    this.results.topics = topicChecks;
    console.log('✅ [TOPICS] Investigation complete:', topicChecks);
    return topicChecks;
  }

  // Helper method to analyze specific topic on specific date
  analyzeTopicOnDate(dayData, targetTopicPattern) {
    const analysis = {
      dateSuccess: dayData.success,
      error: dayData.error,
      hrAnalysis: {}
    };

    if (dayData.success && dayData.hrData) {
      Object.entries(dayData.hrData).forEach(([hr, hrData]) => {
        const sets = hrData.sets || {};
        const matchingSets = Object.keys(sets).filter(setName => 
          setName.includes(targetTopicPattern.split(' ')[0]) && 
          setName.includes(targetTopicPattern.split(' ')[1])
        );

        analysis.hrAnalysis[hr] = {
          totalSets: Object.keys(sets).length,
          matchingSets: matchingSets,
          hasTargetTopic: matchingSets.length > 0,
          setDetails: {}
        };

        // Analyze each matching set
        matchingSets.forEach(setName => {
          const setData = sets[setName];
          analysis.hrAnalysis[hr].setDetails[setName] = {
            elements: Object.keys(setData || {}),
            hasData: Object.values(setData || {}).some(element => element.hasData),
            selectedPlanet: hrData.selectedPlanet,
            sampleData: Object.entries(setData || {}).slice(0, 2).map(([elemName, elemData]) => ({
              element: elemName,
              rawData: elemData.rawData,
              hasData: elemData.hasData
            }))
          };
        });
      });
    }

    return analysis;
  }

  // 4. NUMBER BOX INVESTIGATION
  async investigateNumberBoxes() {
    console.log('🔢 [NUMBER_BOXES] Investigating number box functionality...');
    
    const numberBoxChecks = {
      clickedNumbers: {},
      numberBoxElements: 0,
      clickableNumbers: [],
      targetInvestigation: {
        topic: 'D-4 Set-1 Matrix',
        date: '2025-08-04',
        expectedNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
      }
    };

    // Count visible number box elements
    numberBoxChecks.numberBoxElements = document.querySelectorAll('button[class*="number"], button[class*="box"]').length;
    
    // Find clickable number buttons
    const numberButtons = document.querySelectorAll('button');
    numberBoxChecks.clickableNumbers = Array.from(numberButtons)
      .filter(btn => /^\d+$/.test(btn.textContent?.trim()))
      .map(btn => ({
        number: parseInt(btn.textContent.trim()),
        classes: btn.className,
        disabled: btn.disabled,
        visible: btn.offsetParent !== null
      }));

    if (window.rule1PageDebug) {
      const debugInfo = window.rule1PageDebug.getStateInfo();
      numberBoxChecks.clickedNumbers = debugInfo.clickedNumbers || {};
      
      // Check specific target topic/date combination
      const targetTopic = numberBoxChecks.targetInvestigation.topic;
      const targetDate = numberBoxChecks.targetInvestigation.date;
      
      if (numberBoxChecks.clickedNumbers[targetTopic]?.[targetDate]) {
        numberBoxChecks.targetInvestigation.actualData = numberBoxChecks.clickedNumbers[targetTopic][targetDate];
      }

      // Check if force reload function is available
      if (window.rule1PageDebug.forceReloadNumberBoxes) {
        numberBoxChecks.forceReloadAvailable = true;
      }
    }

    this.results.numberBoxes = numberBoxChecks;
    console.log('✅ [NUMBER_BOXES] Investigation complete:', numberBoxChecks);
    return numberBoxChecks;
  }

  // 5. SUPABASE CONNECTION INVESTIGATION
  async investigateSupabaseConnection() {
    console.log('🗄️ [SUPABASE] Investigating Supabase connection and data flow...');
    
    const supabaseChecks = {
      connectionStatus: 'unknown',
      services: {},
      dataFetch: {},
      errorLogs: []
    };

    try {
      // Check if services are available
      if (window.cleanSupabaseService || window.unifiedDataService) {
        supabaseChecks.services.cleanSupabase = !!window.cleanSupabaseService;
        supabaseChecks.services.unified = !!window.unifiedDataService;
      }

      // Test basic connection by attempting a simple query
      if (window.rule1PageDebug) {
        try {
          const debugInfo = window.rule1PageDebug.getStateInfo();
          
          // Check if we can access user data
          if (debugInfo.selectedUser) {
            supabaseChecks.userAccess = {
              selectedUser: debugInfo.selectedUser,
              hasUserData: true
            };
          }

          // Check data loading state
          supabaseChecks.dataLoading = {
            loading: debugInfo.loading,
            error: debugInfo.error,
            dataKeys: Object.keys(debugInfo.allDaysData || {})
          };

        } catch (error) {
          supabaseChecks.errorLogs.push({
            type: 'debug_access_error',
            message: error.message,
            timestamp: new Date().toISOString()
          });
        }
      }

      // Look for recent console errors related to Supabase
      if (window.console && window.console.history) {
        const recentErrors = window.console.history
          .filter(entry => entry.level === 'error' && 
                          (entry.message.includes('supabase') || 
                           entry.message.includes('database') ||
                           entry.message.includes('fetch')))
          .slice(-5);
        
        supabaseChecks.recentErrors = recentErrors;
      }

    } catch (error) {
      supabaseChecks.connectionStatus = 'error';
      supabaseChecks.errorLogs.push({
        type: 'connection_test_error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }

    this.results.supabaseConnection = supabaseChecks;
    console.log('✅ [SUPABASE] Investigation complete:', supabaseChecks);
    return supabaseChecks;
  }

  // 6. COMPREHENSIVE DATA FLOW ANALYSIS
  async investigateDataFlow() {
    console.log('🔄 [DATA_FLOW] Investigating complete data flow for missing topics...');
    
    const dataFlowChecks = {
      pipeline: {},
      issues: [],
      recommendations: []
    };

    if (window.rule1PageDebug) {
      const debugInfo = window.rule1PageDebug.getStateInfo();
      
      // 1. Check data loading pipeline
      dataFlowChecks.pipeline.dataLoading = {
        hasExcelData: Object.keys(debugInfo.allDaysData || {}).length > 0,
        hasHourData: Object.values(debugInfo.allDaysData || {}).some(day => 
          day.hrData && Object.keys(day.hrData).length > 0
        ),
        hasTopics: (debugInfo.availableTopics || []).length > 0
      };

      // 2. Check topic discovery pipeline
      const targetDate = '2025-08-04';
      if (debugInfo.allDaysData?.[targetDate]) {
        dataFlowChecks.pipeline.topicDiscovery = this.analyzeTopicDiscoveryPipeline(
          debugInfo.allDaysData[targetDate], 
          'D-4 Set-1'
        );
      }

      // 3. Check ABCD/BCD analysis pipeline
      if (debugInfo.abcdBcdAnalysis) {
        dataFlowChecks.pipeline.abcdBcdAnalysis = {
          hasAnalysis: Object.keys(debugInfo.abcdBcdAnalysis).length > 0,
          topicsWithAnalysis: Object.keys(debugInfo.abcdBcdAnalysis),
          targetTopicHasAnalysis: Object.keys(debugInfo.abcdBcdAnalysis).some(topic => 
            topic.includes('D-4') && topic.includes('Set-1')
          )
        };
      }

      // 4. Identify potential issues
      if (!dataFlowChecks.pipeline.dataLoading.hasExcelData) {
        dataFlowChecks.issues.push({
          type: 'no_excel_data',
          severity: 'critical',
          message: 'No Excel data loaded in allDaysData'
        });
      }

      if (!dataFlowChecks.pipeline.dataLoading.hasTopics) {
        dataFlowChecks.issues.push({
          type: 'no_topics_discovered',
          severity: 'critical',
          message: 'No topics discovered in availableTopics'
        });
      }

      if (dataFlowChecks.pipeline.topicDiscovery && !dataFlowChecks.pipeline.topicDiscovery.found) {
        dataFlowChecks.issues.push({
          type: 'target_topic_missing',
          severity: 'high',
          message: `D-4 Set-1 not found on target date ${targetDate}`,
          details: dataFlowChecks.pipeline.topicDiscovery
        });
      }

      // 5. Generate recommendations
      if (dataFlowChecks.issues.length > 0) {
        dataFlowChecks.recommendations = this.generateRecommendations(dataFlowChecks.issues);
      }
    }

    this.results.dataFlow = dataFlowChecks;
    console.log('✅ [DATA_FLOW] Investigation complete:', dataFlowChecks);
    return dataFlowChecks;
  }

  // Helper method for topic discovery analysis
  analyzeTopicDiscoveryPipeline(dayData, targetPattern) {
    const analysis = {
      found: false,
      variations: [],
      hrBreakdown: {},
      dataQuality: {}
    };

    if (dayData.success && dayData.hrData) {
      Object.entries(dayData.hrData).forEach(([hr, hrData]) => {
        const sets = Object.keys(hrData.sets || {});
        const matching = sets.filter(set => 
          set.includes(targetPattern.split(' ')[0]) && 
          set.includes(targetPattern.split(' ')[1])
        );

        analysis.hrBreakdown[hr] = {
          totalSets: sets.length,
          matchingSets: matching,
          found: matching.length > 0
        };

        if (matching.length > 0) {
          analysis.found = true;
          analysis.variations.push(...matching);
        }
      });
    }

    return analysis;
  }

  // Generate actionable recommendations
  generateRecommendations(issues) {
    const recommendations = [];

    issues.forEach(issue => {
      switch (issue.type) {
        case 'no_excel_data':
          recommendations.push({
            action: 'check_data_service',
            description: 'Verify Supabase connection and Excel data fetching',
            code: 'await window.rule1PageDebug.forceReloadData()'
          });
          break;
        
        case 'no_topics_discovered':
          recommendations.push({
            action: 'check_topic_extraction',
            description: 'Verify topic extraction from loaded data',
            code: 'window.rule1PageDebug.analyzTopicExtraction()'
          });
          break;
        
        case 'target_topic_missing':
          recommendations.push({
            action: 'check_topic_variations',
            description: 'Check for topic name variations in database',
            code: `window.rule1PageDebug.findTopicVariations('D-4 Set-1')`
          });
          break;
      }
    });

    return recommendations;
  }

  // MAIN DIAGNOSTIC RUNNER
  async runFullDiagnostic() {
    console.log('🚀 Starting comprehensive Rule-1 Page diagnostic...');
    console.log('=====================================');

    try {
      // Run all investigations in sequence
      await this.investigateUI();
      await this.investigateDates();
      await this.investigateTopics();
      await this.investigateNumberBoxes();
      await this.investigateSupabaseConnection();
      await this.investigateDataFlow();

      // Generate summary report
      this.generateSummaryReport();
      
      return this.results;
    } catch (error) {
      console.error('❌ Diagnostic failed:', error);
      this.results.diagnosticError = error.message;
      return this.results;
    }
  }

  generateSummaryReport() {
    console.log('\n📋 DIAGNOSTIC SUMMARY REPORT');
    console.log('=====================================');
    
    // Overall health check
    const healthChecks = {
      ui: !!this.results.ui.rule1PageMounted,
      dates: this.results.dates.availableDates?.length > 0,
      topics: this.results.topics.totalTopicsFound > 0,
      numberBoxes: this.results.numberBoxes.numberBoxElements > 0,
      supabase: this.results.supabaseConnection.connectionStatus !== 'error',
      dataFlow: this.results.dataFlow.pipeline?.dataLoading?.hasExcelData
    };

    console.log('🏥 HEALTH CHECKS:');
    Object.entries(healthChecks).forEach(([component, status]) => {
      console.log(`  ${status ? '✅' : '❌'} ${component.toUpperCase()}: ${status ? 'OK' : 'ISSUE'}`);
    });

    // Specific issue analysis
    console.log('\n🎯 SPECIFIC ISSUE ANALYSIS (D-4 Set-1 on 4-8-25):');
    
    const targetTopicFound = this.results.topics.d4Set1Matches?.length > 0;
    const targetDateExists = this.results.dates.targetDateExists;
    
    console.log(`  📊 Target topic found: ${targetTopicFound ? '✅' : '❌'}`);
    console.log(`  📅 Target date exists: ${targetDateExists ? '✅' : '❌'}`);
    
    if (targetTopicFound) {
      console.log(`  📊 Topic variations found: ${this.results.topics.d4Set1Matches.join(', ')}`);
    }
    
    if (this.results.topics.targetDateTopicAnalysis) {
      console.log(`  🔍 Target date analysis:`, this.results.topics.targetDateTopicAnalysis);
    }

    // Data flow issues
    if (this.results.dataFlow.issues?.length > 0) {
      console.log('\n⚠️ IDENTIFIED ISSUES:');
      this.results.dataFlow.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue.type}: ${issue.message}`);
      });
    }

    // Recommendations
    if (this.results.dataFlow.recommendations?.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      this.results.dataFlow.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec.description}`);
        console.log(`     Code: ${rec.code}`);
      });
    }

    console.log('\n🔍 Full diagnostic results available in diagnostic.results');
    console.log('=====================================');
  }
}

// Create and run diagnostic
const diagnostic = new Rule1PageDiagnostic();

// Make diagnostic available globally for further investigation
window.rule1Diagnostic = diagnostic;

// Auto-run diagnostic
diagnostic.runFullDiagnostic().then(results => {
  console.log('\n✅ Diagnostic complete! Results stored in window.rule1Diagnostic.results');
  
  // Provide quick access functions
  window.quickCheck = {
    showTopics: () => console.table(results.topics.discovered),
    showDates: () => console.table(results.dates.availableDates),
    showIssues: () => console.table(results.dataFlow.issues),
    showRecommendations: () => console.table(results.dataFlow.recommendations),
    checkTargetDate: () => console.log('Target date analysis:', results.topics.targetDateTopicAnalysis),
    forceReload: () => window.rule1PageDebug?.forceReloadData?.()
  };
  
  console.log('\n🛠️ Quick check functions available:');
  console.log('  window.quickCheck.showTopics()');
  console.log('  window.quickCheck.showDates()'); 
  console.log('  window.quickCheck.showIssues()');
  console.log('  window.quickCheck.checkTargetDate()');
  console.log('  window.quickCheck.forceReload()');
});
