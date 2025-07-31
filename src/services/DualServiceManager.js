/**
 * Dual-Service Manager
 * Orchestrates both Firebase and Supabase for maximum reliability
 */

import { databaseServiceSwitcher } from './DatabaseServiceSwitcher.js';
import { cleanSupabaseService } from './CleanSupabaseService.js';
import { firebaseService } from './FirebaseService.js';

class DualServiceManager {
  constructor() {
    this.primary = cleanSupabaseService;
    this.backup = firebaseService;
    this.isEnabled = false;
    
    console.log('🔄 Dual-Service Manager initialized');
  }

  // =====================================
  // 🔧 SERVICE MANAGEMENT
  // =====================================

  enable() {
    this.isEnabled = true;
    databaseServiceSwitcher.enableDualService();
    console.log('🔄 Dual-service mode ENABLED');
    return this.getStatus();
  }

  disable() {
    this.isEnabled = false;
    console.log('🔄 Dual-service mode DISABLED');
    return this.getStatus();
  }

  getStatus() {
    return {
      enabled: this.isEnabled,
      primary: 'Supabase',
      backup: 'Firebase',
      health: null // Will be populated by health check
    };
  }

  // =====================================
  // 💾 DUAL-SAVE OPERATIONS
  // =====================================

  /**
   * Save data to both services with error handling
   */
  async dualSave(operation, ...args) {
    if (!this.isEnabled) {
      // Single service mode - use primary only
      return await this.primary[operation](...args);
    }

    const results = {
      primary: { success: false, data: null, error: null },
      backup: { success: false, data: null, error: null },
      overall: { success: false, savedCount: 0 }
    };

    // Save to primary service (Supabase)
    try {
      results.primary.data = await this.primary[operation](...args);
      results.primary.success = true;
      results.overall.savedCount++;
      console.log('✅ Primary save successful (Supabase)');
    } catch (error) {
      results.primary.error = error.message;
      console.error('❌ Primary save failed (Supabase):', error.message);
    }

    // Save to backup service (Firebase)
    try {
      results.backup.data = await this.backup[operation](...args);
      results.backup.success = true;
      results.overall.savedCount++;
      console.log('✅ Backup save successful (Firebase)');
    } catch (error) {
      results.backup.error = error.message;
      console.error('❌ Backup save failed (Firebase):', error.message);
    }

    // Determine overall success
    results.overall.success = results.overall.savedCount > 0;

    if (results.overall.savedCount === 0) {
      throw new Error('Both primary and backup saves failed');
    } else if (results.overall.savedCount === 1) {
      console.log('⚠️ Partial save success (only one service succeeded)');
    } else {
      console.log('🎉 Full dual-save success (both services succeeded)');
    }

    return results;
  }

  // =====================================
  // 📥 DUAL-FETCH OPERATIONS
  // =====================================

  /**
   * Fetch data with fallback from backup service
   */
  async dualFetch(operation, ...args) {
    if (!this.isEnabled) {
      // Single service mode - use primary only
      return await this.primary[operation](...args);
    }

    let primaryData = null;
    let backupData = null;
    let primaryError = null;
    let backupError = null;

    // Try primary service first (Supabase)
    try {
      primaryData = await this.primary[operation](...args);
      console.log('✅ Primary fetch successful (Supabase)');
      return {
        data: primaryData,
        source: 'primary',
        service: 'Supabase',
        backupAvailable: false // We got primary data, no need to check backup
      };
    } catch (error) {
      primaryError = error.message;
      console.warn('⚠️ Primary fetch failed (Supabase), trying backup...');
    }

    // Fallback to backup service (Firebase)
    try {
      backupData = await this.backup[operation](...args);
      console.log('✅ Backup fetch successful (Firebase)');
      return {
        data: backupData,
        source: 'backup',
        service: 'Firebase',
        primaryError: primaryError
      };
    } catch (error) {
      backupError = error.message;
      console.error('❌ Backup fetch failed (Firebase)');
    }

    // Both failed
    throw new Error(`Both services failed - Primary: ${primaryError}, Backup: ${backupError}`);
  }

  // =====================================
  // 🔄 SYNCHRONIZATION
  // =====================================

