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
      const primaryResult = await this.primaryService.getHourEntry(userId, date);
      if (primaryResult && primaryResult.planetSelections) {
        console.log(`✅ [UnifiedDataService] Primary service returned hour data`);
        return primaryResult;
      }

      // Fallback to secondary service
      console.log(`🔄 [UnifiedDataService] Primary failed, trying fallback service`);
      const fallbackResult = await this.fallbackService.getHourEntry(userId, date);
      if (fallbackResult) {
        console.log(`✅ [UnifiedDataService] Fallback service returned hour data`);
        return fallbackResult;
      }

      console.log(`❌ [UnifiedDataService] No hour data found in any service`);
      return null;
    } catch (error) {
      console.error(`❌ [UnifiedDataService] Error fetching Hour Entry:`, error);
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
