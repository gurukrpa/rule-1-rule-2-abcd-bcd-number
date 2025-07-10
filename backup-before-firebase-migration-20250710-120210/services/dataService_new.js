// src/services/dataService_new.js
// Enhanced DataService with improved error handling and caching

import { DataService as OriginalDataService } from './dataService';

export class DataService extends OriginalDataService {
  constructor() {
    super();
    this.serviceName = 'DataService_New';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  getServiceInfo() {
    return {
      name: this.serviceName,
      cacheSize: this.cache.size,
      timestamp: new Date().toISOString()
    };
  }

  _getCacheKey(method, userId, date) {
    return `${method}_${userId}_${date}`;
  }

  _isValidCacheEntry(entry) {
    return entry && (Date.now() - entry.timestamp) < this.cacheTimeout;
  }

  async getExcelData(userId, date) {
    const cacheKey = this._getCacheKey('excel', userId, date);
    const cached = this.cache.get(cacheKey);
    
    if (this._isValidCacheEntry(cached)) {
      console.log(`🚀 [DataService_New] Cache hit for Excel data ${userId}/${date}`);
      return cached.data;
    }

    try {
      const result = await super.getExcelData(userId, date);
      if (result) {
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
      }
      return result;
    } catch (error) {
      console.error(`❌ [DataService_New] Error fetching Excel data:`, error);
      throw error;
    }
  }

  async getHourEntry(userId, date) {
    const cacheKey = this._getCacheKey('hour', userId, date);
    const cached = this.cache.get(cacheKey);
    
    if (this._isValidCacheEntry(cached)) {
      console.log(`🚀 [DataService_New] Cache hit for Hour Entry ${userId}/${date}`);
      return cached.data;
    }

    try {
      const result = await super.getHourEntry(userId, date);
      if (result) {
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
      }
      return result;
    } catch (error) {
      console.error(`❌ [DataService_New] Error fetching Hour Entry:`, error);
      throw error;
    }
  }

  clearCache() {
    this.cache.clear();
    console.log(`🧹 [DataService_New] Cache cleared`);
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      lastAccess: new Date().toISOString()
    };
  }
}
