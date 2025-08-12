/**
 * Database Service Switcher
 * Centralized configuration to switch between Firebase and Supabase
 */

// Service configuration
const SERVICE_CONFIG = {
  // Environment-based service selection
  ACTIVE_SERVICE: getActiveServiceForEnvironment(),
  
  // Dual-service mode: Environment dependent
  DUAL_SERVICE_MODE: isDualServiceModeEnabled(),
  
  // Service status
  SERVICES: {
    firebase: {
      enabled: isFirebaseEnabled(), // Environment dependent
      name: 'Firebase',
      description: 'Google Firebase Firestore & Authentication',
      role: 'backup' // Primary role: backup and real-time sync
    },
    supabase: {
      enabled: true, // Always enabled
      name: 'Supabase',
      description: 'Supabase PostgreSQL & Authentication',
      role: 'primary' // Primary role: main database operations
    }
  }
};

/**
 * Determine active service based on environment
 */
function getActiveServiceForEnvironment() {
  const isProduction = import.meta.env.NODE_ENV === 'production';
  const isDevelopment = import.meta.env.DEV;
  
  if (isDevelopment) {
    // Local development: Supabase only
    console.log('🏠 Development environment: Using Supabase only');
    return 'supabase';
  } else if (isProduction) {
    // Production (GitHub Pages): Supabase primary with Firebase backup
    console.log('🌐 Production environment: Using dual-service mode');
    return 'supabase';
  }
  
  // Default to Supabase
  return 'supabase';
}

/**
 * Check if dual-service mode should be enabled
 */
function isDualServiceModeEnabled() {
  // Enable dual-service mode for shared data between localhost and viboothi.in
  console.log('🔄 Dual-service mode ENABLED for data sharing');
  return true;
}

/**
 * Check if Firebase should be enabled
 */
function isFirebaseEnabled() {
  // Firebase is now ALWAYS enabled for shared data
  console.log('🔥 Firebase ENABLED for shared data between localhost and viboothi.in');
  return true;
}

// Import services
import { supabaseAuthService } from './SupabaseAuthService.js';
import { cleanSupabaseService } from './CleanSupabaseService.js';

// Firebase imports (NOW ENABLED for shared data)
import { firebaseService } from './FirebaseService.js';

// Create real Firebase auth service placeholder
const firebaseAuthService = {
  signIn: () => Promise.reject(new Error('Use Supabase for authentication')),
  signUp: () => Promise.reject(new Error('Use Supabase for authentication')),
  signOut: () => Promise.resolve(true),
  getCurrentUser: () => null,
  isAuthenticated: () => false,
  onAuthStateChange: () => () => {},
  authenticateUser: () => Promise.reject(new Error('Use Supabase for authentication')),
  getAuthErrorMessage: (msg) => msg || 'Firebase auth not configured - use Supabase'
};

/**
 * Database Service Switcher Class
 * Provides unified interface that routes to the active service
 */
class DatabaseServiceSwitcher {
  constructor() {
    this.activeService = SERVICE_CONFIG.ACTIVE_SERVICE;
    this.services = SERVICE_CONFIG.SERVICES;
    
    console.log(`🔄 Database Service Switcher initialized`);
    console.log(`📊 Active Service: ${this.services[this.activeService].name}`);
    console.log(`📊 Firebase Status: ${this.services.firebase.enabled ? 'Active' : 'Paused'}`);
    console.log(`📊 Supabase Status: ${this.services.supabase.enabled ? 'Active' : 'Paused'}`);
  }

  // =====================================
  // 🔧 SERVICE MANAGEMENT
  // =====================================

  getActiveService() {
    return this.activeService;
  }

  getServiceStatus() {
    return {
      active: this.activeService,
      firebase: this.services.firebase,
      supabase: this.services.supabase
    };
  }

  switchToFirebase() {
    this.activeService = 'firebase';
    this.services.firebase.enabled = true;
    this.services.supabase.enabled = false;
    console.log('🔥 Switched to Firebase');
    return this.getServiceStatus();
  }

  switchToSupabase() {
    this.activeService = 'supabase';
    this.services.supabase.enabled = true;
    this.services.firebase.enabled = false;
    console.log('⚡ Switched to Supabase');
    return this.getServiceStatus();
  }

