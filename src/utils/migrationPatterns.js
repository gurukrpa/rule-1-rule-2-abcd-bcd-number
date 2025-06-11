// Example of how to gradually migrate ABCDBCDNumber.jsx to use DataService
// This shows the pattern for migrating one function at a time

import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';

// Example: Migrate the loadUserDates function
export const migratedLoadUserDates = async (userId, setDatesList, setSelectedDate) => {
  try {
    console.log('🔄 Loading dates using DataService for user:', userId);
    
    // Use the new DataService instead of direct localStorage
    const dates = await dataService.getDates(userId);
    
    if (dates.length > 0) {
      const sorted = dates.sort((a, b) => new Date(b) - new Date(a));
      setDatesList(sorted);
      setSelectedDate(sorted[0]);
      console.log('✅ Dates loaded from DataService:', sorted);
    } else {
      setDatesList([]);
      setSelectedDate('');
      console.log('📭 No dates found');
    }
  } catch (error) {
    console.error('❌ Error loading dates with DataService:', error);
    // Fallback is built into DataService, so this should not fail
    setDatesList([]);
    setSelectedDate('');
  }
};

// Example: Migrate the handleAddDate function
export const migratedHandleAddDate = async (
  newDate, 
  selectedUser, 
  datesList, 
  setDatesList, 
  setSelectedDate, 
  setNewDate, 
  setDateError, 
  setShowAddDateModal, 
  setSuccess
) => {
  if (!newDate) {
    setDateError('Please select a date.');
    return;
  }
  
  if (!selectedUser) {
    setDateError('Please select a user first.');
    return;
  }
  
  try {
    console.log('🔄 Adding date using DataService:', newDate);
    
    const iso = new Date(newDate).toISOString().split('T')[0];
    const normalized = datesList.map(d => new Date(d).toISOString().split('T')[0]);
    
    if (normalized.includes(iso)) {
      setDateError('This date already exists.');
      return;
    }
    
    const updated = [...datesList, iso].sort((a, b) => new Date(b) - new Date(a));
    
    // Use DataService instead of direct localStorage
    await dataService.saveDates(selectedUser, updated);
    
    setDatesList(updated);
    setSelectedDate(iso);
    setNewDate('');
    setDateError('');
    setShowAddDateModal(false);
    
    setSuccess(`Date ${new Date(iso).toLocaleDateString()} added successfully.`);
    setTimeout(() => setSuccess(''), 3000);
    
    console.log('✅ Date added successfully using DataService');
  } catch (error) {
    console.error('❌ Error adding date with DataService:', error);
    setDateError('An error occurred. Try again.');
  }
};

// Example: Migrate the Excel upload function
export const migratedHandleExcelUpload = async (
  targetDate,
  file,
  selectedUser,
  setSuccess,
  setError,
  setDatesList,
  datesList
) => {
  try {
    console.log('🔄 Processing Excel upload using DataService:', { targetDate, fileName: file.name });
    
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          // Process the Excel data (your existing logic)
          const processedData = processSingleDayExcel(jsonData, targetDate);
          
          // Use DataService instead of direct localStorage
          const excelData = {
            fileName: file.name,
            data: processedData,
            uploadedAt: new Date().toISOString()
          };
          
          await dataService.saveExcelData(selectedUser, targetDate, excelData);
          
          setSuccess(`Excel uploaded successfully for ${new Date(targetDate).toLocaleDateString()}`);
          setTimeout(() => setSuccess(''), 3000);
          
          // Trigger re-render by updating datesList
          setDatesList([...datesList]);
          
          console.log('✅ Excel data saved using DataService');
          resolve();
        } catch (error) {
          console.error('❌ Error processing Excel with DataService:', error);
          setError(`Failed to process Excel file: ${error.message}`);
          setTimeout(() => setError(''), 5000);
          reject(error);
        }
      };

      reader.readAsArrayBuffer(file);
    });
  } catch (error) {
    console.error('❌ Error in Excel upload with DataService:', error);
    setError(`Failed to upload file: ${error.message}`);
    setTimeout(() => setError(''), 5000);
    throw error;
  }
};

