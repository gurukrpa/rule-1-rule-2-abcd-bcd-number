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
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: '#f0f0f0', 
      border: '2px solid #333', 
      padding: '15px', 
      borderRadius: '8px', 
      maxWidth: '400px',
      maxHeight: '80vh',
      overflow: 'auto',
      zIndex: 9999,
      fontSize: '12px'
    }}>
      <h4>🔧 Debug Auto-Upload Status</h4>
      
      <button 
        onClick={runDebugCheck} 
        disabled={isDebugging || !selectedUser}
        style={{ margin: '5px', padding: '8px 12px' }}
      >
        {isDebugging ? '🔄 Checking...' : '🔍 Run Debug Check'}
      </button>
      
      <button 
        onClick={clearLocalStorage}
        style={{ margin: '5px', padding: '8px 12px', background: '#ff6b6b', color: 'white' }}
      >
        🗑️ Clear Cache
      </button>

      {debugResults && (
        <div style={{ marginTop: '10px' }}>
          <h5>📊 Debug Results:</h5>
          
          {debugResults.error ? (
            <div style={{ color: 'red' }}>
              <strong>Error:</strong> {debugResults.error}
            </div>
          ) : (
            <>
              <div><strong>User:</strong> {debugResults.user}</div>
              <div><strong>Time:</strong> {new Date(debugResults.timestamp).toLocaleString()}</div>
              
              <h6>📅 Date Status Checks:</h6>
              {debugResults.checks.map((check, idx) => (
                <div key={idx} style={{ 
                  padding: '5px', 
                  margin: '3px 0', 
                  background: check.isNewDate ? '#ffe6e6' : '#e6ffe6',
                  borderRadius: '3px'
                }}>
                  <strong>{check.date}:</strong> 
                  Excel: {check.excel ? '🟢' : '🔴'}, 
                  Hour: {check.hour ? '🟢' : '🔴'}
                  {check.isNewDate && (check.excel || check.hour) && 
                    <span style={{ color: 'red', fontWeight: 'bold' }}> ⚠️ BUG!</span>
                  }
                </div>
              ))}

              {Object.keys(debugResults.localStorage).length > 0 && (
                <>
                  <h6>💾 localStorage Data:</h6>
                  <div style={{ fontSize: '10px', maxHeight: '100px', overflow: 'auto' }}>
                    <pre>{JSON.stringify(debugResults.localStorage, null, 2)}</pre>
                  </div>
                </>
              )}

              <h6>💡 Recommendations:</h6>
              {debugResults.recommendations.map((rec, idx) => (
                <div key={idx} style={{ fontSize: '11px', margin: '2px 0' }}>
                  {rec}
                </div>
              ))}
            </>
          )}
        </div>
      )}
      
      <div style={{ marginTop: '10px', fontSize: '10px', color: '#666' }}>
        This is a temporary debug component. Remove it after fixing the issue.
      </div>
    </div>
  );
};

export default DebugAutoUploadStatus;
