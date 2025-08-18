// Cross-Page Synchronization Service
// Handles synchronization of clicked numbers and analysis results between Rule-1 and PlanetsAnalysis pages

import cleanSupabaseService from './CleanSupabaseService.js';

class CrossPageSyncService {
  constructor() {
    this.cleanSupabaseService = cleanSupabaseService;
    this.syncSubscription = null;
  }

  /**
   * Get all clicked numbers from Rule-1 page for a specific user
   * @param {string} userId - User ID
   * @returns {Object} Organized sync data by topic and date
   */
  async getAllClickedNumbers(userId) {
    try {
      console.log('🔄 [CrossPageSync] Getting all clicked numbers for user:', userId);

      // Get all topic clicks (call with no filters to get all)
      const topicClicks = await this.cleanSupabaseService.getTopicClicks(userId);
      
      // Get all analysis results (ABCD/BCD rules)
      const analysisResults = await this.cleanSupabaseService.getOrganizedAnalysisResults(userId);
      
      console.log('📊 [CrossPageSync] Raw topic clicks:', topicClicks);
      console.log('📊 [CrossPageSync] Raw analysis results:', analysisResults);

      // Organize data by topic and date
      const organizedData = this.organizeDataForSync(topicClicks, analysisResults);
      
      console.log('✅ [CrossPageSync] Organized sync data:', organizedData);
      return organizedData;
    } catch (error) {
      console.error('❌ [CrossPageSync] Error getting clicked numbers:', error);
      throw error;
    }
  }

  /**
   * Organize clicked numbers and analysis results for cross-page sync
   * @param {Array} topicClicks - Raw topic clicks data from getTopicClicks
   * @param {Object} analysisResults - Analysis results from getOrganizedAnalysisResults
   * @returns {Object} Organized data structure by date -> topic
   */
  organizeDataForSync(topicClicks, analysisResults) {
    const organized = {};

    console.log('🔄 [CrossPageSync] Organizing data for sync:', {
      totalTopicClicks: topicClicks.length,
      sampleClicks: topicClicks.slice(0, 3),
      analysisResultsKeys: Object.keys(analysisResults)
    });

    // Process topic clicks - convert to date -> topic structure
    topicClicks.forEach(click => {
      const dateKey = click.date_key;
      const topicName = click.topic_name;
      
      if (!organized[dateKey]) {
        organized[dateKey] = {};
      }
      
      if (!organized[dateKey][topicName]) {
        organized[dateKey][topicName] = {
          clickedNumbers: [],
          abcdNumbers: [],
          bcdNumbers: [],
          hour: click.hour || 1
        };
      }
      
      // Add clicked number if not already present (fix: use clicked_number field from database)
      if (click.clicked_number && !organized[dateKey][topicName].clickedNumbers.includes(click.clicked_number)) {
        organized[dateKey][topicName].clickedNumbers.push(click.clicked_number);
      }
    });

    // Process analysis results - convert from topic->date to date->topic structure
    Object.keys(analysisResults).forEach(topicName => {
      const topicData = analysisResults[topicName];
      
      Object.keys(topicData).forEach(dateKey => {
        const analysisData = topicData[dateKey];
        
        if (!organized[dateKey]) {
          organized[dateKey] = {};
        }
        
        if (!organized[dateKey][topicName]) {
          organized[dateKey][topicName] = {
            clickedNumbers: [],
            abcdNumbers: [],
            bcdNumbers: [],
            hour: 1
          };
        }

        // Merge ABCD/BCD numbers
        organized[dateKey][topicName].abcdNumbers = analysisData.abcdNumbers || [];
        organized[dateKey][topicName].bcdNumbers = analysisData.bcdNumbers || [];
      });
    });

    console.log('✅ [CrossPageSync] Organized data structure:', {
      totalDates: Object.keys(organized).length,
      sampleStructure: Object.keys(organized).slice(0, 2).reduce((acc, dateKey) => {
        acc[dateKey] = Object.keys(organized[dateKey]).reduce((topicAcc, topicName) => {
          const topicData = organized[dateKey][topicName];
          topicAcc[topicName] = {
            hour: topicData.hour,
            clickedCount: topicData.clickedNumbers.length,
            abcdCount: topicData.abcdNumbers.length,
            bcdCount: topicData.bcdNumbers.length
          };
          return topicAcc;
        }, {});
        return acc;
      }, {})
    });

    return organized;
  }

