// Cross-Page Synchronization Service (NO-OP)
// This module intentionally disables cross-page synchronization across the app.
// It preserves the original API surface so callers don't break. All methods
// are safe no-ops and return empty structures or sensible defaults.

class CrossPageSyncService {
  constructor() {
    // mark disabled flag for callers that want to detect it
    this.enabled = false;
    this.syncSubscription = null;
  }

  async getAllClickedNumbers(/* userId */) {
    // Return an empty object to indicate no sync data available
    console.log('🔕 [CrossPageSync] Disabled: getAllClickedNumbers returning empty data');
    return {};
  }

  organizeDataForSync(/* topicClicks, analysisResults */) {
    // Return empty organized structure
    return {};
  }

  syncToPlanetsAnalysis(/* syncData, targetDate, targetHour */) {
    // No sync — return empty planets data
    return {};
  }

  applySyncToPlanetsAnalysis(/* syncData, setClickedNumbersByTopic, setRule1SyncData, selectedDate, selectedHour */) {
    // Nothing to apply — return false to indicate no-op
    console.log('🔕 [CrossPageSync] Disabled: applySyncToPlanetsAnalysis no-op');
    return false;
  }

  async setupRealTimeSync(/* userId, onSyncUpdate */) {
    // Do not create any real-time subscriptions
    console.log('� [CrossPageSync] Disabled: setupRealTimeSync skipped');
    return false;
  }

  cleanup() {
    // No subscriptions to clean
    this.syncSubscription = null;
    console.log('� [CrossPageSync] Disabled: cleanup noop');
  }

  async getSyncStatus(/* userId */) {
    return {
      status: 'disabled',
      totalDates: 0,
      totalTopics: 0,
      totalClickedNumbers: 0,
      lastUpdate: new Date()
    };
  }
}

// Export singleton instance (preserve import names used across the codebase)
export const crossPageSyncService = new CrossPageSyncService();
export default crossPageSyncService;
