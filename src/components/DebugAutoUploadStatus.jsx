import React, { useState } from 'react';
import { cleanSupabaseService } from '../services/CleanSupabaseService';

// Temporary debug component to help diagnose auto-upload status bug
// Add this to ABCDBCDNumber.jsx temporarily to debug the issue

const DebugAutoUploadStatus = ({ selectedUser, datesList }) => {
  const [debugResults, setDebugResults] = useState(null);
  const [isDebugging, setIsDebugging] = useState(false);

  const runDebugCheck = async () => {
    if (!selectedUser) {
      alert('Please select a user first');
      return;
    }

    setIsDebugging(true);
    setDebugResults(null);

    try {
      console.log('🔍 [DEBUG COMPONENT] Starting debug check...');
      
      const results = {
        user: selectedUser,
        timestamp: new Date().toISOString(),
        checks: [],
        localStorage: {},
        recommendations: []
      };

      // Check each date
      for (const date of datesList) {
        console.log(`📅 [DEBUG] Checking date: ${date}`);
        
        const excelResult = await cleanSupabaseService.hasExcelData(selectedUser, date);
        const hourResult = await cleanSupabaseService.hasHourEntry(selectedUser, date);
        
        results.checks.push({
          date,
          excel: excelResult,
          hour: hourResult,
          shouldShowGreen: excelResult || hourResult,
          isNewDate: !excelResult && !hourResult
        });
      }

      // Check localStorage for interfering data
      const allKeys = Object.keys(localStorage);
      const relevantKeys = allKeys.filter(key => 
        key.includes(selectedUser) || 
        key.includes('abcd_') ||
        key.includes('excel') ||
        key.includes('hour') ||
        key.includes('status')
      );

      relevantKeys.forEach(key => {
        try {
          const value = localStorage.getItem(key);
          results.localStorage[key] = JSON.parse(value);
        } catch {
          results.localStorage[key] = value;
        }
      });

      // Generate recommendations
      const problematicDates = results.checks.filter(check => check.shouldShowGreen && check.isNewDate);
      if (problematicDates.length > 0) {
        results.recommendations.push('❌ Found dates that show green but should be red - this indicates the bug is active');
        results.recommendations.push('🧹 Clear localStorage and refresh the page');
        results.recommendations.push('🔄 Check if the issue persists after clearing cache');
      } else {
        results.recommendations.push('✅ All dates are showing correct status - bug may be resolved');
      }

      if (Object.keys(results.localStorage).length > 0) {
        results.recommendations.push('📦 Found localStorage data that might be interfering');
        results.recommendations.push('🗑️ Consider clearing localStorage completely');
      }

      setDebugResults(results);
      console.log('🔍 [DEBUG COMPONENT] Debug results:', results);

    } catch (error) {
      console.error('❌ [DEBUG COMPONENT] Debug check failed:', error);
      setDebugResults({
        error: error.message,
        recommendations: ['❌ Debug check failed - check console for details']
      });
    } finally {
      setIsDebugging(false);
    }
  };

  const clearLocalStorage = () => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('abcd') || key.includes('excel') || key.includes('hour') || key.includes('status')) {
        localStorage.removeItem(key);
        console.log(`🗑️ [DEBUG] Cleared localStorage key: ${key}`);
      }
    });
    alert('LocalStorage cleared! Please refresh the page and test again.');
  };

  return (
    <div style={{ display: 'none' }}>
      {/* Debug panel disabled - functionality available via console */}
      {/* Use console.log for debugging instead of visual panel */}
    </div>
  );
};

export default DebugAutoUploadStatus;