  /**
   * Sync Rule-1 data to PlanetsAnalysis format
   * @param {Object} syncData - Organized sync data
   * @param {string} targetDate - Target date for PlanetsAnalysis
   * @param {number} targetHour - Target hour for PlanetsAnalysis
   * @returns {Object} Data formatted for PlanetsAnalysis consumption
   */
  syncToPlanetsAnalysis(syncData, targetDate, targetHour = 1) {
    const planetsData = {};

    console.log('🎯 [CrossPageSync] Syncing to PlanetsAnalysis:', {
      targetDate,
      targetHour,
      targetHourType: typeof targetHour,
      availableDates: Object.keys(syncData)
    });

    // Get data for the target date
    const dateData = syncData[targetDate] || {};

    Object.keys(dateData).forEach(topicName => {
      const topicData = dateData[topicName];
      
      // Normalize hour formats for comparison (handle both "HR2" and 2)
      const topicHour = typeof topicData.hour === 'string' ? 
        topicData.hour.replace('HR', '') : topicData.hour.toString();
      const targetHourNormalized = typeof targetHour === 'string' ? 
        targetHour.replace('HR', '') : targetHour.toString();
      
      console.log(`🔍 [CrossPageSync] Hour comparison for ${topicName}:`, {
        topicHour,
        topicHourType: typeof topicData.hour,
        targetHourNormalized,
        targetHourType: typeof targetHour,
        match: topicHour === targetHourNormalized || targetHourNormalized === '1'
      });
      
      // Include data for the specified hour or default to hour 1
      if (topicHour === targetHourNormalized || targetHourNormalized === '1') {
        planetsData[topicName] = {
          clickedNumbers: [...topicData.clickedNumbers],
          abcdNumbers: [...topicData.abcdNumbers],
          bcdNumbers: [...topicData.bcdNumbers],
          hour: topicData.hour,
          source: 'rule1-sync'
        };
      }
    });

    console.log(`🔄 [CrossPageSync] Synced data for ${targetDate} HR${targetHour}:`, planetsData);
    return planetsData;
  }

  /**
   * Apply sync data to PlanetsAnalysis page state
   * @param {Object} syncData - Organized sync data
   * @param {Function} setClickedNumbersByTopic - State setter for clicked numbers
   * @param {Function} setRule1SyncData - State setter for sync data
   * @param {string} selectedDate - Currently selected date
   * @param {number} selectedHour - Currently selected hour
   */
  applySyncToPlanetsAnalysis(syncData, setClickedNumbersByTopic, setRule1SyncData, selectedDate, selectedHour = 1) {
    try {
      console.log('🔄 [CrossPageSync] Applying sync to PlanetsAnalysis:', { selectedDate, selectedHour });

      // Get formatted data for PlanetsAnalysis
      const planetsData = this.syncToPlanetsAnalysis(syncData, selectedDate, selectedHour);

      // Update clicked numbers state
      const clickedNumbers = {};
      Object.keys(planetsData).forEach(topicName => {
        if (planetsData[topicName].clickedNumbers.length > 0) {
          clickedNumbers[topicName] = planetsData[topicName].clickedNumbers;
        }
      });

      setClickedNumbersByTopic(clickedNumbers);
      setRule1SyncData(planetsData);

      console.log('✅ [CrossPageSync] Successfully applied sync data to PlanetsAnalysis');
      return true;
    } catch (error) {
      console.error('❌ [CrossPageSync] Error applying sync to PlanetsAnalysis:', error);
      return false;
    }
  }

  /**
   * Setup real-time synchronization between Rule-1 and PlanetsAnalysis
   * @param {string} userId - User ID to monitor
   * @param {Function} onSyncUpdate - Callback for sync updates
   */
  async setupRealTimeSync(userId, onSyncUpdate) {
    try {
      console.log('🔄 [CrossPageSync] Setting up real-time sync for user:', userId);

      // Subscribe to topic clicks changes
      this.syncSubscription = await this.cleanSupabaseService.subscribeToTopicClicks(
        userId,
        (payload) => {
          console.log('🔄 [CrossPageSync] Real-time update received:', payload);
          if (onSyncUpdate) {
            onSyncUpdate(payload);
          }
        }
      );

      console.log('✅ [CrossPageSync] Real-time sync setup complete');
      return true;
    } catch (error) {
      console.error('❌ [CrossPageSync] Error setting up real-time sync:', error);
      return false;
    }
  }

  /**
   * Cleanup sync subscription
   */
  cleanup() {
    if (this.syncSubscription) {
      console.log('🔄 [CrossPageSync] Cleaning up sync subscription');
      this.syncSubscription.unsubscribe();
      this.syncSubscription = null;
    }
  }

  /**
   * Get sync status and statistics
   * @param {string} userId - User ID
   * @returns {Object} Sync status information
   */
  async getSyncStatus(userId) {
    try {
      const syncData = await this.getAllClickedNumbers(userId);
      const totalDates = Object.keys(syncData).length;
      const totalTopics = Object.values(syncData).reduce((acc, dateData) => {
        return acc + Object.keys(dateData).length;
      }, 0);
      const totalClickedNumbers = Object.values(syncData).reduce((acc, dateData) => {
        return acc + Object.values(dateData).reduce((topicAcc, topicData) => {
          return topicAcc + topicData.clickedNumbers.length;
        }, 0);
      }, 0);

      return {
        totalDates,
        totalTopics,
        totalClickedNumbers,
        lastUpdate: new Date(),
        status: 'active'
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        lastUpdate: new Date()
      };
    }
  }
}

// Export singleton instance
export const crossPageSyncService = new CrossPageSyncService();
export default crossPageSyncService;