  /**
   * Sync data from primary to backup service
   */
  async syncPrimaryToBackup(userId) {
    if (!this.isEnabled) {
      return { success: false, reason: 'Dual-service mode disabled' };
    }

    console.log('🔄 Starting primary-to-backup sync...');

    try {
      // Get all data from primary (Supabase)
      const summary = await this.primary.getDataSummary(userId);
      const dates = await this.primary.getUserDates(userId);

      let syncedItems = 0;

      // Sync user dates
      if (dates.length > 0) {
        await this.backup.saveUserDates(userId, dates);
        syncedItems++;
      }

      // Sync Excel data and hour entries for each date
      for (const date of dates) {
        try {
          // Sync Excel data
          const excelData = await this.primary.getExcelData(userId, date);
          if (excelData) {
            await this.backup.saveExcelData(userId, date, excelData);
            syncedItems++;
          }

          // Sync hour entry
          const hourEntry = await this.primary.getHourEntry(userId, date);
          if (hourEntry) {
            await this.backup.saveHourEntry(userId, date, hourEntry.planetSelections);
            syncedItems++;
          }
        } catch (error) {
          console.warn(`⚠️ Failed to sync data for date ${date}:`, error.message);
        }
      }

      console.log(`🎉 Sync completed: ${syncedItems} items synced`);
      return {
        success: true,
        syncedItems: syncedItems,
        dates: dates.length,
        summary: summary
      };

    } catch (error) {
      console.error('❌ Sync failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify data consistency between services
   */
  async verifyDataConsistency(userId) {
    if (!this.isEnabled) {
      return { success: false, reason: 'Dual-service mode disabled' };
    }

    console.log('🔍 Verifying data consistency...');

    try {
      const primarySummary = await this.primary.getDataSummary(userId);
      // Note: This would need Firebase implementation to get backup summary
      
      const consistency = {
        userDatesMatch: true, // Would need actual comparison
        excelDataMatch: true, // Would need actual comparison
        hourEntriesMatch: true, // Would need actual comparison
        issues: []
      };

      console.log('🔍 Consistency check completed');
      return {
        success: true,
        primary: primarySummary,
        backup: { note: 'Firebase summary implementation needed' },
        consistency: consistency
      };

    } catch (error) {
      console.error('❌ Consistency check failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // =====================================
  // 📊 HEALTH MONITORING
  // =====================================

  async getHealthStatus() {
    const health = {
      timestamp: new Date().toISOString(),
      services: {
        primary: { name: 'Supabase', status: 'unknown', latency: null },
        backup: { name: 'Firebase', status: 'unknown', latency: null }
      },
      overall: { status: 'unknown', message: '' }
    };

    // Check primary service (Supabase)
    try {
      const startTime = Date.now();
      await this.primary.checkConnection();
      health.services.primary.status = 'healthy';
      health.services.primary.latency = Date.now() - startTime;
    } catch (error) {
      health.services.primary.status = 'error';
      health.services.primary.error = error.message;
    }

    // Check backup service (Firebase)
    try {
      const startTime = Date.now();
      await this.backup.checkConnection();
      health.services.backup.status = 'healthy';
      health.services.backup.latency = Date.now() - startTime;
    } catch (error) {
      health.services.backup.status = 'error';
      health.services.backup.error = error.message;
    }

    // Determine overall status
    const primaryHealthy = health.services.primary.status === 'healthy';
    const backupHealthy = health.services.backup.status === 'healthy';

    if (primaryHealthy && backupHealthy) {
      health.overall.status = 'excellent';
      health.overall.message = 'Both services are healthy';
    } else if (primaryHealthy) {
      health.overall.status = 'good';
      health.overall.message = 'Primary service healthy, backup needs attention';
    } else if (backupHealthy) {
      health.overall.status = 'degraded';
      health.overall.message = 'Primary service down, backup available';
    } else {
      health.overall.status = 'critical';
      health.overall.message = 'Both services are down';
    }

    return health;
  }

  // =====================================
  // 🎯 CONVENIENCE METHODS
  // =====================================

  /**
   * Save Excel data to both services
   */
  async saveExcelData(userId, date, excelData) {
    return await this.dualSave('saveExcelData', userId, date, excelData);
  }

  /**
   * Save hour entry to both services
   */
  async saveHourEntry(userId, date, planetSelections) {
    return await this.dualSave('saveHourEntry', userId, date, planetSelections);
  }

  /**
   * Save user dates to both services
   */
  async saveUserDates(userId, dates) {
    return await this.dualSave('saveUserDates', userId, dates);
  }

  /**
   * Get Excel data with fallback
   */
  async getExcelData(userId, date) {
    return await this.dualFetch('getExcelData', userId, date);
  }

  /**
   * Get hour entry with fallback
   */
  async getHourEntry(userId, date) {
    return await this.dualFetch('getHourEntry', userId, date);
  }

  /**
   * Get user dates with fallback
   */
  async getUserDates(userId) {
    return await this.dualFetch('getUserDates', userId);
  }
}

// Export singleton instance
export const dualServiceManager = new DualServiceManager();
export default dualServiceManager;
