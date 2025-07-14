/**
 * Database Service Switcher
 * Centralized configuration to switch between Firebase and Supabase
 */

// Service configuration
const SERVICE_CONFIG = {
  // Switch this to toggle between 'firebase' and 'supabase'
  ACTIVE_SERVICE: 'supabase', // Changed from 'firebase' to 'supabase'
  
  // Service status
  SERVICES: {
    firebase: {
      enabled: false, // Paused
      name: 'Firebase',
      description: 'Google Firebase Firestore & Authentication'
    },
    supabase: {
      enabled: true, // Active
      name: 'Supabase',
      description: 'Supabase PostgreSQL & Authentication'
    }
  }
};

// Import services
import { firebaseAuthService } from './FirebaseAuthService.js';
import { supabaseAuthService } from './SupabaseAuthService.js';
import { cleanSupabaseService } from './CleanSupabaseService.js';

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
}

// Create and export singleton instance
export const databaseServiceSwitcher = new DatabaseServiceSwitcher();
export default databaseServiceSwitcher;

// Export configuration for external access
export { SERVICE_CONFIG };
