// src/services/OptimizedRule1Service.js
// High-performance service for Rule-1 page with aggressive optimization

import { supabase } from '../supabaseClient.js';

class OptimizedRule1Service {
  constructor() {
    this.supabase = supabase;
    this.cache = new Map();
    this.loadingCache = new Map(); // Prevent duplicate requests
    this.batchQueue = new Map();
    this.batchTimer = null;
    this.prefetchQueue = new Set();
    
    // Performance metrics
    this.metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      dbCalls: 0,
      avgResponseTime: 0,
      lastUpdate: Date.now()
    };
    
    console.log('🚀 OptimizedRule1Service initialized with advanced caching and batching');
  }

  // =====================================
  // 🎯 CACHE MANAGEMENT
  // =====================================

  getCacheKey(type, ...params) {
    return `${type}:${params.join(':')}`;
  }

  setCache(key, data, ttl = 300000) { // 5 minutes default TTL
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  getCache(key) {
    const cached = this.cache.get(key);
    if (!cached) {
      this.metrics.cacheMisses++;
      return null;
    }
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      this.metrics.cacheMisses++;
      return null;
    }
    
    this.metrics.cacheHits++;
    return cached.data;
  }

  clearCache(pattern = null) {
    if (!pattern) {
      this.cache.clear();
      console.log('🧹 All cache cleared');
      return;
    }
    
    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.includes(pattern)
    );
    keysToDelete.forEach(key => this.cache.delete(key));
    console.log(`🧹 Cleared ${keysToDelete.length} cache entries matching: ${pattern}`);
  }

  // =====================================
  // 🚀 OPTIMIZED DATA LOADING
  // =====================================

  async getOptimizedUserData(userId, dates) {
    const startTime = Date.now();
    const cacheKey = this.getCacheKey('userData', userId, dates.join(','));
    
    // Check cache first
    const cached = this.getCache(cacheKey);
    if (cached) {
      console.log(`⚡ Cache hit for user data: ${userId}`);
      return cached;
    }

    // Prevent duplicate requests
    if (this.loadingCache.has(cacheKey)) {
      console.log(`⏳ Request already in progress: ${userId}`);
      return await this.loadingCache.get(cacheKey);
    }

    // Start loading
    const loadingPromise = this._loadUserDataBatch(userId, dates);
    this.loadingCache.set(cacheKey, loadingPromise);

    try {
      const result = await loadingPromise;
      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime);
      
      // Cache the result
      this.setCache(cacheKey, result, 600000); // 10 minutes for user data
      
      console.log(`✅ Loaded user data for ${userId} in ${responseTime}ms`);
      return result;
    } finally {
      this.loadingCache.delete(cacheKey);
    }
  }

  async _loadUserDataBatch(userId, dates) {
    this.metrics.dbCalls++;
    
    // Single query to get all data at once
    const { data: excelData, error: excelError } = await this.supabase
      .from('excel_data')
      .select('*')
      .eq('user_id', userId)
      .in('date', dates);

    if (excelError) throw excelError;

    // Organize data by date
    const organizedData = {};
    excelData.forEach(record => {
      organizedData[record.date] = {
        success: true,
        data: record.data,
        fileName: record.file_name,
        lastModified: record.updated_at
      };
    });

    // Fill missing dates
    dates.forEach(date => {
      if (!organizedData[date]) {
        organizedData[date] = {
          success: false,
          error: 'No data available',
          data: null
        };
      }
    });

    return organizedData;
  }

  // =====================================
  // 🔥 RAPID CLICKED NUMBERS LOADING
  // =====================================

  async getClickedNumbers(userId, dateKeys, hours, topics) {
    const startTime = Date.now();
    const cacheKey = this.getCacheKey('clicks', userId, dateKeys.join(','), hours.join(','));
    
    // Check cache
    const cached = this.getCache(cacheKey);
    if (cached) {
      console.log(`⚡ Cache hit for clicked numbers: ${userId}`);
      return cached;
    }

    this.metrics.dbCalls++;

    // Single optimized query
    const { data, error } = await this.supabase
      .from('topic_clicks')
      .select('topic_name, date_key, hour, clicked_number, is_matched')
      .eq('user_id', userId)
      .in('date_key', dateKeys)
      .in('hour', hours)
      .in('topic_name', topics);

    if (error) throw error;

    // Organize by topic -> date -> hour -> numbers
    const organized = {};
    data.forEach(click => {
      const { topic_name, date_key, hour, clicked_number, is_matched } = click;
      
      if (!organized[topic_name]) organized[topic_name] = {};
      if (!organized[topic_name][date_key]) organized[topic_name][date_key] = {};
      if (!organized[topic_name][date_key][hour]) organized[topic_name][date_key][hour] = [];
      
      organized[topic_name][date_key][hour].push({
        number: clicked_number,
        isMatched: is_matched
      });
    });

    const responseTime = Date.now() - startTime;
    this.updateMetrics(responseTime);
    
    // Cache with shorter TTL for clicked numbers
    this.setCache(cacheKey, organized, 60000); // 1 minute
    
    console.log(`✅ Loaded clicked numbers in ${responseTime}ms`);
    return organized;
  }

  // =====================================
  // ⚡ BATCH CLICKING OPERATIONS
  // =====================================

  async batchClickNumbers(userId, clicks) {
    // clicks = [{ topicName, dateKey, hour, number, isClicked }]
    if (!clicks || clicks.length === 0) return;

    const startTime = Date.now();
    this.metrics.dbCalls++;

    // Separate inserts and deletes
    const inserts = clicks.filter(c => c.isClicked).map(c => ({
      user_id: userId,
      topic_name: c.topicName,
      date_key: c.dateKey,
      hour: c.hour,
      clicked_number: c.number,
      is_matched: false
    }));

    const deletes = clicks.filter(c => !c.isClicked);

    try {
      // Batch insert
      if (inserts.length > 0) {
        const { error: insertError } = await this.supabase
          .from('topic_clicks')
          .upsert(inserts, {
            onConflict: 'user_id,topic_name,date_key,hour,clicked_number'
          });
        
        if (insertError) throw insertError;
      }

      // Batch delete
      if (deletes.length > 0) {
        for (const del of deletes) {
          const { error: deleteError } = await this.supabase
            .from('topic_clicks')
            .delete()
            .eq('user_id', userId)
            .eq('topic_name', del.topicName)
            .eq('date_key', del.dateKey)
            .eq('hour', del.hour)
            .eq('clicked_number', del.number);
          
          if (deleteError) throw deleteError;
        }
      }

      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime);

      // Clear relevant cache
      this.clearCache(`clicks:${userId}`);
      
      console.log(`✅ Batch processed ${clicks.length} clicks in ${responseTime}ms`);
      return { success: true };
    } catch (error) {
      console.error('❌ Batch click operation failed:', error);
      throw error;
    }
  }

  // =====================================
  // 🎯 ANALYSIS RESULTS OPTIMIZATION
  // =====================================

  async getAnalysisResults(userId, dateKeys, hours) {
    const cacheKey = this.getCacheKey('analysis', userId, dateKeys.join(','), hours.join(','));
    
    const cached = this.getCache(cacheKey);
    if (cached) {
      console.log(`⚡ Cache hit for analysis results`);
      return cached;
    }

    this.metrics.dbCalls++;

    const { data, error } = await this.supabase
      .from('analysis_results')
      .select('*')
      .eq('user_id', userId)
      .in('date_key', dateKeys)
      .in('hour', hours);

    if (error) throw error;

    // Organize results
    const organized = {};
    data.forEach(result => {
      const { date_key, hour, topic_name, abcd_numbers, bcd_numbers } = result;
      
      if (!organized[date_key]) organized[date_key] = {};
      if (!organized[date_key][hour]) organized[date_key][hour] = {};
      
      organized[date_key][hour][topic_name] = {
        abcdNumbers: abcd_numbers || [],
        bcdNumbers: bcd_numbers || []
      };
    });

    // Cache for 5 minutes
    this.setCache(cacheKey, organized, 300000);
    
    return organized;
  }

  // =====================================
  // 🚀 PREFETCHING SYSTEM
  // =====================================

  async prefetchData(userId, allDates, allHours, allTopics) {
    console.log('🔮 Starting intelligent prefetching...');
    
    // Prefetch in background without blocking UI
    setTimeout(async () => {
      try {
        // Prefetch next/prev dates
        const adjacentDates = this.getAdjacentDates(allDates);
        if (adjacentDates.length > 0) {
          await this.getOptimizedUserData(userId, adjacentDates);
        }

        // Prefetch all hours for current date
        const currentDate = allDates[0]; // Assuming first date is current
        if (currentDate) {
          await this.getClickedNumbers(userId, [currentDate], allHours, allTopics);
          await this.getAnalysisResults(userId, [currentDate], allHours);
        }
        
        console.log('✅ Prefetching completed');
      } catch (error) {
        console.log('⚠️ Prefetching error (non-critical):', error.message);
      }
    }, 1000); // Start after 1 second
  }

  getAdjacentDates(dates, current = 0, count = 2) {
    const adjacent = [];
    const sortedDates = [...dates].sort();
    const currentIndex = sortedDates.indexOf(dates[current]);
    
    // Previous dates
    for (let i = Math.max(0, currentIndex - count); i < currentIndex; i++) {
      adjacent.push(sortedDates[i]);
    }
    
    // Next dates
    for (let i = currentIndex + 1; i <= Math.min(sortedDates.length - 1, currentIndex + count); i++) {
      adjacent.push(sortedDates[i]);
    }
    
    return adjacent;
  }

  // =====================================
  // 📊 PERFORMANCE MONITORING
  // =====================================

  updateMetrics(responseTime) {
    this.metrics.avgResponseTime = (this.metrics.avgResponseTime + responseTime) / 2;
    this.metrics.lastUpdate = Date.now();
  }

  getPerformanceStats() {
    const cacheHitRate = this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) * 100;
    
    return {
      ...this.metrics,
      cacheHitRate: Math.round(cacheHitRate),
      cacheSize: this.cache.size,
      loadingQueueSize: this.loadingCache.size
    };
  }

  printPerformanceReport() {
    const stats = this.getPerformanceStats();
    console.log('📊 Performance Report:', {
      cacheHitRate: `${stats.cacheHitRate}%`,
      avgResponseTime: `${Math.round(stats.avgResponseTime)}ms`,
      totalDbCalls: stats.dbCalls,
      cacheSize: stats.cacheSize
    });
  }

  // =====================================
  // 🧹 CLEANUP & MAINTENANCE
  // =====================================

  cleanup() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }
    this.cache.clear();
    this.loadingCache.clear();
    this.batchQueue.clear();
    console.log('🧹 OptimizedRule1Service cleaned up');
  }
}

// Export singleton instance
export const optimizedRule1Service = new OptimizedRule1Service();
export default optimizedRule1Service;
