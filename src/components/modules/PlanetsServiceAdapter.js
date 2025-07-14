// PlanetsServiceAdapter.js - Service adapter to handle different service patterns
// Bridges between dataService, fallbackDataService, and unifiedDataService

import { unifiedDataService } from '../../services/unifiedDataService';
import { dataService } from '../../services/dataService';
import { supabase } from '../../supabaseClient';

export class PlanetsServiceAdapter {
  constructor() {
    this.primaryService = unifiedDataService;
    this.fallbackService = dataService;
  }

  async fetchUsers() {
    try {
      const { data: usersData, error } = await supabase
        .from('users')
        .select('*')
        .order('username');
      
      if (error) throw error;
      return usersData || [];
    } catch (err) {
      console.error('Error fetching users:', err);
      throw new Error('Failed to load users');
    }
  }

  async getDates(userId) {
    try {
      return await this.primaryService.getDates(userId);
    } catch (error) {
      console.error('Primary service failed, trying fallback:', error);
      return await this.fallbackService.getDates(userId);
    }
  }

  async getExcelData(userId, date) {
    try {
      return await this.primaryService.getExcelData(userId, date);
    } catch (error) {
      console.error('Primary service failed, trying fallback:', error);
      return await this.fallbackService.getExcelData(userId, date);
    }
  }

  async getHourEntry(userId, date) {
    try {
      return await this.primaryService.getHourEntry(userId, date);
    } catch (error) {
      console.error('Primary service failed, trying fallback:', error);
      return await this.fallbackService.getHourEntry(userId, date);
    }
  }

  async saveExcelData(userId, date, data) {
    try {
      return await this.primaryService.saveExcelData(userId, date, data);
    } catch (error) {
      console.error('Primary service failed, trying fallback:', error);
      return await this.fallbackService.saveExcelData(userId, date, data);
    }
  }

  async saveHourEntry(userId, date, data) {
    try {
      return await this.primaryService.saveHourEntry(userId, date, data);
    } catch (error) {
      console.error('Primary service failed, trying fallback:', error);
      return await this.fallbackService.saveHourEntry(userId, date, data);
    }
  }
}

// Create singleton instance
export const planetsServiceAdapter = new PlanetsServiceAdapter();