// Example: Migrate the hour entry save function
export const migratedSaveHourEntry = async (
  selectedUser,
  hourEntryDate,
  hourEntryPlanetSelections,
  setShowHourEntryModal,
  setSuccess,
  setHourEntryError
) => {
  try {
    console.log('🔄 Saving hour entry using DataService:', { date: hourEntryDate });
    
    const hourEntryData = {
      planetSelections: hourEntryPlanetSelections,
      savedAt: new Date().toISOString()
    };
    
    // Use DataService instead of direct localStorage
    await dataService.saveHourEntry(selectedUser, hourEntryDate, hourEntryData);
    
    setShowHourEntryModal(false);
    setSuccess(`Hour entry saved for ${new Date(hourEntryDate).toLocaleDateString()}.`);
    setTimeout(() => setSuccess(''), 3000);
    
    console.log('✅ Hour entry saved using DataService');
  } catch (error) {
    console.error('❌ Error saving hour entry with DataService:', error);
    setHourEntryError('Failed to save. Try again.');
  }
};

// Example: Migrate the data checking functions
export const migratedIsExcelUploaded = async (selectedUser, date) => {
  try {
    return await dataService.hasExcelData(selectedUser, date);
  } catch (error) {
    console.error('❌ Error checking Excel data:', error);
    return false;
  }
};

export const migratedIsHourEntryCompleted = async (selectedUser, date) => {
  try {
    return await dataService.hasHourEntry(selectedUser, date);
  } catch (error) {
    console.error('❌ Error checking hour entry:', error);
    return false;
  }
};

// Example: Migrate the date removal function
export const migratedHandleRemoveDate = async (
  dateToRemove,
  selectedUser,
  datesList,
  setDatesList,
  selectedDate,
  setSelectedDate,
  setSuccess
) => {
  try {
    console.log('🔄 Removing date using DataService:', dateToRemove);
    
    const updated = datesList.filter(d => d !== dateToRemove);
    
    // Save updated dates list
    await dataService.saveDates(selectedUser, updated);
    
    // Delete all data for this date
    await dataService.deleteDataForDate(selectedUser, dateToRemove);
    
    setDatesList(updated);
    
    if (selectedDate === dateToRemove) {
      if (updated.length > 0) setSelectedDate(updated[0]);
      else setSelectedDate('');
    }
    
    const first = datesList[0];
    const label = dateToRemove === first ? 'Newest' : 'Oldest';
    setSuccess(`${label} date ${new Date(dateToRemove).toLocaleDateString()} removed.`);
    setTimeout(() => setSuccess(''), 3000);
    
    console.log('✅ Date removed using DataService');
  } catch (error) {
    console.error('❌ Error removing date with DataService:', error);
    throw error;
  }
};

// Migration pattern: How to replace functions in your component
export const migrationPatterns = {
  // BEFORE (original localStorage approach):
  loadUserDatesOld: (uid) => {
    try {
      const cached = localStorage.getItem(`abcd_dates_${uid}`);
      if (cached) {
        const arr = JSON.parse(cached);
        if (Array.isArray(arr) && arr.length > 0) {
          const sorted = arr.sort((a, b) => new Date(b) - new Date(a));
          return sorted;
        }
      }
      return [];
    } catch (e) {
      return [];
    }
  },

  // AFTER (new DataService approach):
  loadUserDatesNew: async (uid) => {
    try {
      return await dataService.getDates(uid);
    } catch (error) {
      console.error('Error loading dates:', error);
      return [];
    }
  }
};

console.log(`
🔄 MIGRATION PATTERNS LOADED

To migrate your ABCDBCDNumber component:

1. Replace localStorage calls with DataService methods
2. Make functions async where needed
3. Add proper error handling
4. Update useEffect hooks to handle async operations

Example replacements:
- localStorage.getItem() → dataService.getDates()
- localStorage.setItem() → dataService.saveDates()
- Direct localStorage access → DataService methods

The DataService automatically handles localStorage fallback!
`);
