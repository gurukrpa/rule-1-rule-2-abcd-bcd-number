// src/services/unifiedDataService.js
// Unified data service using CleanFirebaseService for pure Supabase implementation

import { cleanFirebaseService } from './CleanFirebaseService';

class UnifiedDataService {
  constructor() {
    this.service = cleanFirebaseService;
    this.serviceName = 'UnifiedDataService';
  }

  getServiceInfo() {
    return {
      name: this.serviceName,
      service: this.service.constructor.name,
      timestamp: new Date().toISOString()
    };
  }

  async getDates(userId) {
    try {
      console.log(`📅 [UnifiedDataService] Fetching dates for ${userId}`);
      
      const result = await this.service.getUserDates(userId);
      if (result && Array.isArray(result)) {
        console.log(`✅ [UnifiedDataService] Returned ${result.length} dates`);
        return result;
      }

      console.log(`❌ [UnifiedDataService] No dates found`);
      return [];
    } catch (error) {
      console.error(`❌ [UnifiedDataService] Error fetching dates:`, error);
      return [];
    }
  }

  async getExcelData(userId, date) {
    try {
      console.log(`📊 [UnifiedDataService] Fetching Excel data for ${userId} on ${date}`);
      
      const result = await this.service.getExcelData(userId, date);
      if (result && result.sets) {
        console.log(`✅ [UnifiedDataService] Returned Excel data`);
        return result;
      }

      console.log(`❌ [UnifiedDataService] No Excel data found`);
      return null;
    } catch (error) {
      console.error(`❌ [UnifiedDataService] Error fetching Excel data:`, error);
      return null;
    }
  }

  async getHourEntry(userId, date) {
    try {
      console.log(`⏰ [UnifiedDataService] Fetching Hour Entry for ${userId} on ${date}`);
      
      const result = await this.service.getHourEntry(userId, date);
      if (result && result.planetSelections) {
        console.log(`✅ [UnifiedDataService] Returned hour data with ${Object.keys(result.planetSelections).length} HR selections`);
        return result;
      } else if (result === null) {
        console.log(`ℹ️ [UnifiedDataService] No hour data found (this is normal for new dates)`);
      }

      return null;
    } catch (error) {
      console.error(`❌ [UnifiedDataService] Error fetching Hour Entry:`, error);
      return null;
    }
  }

  async saveExcelData(userId, date, data) {
    try {
      return await this.service.saveExcelData(userId, date, data);
    } catch (error) {
      console.error(`❌ [UnifiedDataService] Error saving Excel data:`, error);
      throw error;
    }
  }

  async saveHourEntry(userId, date, data) {
    try {
      return await this.service.saveHourEntry(userId, date, data);
    } catch (error) {
      console.error(`❌ [UnifiedDataService] Error saving Hour Entry:`, error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const unifiedDataService = new UnifiedDataService();
export default unifiedDataService;
