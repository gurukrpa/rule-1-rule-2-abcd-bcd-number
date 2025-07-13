// src/services/unifiedDataService.js
// Unified data service that combines all data access patterns

import { cleanSupabaseService } from './CleanSupabaseService';
import { DataService } from './dataService';

class UnifiedDataService {
  constructor() {
    this.primaryService = cleanSupabaseService;
    this.fallbackService = new DataService();
    this.serviceName = 'UnifiedDataService';
  }

  getServiceInfo() {
    return {
      name: this.serviceName,
      primary: this.primaryService.constructor.name,
      fallback: this.fallbackService.constructor.name,
      timestamp: new Date().toISOString()
    };
  }

  async getDates(userId) {
    try {
      console.log(`📅 [UnifiedDataService] Fetching dates for ${userId}`);
      
      // Try primary service first (CleanSupabaseService)
      const primaryResult = await this.primaryService.getUserDates(userId);
      if (primaryResult && Array.isArray(primaryResult)) {
        console.log(`✅ [UnifiedDataService] Primary service returned ${primaryResult.length} dates`);
        return primaryResult;
      }

      // Fallback to secondary service (DataService)
      console.log(`🔄 [UnifiedDataService] Primary failed, trying fallback service`);
      const fallbackResult = await this.fallbackService.getDates(userId);
      if (fallbackResult && Array.isArray(fallbackResult)) {
        console.log(`✅ [UnifiedDataService] Fallback service returned ${fallbackResult.length} dates`);
        return fallbackResult;
      }

      console.log(`❌ [UnifiedDataService] No dates found in any service`);
      return [];
    } catch (error) {
      console.error(`❌ [UnifiedDataService] Error fetching dates:`, error);
      return [];
    }
  }

  async getExcelData(userId, date) {
    try {
      console.log(`📊 [UnifiedDataService] Fetching Excel data for ${userId} on ${date}`);
      
      // Try primary service first
      const primaryResult = await this.primaryService.getExcelData(userId, date);
      if (primaryResult && primaryResult.sets) {
        console.log(`✅ [UnifiedDataService] Primary service returned data`);
        return primaryResult;
      }

      // Fallback to secondary service
      console.log(`🔄 [UnifiedDataService] Primary failed, trying fallback service`);
      const fallbackResult = await this.fallbackService.getExcelData(userId, date);
      if (fallbackResult) {
        console.log(`✅ [UnifiedDataService] Fallback service returned data`);
        return fallbackResult;
      }

      console.log(`❌ [UnifiedDataService] No data found in any service`);
      return null;
    } catch (error) {
      console.error(`❌ [UnifiedDataService] Error fetching Excel data:`, error);
      return null;
    }
  }

  async getHourEntry(userId, date) {
    try {
      console.log(`⏰ [UnifiedDataService] Fetching Hour Entry for ${userId} on ${date}`);
      
      // Try primary service first
      let primaryResult = null;
      try {
        primaryResult = await this.primaryService.getHourEntry(userId, date);
        if (primaryResult && primaryResult.planetSelections) {
          console.log(`✅ [UnifiedDataService] Primary service returned hour data with ${Object.keys(primaryResult.planetSelections).length} HR selections`);
          return primaryResult;
        } else if (primaryResult === null) {
          console.log(`ℹ️ [UnifiedDataService] Primary service found no data (this is normal for new dates)`);
        }
      } catch (primaryError) {
        console.warn(`⚠️ [UnifiedDataService] Primary service error (will try fallback):`, primaryError.message);
      }

      // Fallback to secondary service
      console.log(`🔄 [UnifiedDataService] Trying fallback service...`);
      let fallbackResult = null;
      try {
        fallbackResult = await this.fallbackService.getHourEntry(userId, date);
        if (fallbackResult && fallbackResult.planetSelections) {
          console.log(`✅ [UnifiedDataService] Fallback service returned hour data with ${Object.keys(fallbackResult.planetSelections).length} HR selections`);
          return fallbackResult;
        } else if (fallbackResult === null) {
          console.log(`ℹ️ [UnifiedDataService] Fallback service also found no data`);
        }
      } catch (fallbackError) {
        console.warn(`⚠️ [UnifiedDataService] Fallback service error:`, fallbackError.message);
      }

      console.log(`ℹ️ [UnifiedDataService] No hour data found for ${userId} on ${date} (this is normal for new dates - upload Excel and create hour entries)`);
      return null;
    } catch (error) {
      console.error(`❌ [UnifiedDataService] Unexpected error fetching Hour Entry:`, error);
      return null;
    }
  }

  async saveExcelData(userId, date, data) {
    try {
      return await this.primaryService.saveExcelData(userId, date, data);
    } catch (error) {
      console.error(`❌ [UnifiedDataService] Error saving Excel data:`, error);
      return await this.fallbackService.saveExcelData(userId, date, data);
    }
  }

  async saveHourEntry(userId, date, data) {
    try {
      return await this.primaryService.saveHourEntry(userId, date, data);
    } catch (error) {
      console.error(`❌ [UnifiedDataService] Error saving Hour Entry:`, error);
      return await this.fallbackService.saveHourEntry(userId, date, data);
    }
  }
}

// Create and export a singleton instance
export const unifiedDataService = new UnifiedDataService();
export default unifiedDataService;