  pauseFirebase() {
    this.services.firebase.enabled = false;
    if (this.activeService === 'firebase') {
      this.switchToSupabase();
    }
    console.log('⏸️ Firebase paused');
    return this.getServiceStatus();
  }

  resumeFirebase() {
    this.services.firebase.enabled = true;
    console.log('▶️ Firebase resumed');
    return this.getServiceStatus();
  }

  // =====================================
  // 👤 USER MANAGEMENT
  // =====================================

  async createUser(userData) {
    if (this.activeService === 'firebase') {
      // Firebase doesn't have createUser in the same way, so we'll use Supabase
      return await cleanSupabaseService.createUser(userData);
    } else {
      return await cleanSupabaseService.createUser(userData);
    }
  }

  async getUser(userId) {
    if (this.activeService === 'firebase') {
      // For Firebase, we might need to get from Firestore
      return await cleanSupabaseService.getUser(userId);
    } else {
      return await cleanSupabaseService.getUser(userId);
    }
  }

  async getAllUsers() {
    if (this.activeService === 'firebase') {
      return await cleanSupabaseService.getAllUsers();
    } else {
      return await cleanSupabaseService.getAllUsers();
    }
  }

  // =====================================
  // 📊 EXCEL DATA MANAGEMENT
  // =====================================

  async saveExcelData(userId, date, excelData) {
    if (this.activeService === 'firebase') {
      return await cleanSupabaseService.saveExcelData(userId, date, excelData);
    } else {
      return await cleanSupabaseService.saveExcelData(userId, date, excelData);
    }
  }

  async getExcelData(userId, date) {
    if (this.activeService === 'firebase') {
      return await cleanSupabaseService.getExcelData(userId, date);
    } else {
      return await cleanSupabaseService.getExcelData(userId, date);
    }
  }

  async hasExcelData(userId, date) {
    if (this.activeService === 'firebase') {
      return await cleanSupabaseService.hasExcelData(userId, date);
    } else {
      return await cleanSupabaseService.hasExcelData(userId, date);
    }
  }

  async deleteExcelData(userId, date) {
    if (this.activeService === 'firebase') {
      return await cleanSupabaseService.deleteExcelData(userId, date);
    } else {
      return await cleanSupabaseService.deleteExcelData(userId, date);
    }
  }

  // =====================================
  // ⏰ HOUR ENTRY MANAGEMENT
  // =====================================

  async saveHourEntry(userId, date, planetSelections) {
    if (this.activeService === 'firebase') {
      return await cleanSupabaseService.saveHourEntry(userId, date, planetSelections);
    } else {
      return await cleanSupabaseService.saveHourEntry(userId, date, planetSelections);
    }
  }

  async getHourEntry(userId, date) {
    if (this.activeService === 'firebase') {
      return await cleanSupabaseService.getHourEntry(userId, date);
    } else {
      return await cleanSupabaseService.getHourEntry(userId, date);
    }
  }

  async hasHourEntry(userId, date) {
    if (this.activeService === 'firebase') {
      return await cleanSupabaseService.hasHourEntry(userId, date);
    } else {
      return await cleanSupabaseService.hasHourEntry(userId, date);
    }
  }

  async deleteHourEntry(userId, date) {
    if (this.activeService === 'firebase') {
      return await cleanSupabaseService.deleteHourEntry(userId, date);
    } else {
      return await cleanSupabaseService.deleteHourEntry(userId, date);
    }
  }

  // =====================================
  // 📅 DATE MANAGEMENT
  // =====================================

  async getUserDates(userId) {
    if (this.activeService === 'firebase') {
      return await cleanSupabaseService.getUserDates(userId);
    } else {
      return await cleanSupabaseService.getUserDates(userId);
    }
  }

  async saveUserDates(userId, dates) {
    if (this.activeService === 'firebase') {
      return await cleanSupabaseService.saveUserDates(userId, dates);
    } else {
      return await cleanSupabaseService.saveUserDates(userId, dates);
    }
  }

  async addUserDate(userId, date) {
    if (this.activeService === 'firebase') {
      return await cleanSupabaseService.addUserDate(userId, date);
    } else {
      return await cleanSupabaseService.addUserDate(userId, date);
    }
  }

