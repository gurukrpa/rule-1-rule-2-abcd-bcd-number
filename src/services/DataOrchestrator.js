import { UserModel } from '../models/UserModel';
import { HRDataModel } from '../models/HRDataModel';
import { DateModel } from '../models/DateModel';
import { HouseNumberModel } from '../models/HouseNumberModel';

export class DataOrchestrator {
  constructor(userId) {
    this.userId = userId;
    this.userModel = new UserModel(userId);
    this.hrDataModel = new HRDataModel(userId);
    this.houseNumberModel = new HouseNumberModel();
    this.dateModel = null;
  }

  async initialize() {
    try {
      // Step 1: Fetch user data
      const user = await this.userModel.fetch();
      
      // Step 2: Fetch HR data
      const hrData = await this.hrDataModel.fetch();
      
      // Step 3: Initialize date model with user's max days
      const initialDates = this.extractDatesFromHRData(hrData);
      this.dateModel = new DateModel(initialDates, user.days);
      
      // Step 4: Calculate house numbers
      const houseNumbers = this.houseNumberModel.calculate(hrData, initialDates, user.hr);

      return {
        user,
        hrData,
        dates: initialDates,
        houseNumbers,
        totalPages: this.dateModel.getTotalPages()
      };
    } catch (error) {
      throw new Error(`Initialization failed: ${error.message}`);
    }
  }

  async addNewDate(newDate) {
    try {
      if (!this.dateModel) throw new Error('Date model not initialized');

      // Store old dates before updating
      const oldDates = { ...this.dateModel.dates };
      
      // Add new date and get updated dates
      const { dates, totalPages } = this.dateModel.addNewDate(newDate);
      
      // Shift all HR data to match new date structure
      const hrData = await this.hrDataModel.shiftDataForNewDate(oldDates, dates);
      
      // Recalculate house numbers
      const houseNumbers = this.houseNumberModel.calculate(hrData, dates, this.data.user.hr);

      return {
        dates,
        totalPages,
        hrData,
        houseNumbers
      };
    } catch (error) {
      throw new Error(`Failed to add new date: ${error.message}`);
    }
  }

  async saveData(dates, formData, user) {
    try {
      // Step 1: Save HR data
      const updatedHRData = await this.hrDataModel.save(dates, formData, user);
      
      // Step 2: Recalculate house numbers
      const houseNumbers = this.houseNumberModel.calculate(updatedHRData, dates, user.hr);

      return {
        hrData: updatedHRData,
        houseNumbers
      };
    } catch (error) {
      throw new Error(`Failed to save data: ${error.message}`);
    }
  }

  getCurrentPageDates(currentPage) {
    return this.dateModel.getCurrentPageDates(currentPage);
  }

  getExistingDates() {
    return this.dateModel.getExistingDates();
  }

  private extractDatesFromHRData(hrData) {
    const initialDates = {};
    const uniqueDates = [...new Set(hrData
      .filter(d => d.topic.startsWith('DAY-'))
      .map(d => ({ 
        day: parseInt(d.topic.split('-')[1]),
        date: d.date 
      })))];

    uniqueDates.sort((a, b) => a.day - b.day);
    uniqueDates.forEach(({ day, date }) => {
      initialDates[day] = date;
    });

    return initialDates;
  }
}