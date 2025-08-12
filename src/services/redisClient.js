// src/services/redisClient.js
// Mock Redis client for local development

class MockRedisClient {
  constructor() {
    this.cache = new Map();
    this.serviceName = 'MockRedisClient';
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
  }

  async get(key) {
    if (this.cache.has(key)) {
      this.stats.hits++;
      const entry = this.cache.get(key);
      console.log(`🚀 [MockRedis] Cache hit for key: ${key}`);
      return JSON.stringify(entry.data);
    }
    this.stats.misses++;
    console.log(`❌ [MockRedis] Cache miss for key: ${key}`);
    return null;
  }

  async set(key, value, ttl = 3600) {
    this.cache.set(key, {
      data: JSON.parse(value),
      timestamp: Date.now(),
      ttl: ttl * 1000
    });
    this.stats.sets++;
    console.log(`💾 [MockRedis] Cache set for key: ${key} (TTL: ${ttl}s)`);
  }

  async del(key) {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
      console.log(`🗑️ [MockRedis] Cache deleted for key: ${key}`);
    }
    return deleted ? 1 : 0;
  }

  async exists(key) {
    return this.cache.has(key) ? 1 : 0;
  }

  async flushall() {
    this.cache.clear();
    console.log(`🧹 [MockRedis] Cache cleared completely`);
  }

  getStats() {
    return {
      ...this.stats,
      cacheSize: this.cache.size,
      serviceName: this.serviceName
    };
  }

  // Clean expired entries
  cleanExpired() {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`🧹 [MockRedis] Cleaned ${cleanedCount} expired entries`);
    }
    
    return cleanedCount;
  }
}

// Create and export a singleton instance
export const redisCache = new MockRedisClient();

// Clean expired entries every 5 minutes
setInterval(() => {
  redisCache.cleanExpired();
}, 5 * 60 * 1000);

export default redisCache;