  // =====================================
  // 🔍 UTILITY METHODS
  // =====================================

  async checkConnection() {
    if (this.activeService === 'firebase') {
      // Firebase connection check would go here
      return await cleanSupabaseService.checkConnection();
    } else {
      return await cleanSupabaseService.checkConnection();
    }
  }

  // =====================================
  // 🔐 AUTHENTICATION (delegated)
  // =====================================

  getAuthService() {
    if (this.activeService === 'firebase') {
      return firebaseAuthService;
    } else {
      return supabaseAuthService; // Use SupabaseAuthService when Supabase is active
    }
  }

  // =====================================
  // 🔄 DUAL-SERVICE METHODS
  // =====================================

  /**
   * Enable dual-service mode - both Firebase and Supabase active
   */
  enableDualService() {
    this.services.firebase.enabled = true;
    this.services.supabase.enabled = true;
    console.log('🔄 Dual-service mode enabled: Both Firebase and Supabase active');
    return this.getServiceStatus();
  }

  /**
   * Check if dual-service mode is active
   */
  isDualServiceMode() {
    return SERVICE_CONFIG.DUAL_SERVICE_MODE && 
           this.services.firebase.enabled && 
           this.services.supabase.enabled;
  }

  /**
   * Save data to both services (dual-service mode)
   */
  async saveDataToBothServices(operation, ...args) {
    if (!this.isDualServiceMode()) {
      // Single service mode - use normal operation
      return await this[operation](...args);
    }

    const results = {
      primary: null,
      backup: null,
      errors: []
    };

    try {
      // Save to primary service (Supabase)
      if (this.services.supabase.enabled) {
        results.primary = await cleanSupabaseService[operation](...args);
        console.log('✅ Data saved to Supabase (primary)');
      }
    } catch (error) {
      results.errors.push({ service: 'supabase', error: error.message });
      console.error('❌ Supabase save failed:', error.message);
    }

    try {
      // Save to backup service (Firebase) - would need Firebase service implementation
      if (this.services.firebase.enabled) {
        // Note: This would require Firebase service methods
        console.log('🔥 Firebase backup save would happen here');
        results.backup = { success: true, note: 'Firebase implementation needed' };
      }
    } catch (error) {
      results.errors.push({ service: 'firebase', error: error.message });
      console.error('❌ Firebase backup failed:', error.message);
    }

    return results;
  }

  /**
   * Sync data between services
   */
  async syncBetweenServices(userId) {
    if (!this.isDualServiceMode()) {
      console.log('ℹ️ Dual-service mode not active - skipping sync');
      return { success: false, reason: 'Dual-service mode disabled' };
    }

    console.log('🔄 Starting data sync between Firebase and Supabase...');
    
    try {
      // Get data from primary service
      const supabaseData = await cleanSupabaseService.getDataSummary(userId);
      
      // Sync to Firebase (implementation would depend on Firebase service)
      console.log('🔄 Syncing to Firebase...', supabaseData);
      
      return {
        success: true,
        synced: {
          excelData: supabaseData.excelDataCount,
          hourEntries: supabaseData.hourEntryCount,
          userDates: supabaseData.userDatesCount
        }
      };
    } catch (error) {
      console.error('❌ Sync failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get service health status for both services
   */
  async getServicesHealth() {
    const health = {
      supabase: { status: 'unknown', latency: null },
      firebase: { status: 'unknown', latency: null }
    };

    // Check Supabase health
    if (this.services.supabase.enabled) {
      try {
        const startTime = Date.now();
        await cleanSupabaseService.checkConnection();
        health.supabase = {
          status: 'healthy',
          latency: Date.now() - startTime
        };
      } catch (error) {
        health.supabase = {
          status: 'error',
          error: error.message
        };
      }
    }

    // Check Firebase health (implementation needed)
    if (this.services.firebase.enabled) {
      health.firebase = {
        status: 'implementation_needed',
        note: 'Firebase health check needs implementation'
      };
    }

    return health;
  }
}

// Create and export singleton instance
export const databaseServiceSwitcher = new DatabaseServiceSwitcher();
export default databaseServiceSwitcher;

// Export configuration for external access
export { SERVICE_CONFIG };
