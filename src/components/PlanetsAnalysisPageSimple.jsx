// src/components/PlanetsAnalysisPageSimple.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

function PlanetsAnalysisPage() {
  const navigate = useNavigate();

  // Simple state management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [planetsData, setPlanetsData] = useState(null);
  const [selectedTopics, setSelectedTopics] = useState(new Set());
  const [showTopicSelector, setShowTopicSelector] = useState(true);

  // Hardcoded ABCD/BCD numbers as per user requirements
  const ABCD_NUMBERS = [6, 8, 11];
  const BCD_NUMBERS = [9, 10];

  // Extract number from planet data
  const extractElementNumber = (str) => {
    if (typeof str !== 'string') return null;
    const match = str.match(/^[a-z]+-(\d+)/);
    return match ? Number(match[1]) : null;
  };

  // Format planet data to short format: as-8-su-li
  const formatPlanetData = (rawString) => {
    if (!rawString) return '—';
    
    // Pattern: as-7/su-(12 Sc 50)-(20 Ta 50) → as-7-su-sc
    let match = rawString.match(/^([a-z]+-\d+)\/([a-z]+)-\((\d+)\s+([A-Za-z]+)/);
    if (match) {
      const [, element, planet, , sign] = match;
      return `${element}-${planet}-${sign.toLowerCase().slice(0, 2)}`;
    }
    
    // Simple format already formatted
    if (rawString.match(/^[a-z]+-\d+-[a-z]+-[a-z]+$/)) {
      return rawString;
    }
    
    // Fallback: extract basic element-number pattern
    const basicMatch = rawString.match(/^([a-z]+-\d+)/);
    if (basicMatch) {
      return basicMatch[1];
    }
    
    return rawString;
  };

  // Render ABCD/BCD badges
  const renderABCDBadges = (rawData) => {
    const extractedNumber = extractElementNumber(rawData);
    if (!extractedNumber && extractedNumber !== 0) return null;
    
    // Check ABCD first (priority)
    if (ABCD_NUMBERS.includes(extractedNumber)) {
      return (
        <span className="bg-green-200 text-green-800 px-1 py-0.5 rounded text-xs font-medium">
          ABCD
        </span>
      );
    }
    
    // Check BCD
    if (BCD_NUMBERS.includes(extractedNumber)) {
      return (
        <span className="bg-blue-200 text-blue-800 px-1 py-0.5 rounded text-xs font-medium">
          BCD
        </span>
      );
    }
    
    return null;
  };

  // Excel processing logic
  const processSingleDayExcel = (rows) => {
    const result = { sets: {} };
    
    // Planet mapping for columns
    const planetMapping = {
      1: 'Su', 2: 'Mo', 3: 'Ma', 4: 'Me', 5: 'Ju',
      6: 'Ve', 7: 'Sa', 8: 'Ra', 9: 'Ke'
    };
    
    // Element name mapping
    const elementNames = {
      'as': 'Lagna', 'mo': 'Moon', 'hl': 'Hora Lagna', 'gl': 'Ghati Lagna',
      'vig': 'Vighati Lagna', 'var': 'Varnada Lagna', 'sl': 'Sree Lagna',
      'pp': 'Pranapada Lagna', 'in': 'Indu Lagna'
    };
    
    let currentSet = null;
    let currentSetData = {};
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!Array.isArray(row) || row.length === 0) continue;
      
      const firstCell = String(row[0] || '').trim();
      
      // Detect set headers (D-x Set-y Matrix)
      if (firstCell.includes('Matrix') && (firstCell.includes('D-') || firstCell.includes('Set-'))) {
        // Save previous set if exists
        if (currentSet && Object.keys(currentSetData).length > 0) {
          result.sets[currentSet] = { ...currentSetData };
        }
        currentSet = firstCell;
        currentSetData = {};
        continue;
      }
      
      // Process element rows
      if (currentSet && firstCell && firstCell.length <= 3) {
        const elementCode = firstCell.toLowerCase();
        
        if (elementNames[elementCode]) {
          const elementData = {};
          
          // Extract planet data from columns B-J (indices 1-9)
          for (let col = 1; col <= 9; col++) {
            const planetCode = planetMapping[col];
            const cellValue = row[col];
            
            if (cellValue && cellValue.toString().trim()) {
              elementData[planetCode] = cellValue.toString().trim();
            }
          }
          
          if (Object.keys(elementData).length > 0) {
            currentSetData[elementNames[elementCode]] = elementData;
          }
        }
      }
    }
    
    // Save the last set
    if (currentSet && Object.keys(currentSetData).length > 0) {
      result.sets[currentSet] = { ...currentSetData };
    }
    
    return result;
  };

  // Handle Excel upload
  const handleExcelUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          // Process the Excel data
          const processedData = processSingleDayExcel(jsonData);
          
          if (Object.keys(processedData.sets).length === 0) {
            throw new Error('No valid data found in Excel file');
          }
          
          setPlanetsData(processedData);
          setSelectedTopics(new Set()); // Reset topic selection
          setSuccess(`✅ Excel uploaded successfully! Found ${Object.keys(processedData.sets).length} topics.`);
          
        } catch (error) {
          console.error('Excel processing error:', error);
          setError(`Failed to process Excel file: ${error.message}`);
        }
      };
      
      reader.readAsArrayBuffer(file);
      event.target.value = null;
    } catch (error) {
      setError(`Failed to upload file: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Topic management functions
  const availableTopics = planetsData ? Object.keys(planetsData.sets).sort() : [];

  const getTopicsForDisplay = () => {
    if (selectedTopics.size === 0) {
      return availableTopics;
    }
    return Array.from(selectedTopics).sort();
  };

  const formatSetName = (setName) => {
    return setName.replace(/\s+Matrix$/i, '');
  };

  const handleTopicToggle = (topic) => {
    const newSelectedTopics = new Set(selectedTopics);
    if (selectedTopics.has(topic)) {
      newSelectedTopics.delete(topic);
    } else {
      newSelectedTopics.add(topic);
    }
    setSelectedTopics(newSelectedTopics);
  };

  const handleSelectAll = () => {
    setSelectedTopics(new Set(availableTopics));
  };

  const handleClearAll = () => {
    setSelectedTopics(new Set());
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <div className="w-full mx-auto px-2 sm:px-4 py-6 overflow-x-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 border-t-4 border-teal-600">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">🔬 Planets Analysis (Simplified)</h1>
              <p className="text-sm text-gray-600">Upload Excel file to see planets data with ABCD/BCD analysis</p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Excel Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Excel File:
              </label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleExcelUpload}
                disabled={loading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
              />
            </div>
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
              <div><strong>ABCD Numbers:</strong> [{ABCD_NUMBERS.join(', ')}]</div>
              <div><strong>BCD Numbers:</strong> [{BCD_NUMBERS.join(', ')}]</div>
            </div>
          </div>
        </div>

        {/* Topic Filter */}
        {planetsData && availableTopics.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Filter Topics:</h3>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {selectedTopics.size} of {availableTopics.length} selected
                </span>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Select All
                </button>
                <button
                  onClick={handleClearAll}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowTopicSelector(!showTopicSelector)}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  {showTopicSelector ? '☑️ Hide' : '◻️ Show'}
                </button>
              </div>
            </div>

            {showTopicSelector && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                {availableTopics.map(topic => (
                  <button
                    key={topic}
                    onClick={() => handleTopicToggle(topic)}
                    className={`w-full px-2 py-1 rounded text-xs font-medium transition-all text-left ${
                      selectedTopics.has(topic)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{formatSetName(topic)}</span>
                      {selectedTopics.has(topic) && <span className="text-white text-xs">✓</span>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-3 py-2 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 text-green-700 px-3 py-2 rounded mb-4">
            {success}
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Planets Analysis Results
            </h3>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-6 w-6 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Processing Excel file...</p>
            </div>
          ) : planetsData && planetsData.sets && Object.keys(planetsData.sets).length > 0 ? (
            <div className="space-y-6">
              {getTopicsForDisplay().map(setName => (
                <div key={setName} className="border rounded-lg p-4">
                  <h4 className="text-base font-medium text-gray-700 mb-4 bg-gray-50 p-2 rounded">
                    {formatSetName(setName)}
                  </h4>
                  
                  {/* Planet Headers with ABCD/BCD numbers */}
                  <div className="mb-4 grid grid-cols-9 gap-2">
                    {['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'].map(planetCode => (
                      <div key={planetCode} className="text-center bg-purple-100 p-2 rounded">
                        <div className="text-sm font-semibold">{planetCode}</div>
                        <div className="text-xs mt-1">
                          <div className="bg-green-200 text-green-800 px-1 py-0.5 rounded mb-1">
                            ABCD: [{ABCD_NUMBERS.join(', ')}]
                          </div>
                          <div className="bg-blue-200 text-blue-800 px-1 py-0.5 rounded">
                            BCD: [{BCD_NUMBERS.join(', ')}]
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Data Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto border-collapse">
                      <thead>
                        <tr>
                          <th className="border border-gray-300 px-3 py-2 font-semibold bg-gray-100 text-left w-32">
                            Element
                          </th>
                          {['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'].map(planetCode => (
                            <th key={planetCode} className="border border-gray-300 px-3 py-2 font-semibold text-center bg-purple-100 w-32">
                              {planetCode}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          // Define correct element order
                          const orderedElementNames = [
                            'Lagna', 'Moon', 'Hora Lagna', 'Ghati Lagna',
                            'Vighati Lagna', 'Varnada Lagna', 'Sree Lagna',
                            'Pranapada Lagna', 'Indu Lagna'
                          ];
                          
                          const setData = planetsData.sets[setName] || {};
                          
                          return orderedElementNames
                            .filter(elementName => setData[elementName])
                            .map(elementName => {
                              const planetData = setData[elementName];
                              return (
                                <tr key={elementName} className="hover:bg-gray-50">
                                  <td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50">
                                    {elementName}
                                  </td>
                                  {['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'].map(planet => {
                                    const rawData = planetData[planet];
                                    const formattedData = formatPlanetData(rawData);
                                    
                                    return (
                                      <td key={planet} className="border border-gray-300 px-3 py-2 text-center">
                                        {rawData ? (
                                          <div className="flex flex-col items-center gap-1">
                                            <span className="font-mono text-gray-700 text-xs">
                                              {formattedData}
                                            </span>
                                            {renderABCDBadges(rawData)}
                                          </div>
                                        ) : (
                                          <span className="text-gray-400">—</span>
                                        )}
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                            });
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <div className="text-2xl mb-2">📊</div>
              <p className="text-sm">No planets data</p>
              <p className="text-xs">Upload an Excel file to see analysis results</p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gray-100 rounded-lg p-4">
          <h4 className="text-md font-semibold text-gray-800 mb-3">📖 How to Use</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <div className="font-medium text-gray-800 mb-1">📊 Upload Excel</div>
              <p>Upload Excel files with planet data. The system will automatically process and display results.</p>
            </div>
            <div>
              <div className="font-medium text-gray-800 mb-1">🏷️ ABCD/BCD Analysis</div>
              <p>Numbers [6, 8, 11] show ABCD badges (green), numbers [9, 10] show BCD badges (blue).</p>
            </div>
            <div>
              <div className="font-medium text-gray-800 mb-1">🔍 Topic Filtering</div>
              <p>Use the topic selector to show/hide specific topics for focused analysis.</p>
            </div>
            <div>
              <div className="font-medium text-gray-800 mb-1">📋 Data Format</div>
              <p>Planet data is displayed in format: element-number-planet-sign (e.g., as-8-su-li).</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlanetsAnalysisPage;
