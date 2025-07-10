// PlanetsServiceAdapter.js - Service adapter using pure Supabase implementation
// Uses CleanFirebaseService through unifiedDataService

import { unifiedDataService } from '../../services/unifiedDataService';
import { supabase } from '../../supabaseClient';

export class PlanetsServiceAdapter {
  constructor() {
    this.service = unifiedDataService;
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
      return await this.service.getDates(userId);
    } catch (error) {
      console.error('Error getting dates:', error);
      throw error;
    }
  }

  async getExcelData(userId, date) {
    try {
      return await this.service.getExcelData(userId, date);
    } catch (error) {
      console.error('Error getting Excel data:', error);
      throw error;
    }
  }

  async getHourEntry(userId, date) {
    try {
      return await this.service.getHourEntry(userId, date);
    } catch (error) {
      console.error('Error getting hour entry:', error);
      throw error;
    }
  }

  async saveExcelData(userId, date, data) {
    try {
      return await this.service.saveExcelData(userId, date, data);
    } catch (error) {
      console.error('Error saving Excel data:', error);
      throw error;
    }
  }

  async saveHourEntry(userId, date, data) {
    try {
      return await this.service.saveHourEntry(userId, date, data);
    } catch (error) {
      console.error('Error saving hour entry:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const planetsServiceAdapter = new PlanetsServiceAdapter();
