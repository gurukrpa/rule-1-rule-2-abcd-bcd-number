// Debug component to show what's happening when Index button is clicked
import React, { useState, useEffect } from 'react';
import { cleanSupabaseService } from '../services/CleanSupabaseService';

function IndexPageDebugger({ selectedUser, date, datesList }) {
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function debugIndexPageData() {
      try {
        console.log('🔍 IndexPageDebugger started with:', { selectedUser, date, datesList });
        
        const info = {
          inputs: { selectedUser, date, datesList },
          timestamp: new Date().toISOString()
        };

        // Check if user exists
        try {
          const users = await cleanSupabaseService.getAllUsers();
          const user = users.find(u => u.id === selectedUser);
          info.userExists = !!user;
          info.userDetails = user ? { username: user.username, id: user.id } : null;
        } catch (err) {
          info.userError = err.message;
        }

        // Check Excel data for the specific date
        try {
          const excelData = await cleanSupabaseService.getExcelData(selectedUser, date);
          info.hasExcelData = !!excelData;
          info.excelDetails = excelData ? {
            fileName: excelData.fileName,
            setsCount: Object.keys(excelData.sets || {}).length,
            firstFewSets: Object.keys(excelData.sets || {}).slice(0, 3)
          } : null;
        } catch (err) {
          info.excelError = err.message;
        }

        // Check Hour data for the specific date
        try {
          const hourData = await cleanSupabaseService.getHourEntry(selectedUser, date);
          info.hasHourData = !!hourData;
          info.hourDetails = hourData ? {
            planetSelectionsCount: Object.keys(hourData.planetSelections || {}).length,
            hrNumbers: Object.keys(hourData.planetSelections || {})
          } : null;
        } catch (err) {
          info.hourError = err.message;
        }

        // Check if we have complete data
        info.canShowIndex = info.hasExcelData && info.hasHourData;
        info.missingData = [];
        if (!info.hasExcelData) info.missingData.push('Excel data');
        if (!info.hasHourData) info.missingData.push('Hour entry data');

        setDebugInfo(info);
      } catch (error) {
        setDebugInfo({ error: error.message });
      } finally {
        setLoading(false);
      }
    }

    if (selectedUser && date) {
      debugIndexPageData();
    } else {
      setDebugInfo({ error: 'Missing selectedUser or date' });
      setLoading(false);
    }
  }, [selectedUser, date, datesList]);

  if (loading) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="animate-pulse">🔍 Debugging IndexPage data...</div>
      </div>
    );
  }

  if (!debugInfo) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-red-600">❌ Debug info not available</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="font-bold text-lg mb-3">🔍 IndexPage Debug Information</h3>
      
      <div className="space-y-3">
        <div>
          <strong>📊 Input Parameters:</strong>
          <pre className="text-xs bg-gray-100 p-2 rounded mt-1">
            {JSON.stringify(debugInfo.inputs, null, 2)}
          </pre>
        </div>

        {debugInfo.userExists ? (
          <div className="text-green-600">
            ✅ User exists: {debugInfo.userDetails?.username} ({debugInfo.userDetails?.id})
          </div>
        ) : (
          <div className="text-red-600">
            ❌ User not found or error: {debugInfo.userError || 'Unknown error'}
          </div>
        )}

        <div>
          <strong>📁 Excel Data for {debugInfo.inputs.date}:</strong>
          {debugInfo.hasExcelData ? (
            <div className="text-green-600 ml-4">
              ✅ Found Excel data
              <div className="text-sm">
                - File: {debugInfo.excelDetails?.fileName}
                - Sets: {debugInfo.excelDetails?.setsCount}
                - Sample: {debugInfo.excelDetails?.firstFewSets?.join(', ')}
              </div>
            </div>
          ) : (
            <div className="text-red-600 ml-4">
              ❌ No Excel data found
              {debugInfo.excelError && <div className="text-xs">Error: {debugInfo.excelError}</div>}
            </div>
          )}
        </div>

        <div>
          <strong>⏰ Hour Entry Data for {debugInfo.inputs.date}:</strong>
          {debugInfo.hasHourData ? (
            <div className="text-green-600 ml-4">
              ✅ Found Hour entry data
              <div className="text-sm">
                - HR selections: {debugInfo.hourDetails?.planetSelectionsCount}
                - HR numbers: {debugInfo.hourDetails?.hrNumbers?.join(', ')}
              </div>
            </div>
          ) : (
            <div className="text-red-600 ml-4">
              ❌ No Hour entry data found
              {debugInfo.hourError && <div className="text-xs">Error: {debugInfo.hourError}</div>}
            </div>
          )}
        </div>

        <div className="border-t pt-3">
          <strong>🎯 IndexPage Status:</strong>
          {debugInfo.canShowIndex ? (
            <div className="text-green-600 ml-4">
              ✅ IndexPage CAN display - both Excel and Hour data available
            </div>
          ) : (
            <div className="text-red-600 ml-4">
              ❌ IndexPage CANNOT display - missing: {debugInfo.missingData.join(', ')}
              <div className="text-sm mt-2 p-2 bg-yellow-100 rounded">
                💡 To fix: Upload Excel file and complete Hour Entry for date {debugInfo.inputs.date}
              </div>
            </div>
          )}
        </div>

        {debugInfo.error && (
          <div className="text-red-600">
            ❌ Debug Error: {debugInfo.error}
          </div>
        )}
      </div>
    </div>
  );
}

export default IndexPageDebugger;
