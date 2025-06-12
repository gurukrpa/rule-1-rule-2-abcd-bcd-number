// src/components/Rule1Page.jsx

import React, { useState, useEffect } from 'react';
import { DataService } from '../services/dataService';

function Rule1Page({ date, selectedUser, datesList, onBack }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUserData, setSelectedUserData] = useState(null);
  const [activeHR, setActiveHR] = useState(null);
  const [allDaysData, setAllDaysData] = useState({});
  const [windowType, setWindowType] = useState('');
  const [abcdBcdAnalysis, setAbcdBcdAnalysis] = useState({});
  const [multipleAnalyses, setMultipleAnalyses] = useState([]); // Store multiple D-day analyses
  
  // Initialize DataService
  const dataService = new DataService();

  // Extract the FIRST number after element prefix, similar to Rule-2
  const extractElementNumber = (str) => {
    if (typeof str !== 'string') return null;
    
    // Look for pattern: element-NUMBER/ or element-NUMBER-
    const match = str.match(/^[a-z]+-(\d+)[\/\-]/);
    return match ? Number(match[1]) : null;
  };

  // Simple render function - no color coding in table cells anymore
  const renderSimpleDayNumber = (cellValue) => {
    return cellValue;
  };

  // Extract numbers from a specific set for a specific date using selected HR
  const extractFromDateAndSet = async (targetDate, setName) => {
    try {
      const excelData = await dataService.getExcelData(selectedUser, targetDate);
      const hourData = await dataService.getHourEntry(selectedUser, targetDate);
      
      if (!excelData || !hourData) {
        console.log(`📦 [Rule-1] Missing data for ${targetDate}: Excel(${!!excelData}) Hour(${!!hourData})`);
        return [];
      }
      
      const sets = excelData.data?.sets || {};
      const planetSelections = hourData.planetSelections || {};
      
      const allNumbers = new Set();
      
      // Find the specific set
      const setData = sets[setName];
      if (setData) {
        // Use the active HR for planet selection
        const selectedPlanet = planetSelections[activeHR];
        
        if (selectedPlanet) {
          console.log(`🪐 [Rule-1] Using planet ${selectedPlanet} from HR ${activeHR} for ${setName} on ${targetDate}`);
          
          // Process each element in the set
          Object.entries(setData).forEach(([elementName, planetData]) => {
            const rawString = planetData[selectedPlanet];
            if (rawString) {
              const elementNumber = extractElementNumber(rawString);
              if (elementNumber !== null) {
                allNumbers.add(elementNumber);
              }
            }
          });
        } else {
          console.log(`❌ [Rule-1] No planet selected for HR ${activeHR} on ${targetDate}`);
        }
      }
      
      return Array.from(allNumbers).sort((a, b) => a - b);
      
    } catch (e) {
      console.error(`❌ [Rule-1] Error extracting from ${targetDate} and ${setName}:`, e);
      return [];
    }
  };

  // Process ABCD-BCD analysis for a specific set
  const processSetAnalysis = async (setName, aDay, bDay, cDay, dDay) => {
    // Extract numbers from each day for this specific set
    const dDayNumbers = await extractFromDateAndSet(dDay, setName);
    const cDayNumbers = await extractFromDateAndSet(cDay, setName);
    const bDayNumbers = await extractFromDateAndSet(bDay, setName);
    const aDayNumbers = await extractFromDateAndSet(aDay, setName);
    
    if (dDayNumbers.length === 0) {
      return {
        setName,
        abcdNumbers: [],
        bcdNumbers: [],
        dDayCount: 0,
        error: 'No D-day numbers found'
      };
    }

    // Step 1: ABCD Analysis - D-day numbers appearing in ≥2 of A, B, C days
    const abcdCandidates = dDayNumbers.filter(num => {
      let count = 0;
      if (aDayNumbers.includes(num)) count++;
      if (bDayNumbers.includes(num)) count++;
      if (cDayNumbers.includes(num)) count++;
      return count >= 2;
    });

    // Step 2: BCD Analysis - D-day numbers appearing in exclusive B-D or C-D pairs
    const bcdCandidates = dDayNumbers.filter(num => {
      const inB = bDayNumbers.includes(num);
      const inC = cDayNumbers.includes(num);
      const inD = dDayNumbers.includes(num); // Always true since we're filtering dDayNumbers
      
      // BCD qualification: (B-D pair only) OR (C-D pair only) - exclude if in both B and C
      const bdPairOnly = inB && inD && !inC; // B-D pair but NOT in C
      const cdPairOnly = inC && inD && !inB; // C-D pair but NOT in B
      return bdPairOnly || cdPairOnly;
    });

    // Step 3: Apply mutual exclusivity - ABCD takes priority over BCD
    const abcdNumbers = abcdCandidates.sort((a, b) => a - b);
    const bcdNumbers = bcdCandidates
      .filter(num => !abcdCandidates.includes(num)) // Exclude numbers already in ABCD
      .sort((a, b) => a - b);

    console.log(`🔍 [Rule-1] ${setName} Analysis:`, {
      dDayNumbers,
      abcdCandidates,
      bcdCandidates,
      finalABCD: abcdNumbers,
      finalBCD: bcdNumbers
    });

    return {
      setName,
      abcdNumbers,
      bcdNumbers,
      dDayCount: dDayNumbers.length,
      aDayCount: aDayNumbers.length,
      bDayCount: bDayNumbers.length,
      cDayCount: cDayNumbers.length
    };
  };

  // Load data using same logic as IndexPage
  const buildAllDaysData = async () => {
    try {
      setLoading(true);
      console.log(`🔍 [Rule-1] Loading data for user ${selectedUser}, date ${date}`);
      console.log(`📊 [Rule-1] Available dates:`, datesList);
      console.log(`🎯 [Rule-1] Clicked date type:`, typeof date, date);
      console.log(`📅 [Rule-1] DatesList type:`, typeof datesList, datesList?.length, 'items');

      // 1. Sort all dates ascending (oldest → newest)
      const sortedDates = [...datesList].sort((a, b) => new Date(a) - new Date(b));
      console.log(`📈 [Rule-1] Sorted dates (oldest→newest):`, sortedDates);
      
      const targetIdx   = sortedDates.indexOf(date);
      console.log(`🎯 [Rule-1] Target date "${date}" found at index:`, targetIdx);

      // 2. NEW APPROACH: Show ALL past dates (expanding historical view)
      // Instead of just 4 dates, show all dates up to the clicked date
      let windowDates;
      if (targetIdx === -1) {
        console.log(`⚠️ [Rule-1] Date "${date}" not found in datesList, using all available dates`);
        windowDates = sortedDates;
      } else {
        // For Rule-1: Take ALL dates up to (but not including) the clicked date
        windowDates = sortedDates.slice(0, targetIdx);
        console.log(`✅ [Rule-1] Taking ALL dates before clicked date: slice(0, ${targetIdx})`);
      }

      console.log(`🪟 [Rule-1] Historical window dates (ALL preceding clicked date):`, windowDates);
      console.log(`📏 [Rule-1] Window size: ${windowDates.length} dates`);
      console.log(`🎯 [Rule-1] Clicked date "${date}" is the TRIGGER (not shown in matrix)`);
      
      // CRITICAL CHECK: Ensure we have at least 4 dates for ABCD analysis
      if (windowDates.length < 4) {
        console.error(`❌ [Rule-1] CRITICAL: Only ${windowDates.length} dates in window, need at least 4 for ABCD analysis!`);
        setError(`Rule-1 requires at least 4 preceding dates. Only ${windowDates.length} dates available before "${date}".`);
        setLoading(false);
        return;
      }
      
      // === CRITICAL COMPARISON WITH INDEXPAGE ===
      console.log(`🆚 [Rule-1] COMPARISON CHECK:`);
      console.log(`   IndexPage would include clicked date in window`);
      console.log(`   Rule-1 shows 4 dates BEFORE clicked date`);
      console.log(`   IndexPage window would be:`, sortedDates.slice(Math.max(0, targetIdx + 1 - 4), targetIdx + 1));
      console.log(`   Rule-1 window is:`, windowDates);
      console.log(`   Expected A-B-C-D sequence:`, windowDates.map((d, i) => `${['A', 'B', 'C', 'D'][i]}=${d}`));
      // ============================================

      // Determine window type based on position
      const dateIndex = sortedDates.indexOf(date);
      if (dateIndex >= 4) {
        setWindowType(`Historical View (showing ${windowDates.length} dates before ${dateIndex + 1}th date)`);
      } else {
        setWindowType('Insufficient Data');
        setError(`Rule-1 requires at least 5 dates. Current date ${date} is the ${dateIndex + 1}th date.`);
        setLoading(false);
        return;
      }

      // 3. Label ALL dates chronologically (no longer limited to A-B-C-D)
      // Each date gets its actual date as identifier, not a letter label
      const assembled = {};

      // Process each date with async DataService calls
      for (let idx = 0; idx < windowDates.length; idx++) {
        const d = windowDates[idx];
        const dateKey = d; // Use actual date as key instead of A/B/C/D labels
        
        console.log(`📊 [Rule-1] Loading date ${idx + 1}/${windowDates.length} (${d})...`);

        try {
          const excelData = await dataService.getExcelData(selectedUser, d);
          const hourData = await dataService.getHourEntry(selectedUser, d);
          
          console.log(`📊 [Rule-1] Date ${d} - Excel:`, !!excelData, 'Hour:', !!hourData);
          if (excelData) console.log(`📊 [Rule-1] Date ${d} Excel sets:`, Object.keys(excelData.data?.sets || {}));
          if (hourData) console.log(`📊 [Rule-1] Date ${d} Hours:`, Object.keys(hourData.planetSelections || {}));

          if (excelData && hourData) {
            const planetSel = hourData.planetSelections || {};

            // Build hrData: for each HR, store selectedPlanet + all "sets"
            const hrData = {};
            Object.entries(planetSel).forEach(([hr, selectedPlanet]) => {
              const oneHR = { selectedPlanet, sets: {} };
              Object.entries(excelData.data.sets || {}).forEach(([setName, elementBlock]) => {
                const elementsToShow = {};
                Object.entries(elementBlock).forEach(([elementName, planetMap]) => {
                  const rawString = planetMap[selectedPlanet];
                  if (rawString) {
                    elementsToShow[elementName] = {
                      rawData: rawString,
                      selectedPlanet
                    };
                  }
                });
                oneHR.sets[setName] = elementsToShow;
              });
              hrData[hr] = oneHR;
            });

            assembled[dateKey] = {
              date: d,
              hrData,
              success: Object.keys(hrData).length > 0,
              index: idx,
              dateKey
            };
          } else {
            // === GRACEFUL HANDLING: Missing data no longer blocks operation ===
            console.log(`📦 [Rule-1] Date ${d} - Missing data, creating empty structure`);
            assembled[dateKey] = {
              date: d,
              hrData: {},
              success: false,
              error: !excelData ? 'No Excel data' : 'No Hour Entry data',
              index: idx,
              dateKey,
              isEmpty: true  // Flag to indicate this day has no data
            };
          }
        } catch (dateError) {
          // Error processing this specific date
          assembled[dateKey] = {
            date: d,
            hrData: {},
            success: false,
            error: dateError.message || 'Unknown error',
            index: idx,
            dateKey
          };
          console.error(`❌ [Rule-1] Error loading date ${d} data:`, dateError);
        }
      }

      console.log(`✅ [Rule-1] Assembled data:`, assembled);
      setAllDaysData(assembled);

      // Auto-select first available HR from any successful date
      let firstHR = null;
      for (const dateKey of Object.keys(assembled)) {
        if (assembled[dateKey]?.success) {
          const hrKeys = Object.keys(assembled[dateKey].hrData || {});
          if (hrKeys.length) {
            firstHR = hrKeys[0];
            break;
          }
        }
      }
      if (firstHR) setActiveHR(firstHR);
      
      setLoading(false);
      
    } catch (err) {
      console.error('❌ [Rule-1] Error building all days data:', err);
      setError(`Error loading data: ${err.message || 'Unknown error occurred'}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUser && Array.isArray(datesList) && datesList.length > 0) {
      // Load user data
      let stored = localStorage.getItem('abcd_users_data');
      if (stored) {
        const users = JSON.parse(stored);
        const user = users.find(u => u.id.toString() === selectedUser);
        setSelectedUserData(user);
        console.log(`👤 [Rule-1] User data loaded:`, user);
      }
      
      buildAllDaysData();
    } else {
      setError('Missing required user or dates data.');
      setLoading(false);
    }
  }, [selectedUser, datesList, date]);

  // Perform ABCD-BCD analysis when activeHR or allDaysData changes
  useEffect(() => {
    const performMultipleAnalyses = async () => {
      if (!activeHR || !allDaysData || Object.keys(allDaysData).length < 4) {
        console.log(`⏸️ [Rule-1] Analysis skipped: activeHR=${activeHR}, data length=${Object.keys(allDaysData).length}`);
        setAbcdBcdAnalysis({});
        setMultipleAnalyses([]);
        return;
      }

      console.log(`🧮 [Rule-1] Starting multiple ABCD-BCD analyses for HR ${activeHR}`);
      
      // Get all dates sorted chronologically
      const allDates = Object.keys(allDaysData).sort((a, b) => new Date(a) - new Date(b));
      console.log(`📅 [Rule-1] All available dates:`, allDates);
      
      // Create all possible 4-day windows (each date can be D-day)
      const analyses = [];
      const analysisMap = {}; // For backward compatibility with existing UI
      
      for (let i = 3; i < allDates.length; i++) {
        const dDate = allDates[i];
        const cDate = allDates[i - 1];
        const bDate = allDates[i - 2];
        const aDate = allDates[i - 3];
        
        console.log(`🔍 [Rule-1] Analyzing window ${i - 2}: A=${aDate}, B=${bDate}, C=${cDate}, D=${dDate}`);
        
        // Check if all required dates have data
        const hasAllData = [aDate, bDate, cDate, dDate].every(date => 
          allDaysData[date]?.success && allDaysData[date].hrData[activeHR]
        );
        
        if (!hasAllData) {
          console.log(`⚠️ [Rule-1] Skipping window ${i - 2} - missing data for some dates`);
          continue;
        }
        
        // Get all unique set names for this window
        const allSets = new Set();
        [aDate, bDate, cDate, dDate].forEach(date => {
          if (allDaysData[date].hrData[activeHR]) {
            Object.keys(allDaysData[date].hrData[activeHR].sets).forEach(setName => {
              allSets.add(setName);
            });
          }
        });
        
        const windowAnalysis = {
          windowId: i - 2,
          dDate,
          aDate,
          bDate,
          cDate,
          sets: {}
        };
        
        // Perform analysis for each set in this window
        for (const setName of Array.from(allSets)) {
          const result = await processSetAnalysis(setName, aDate, bDate, cDate, dDate);
          windowAnalysis.sets[setName] = result;
          
          // Store analysis for THIS D-date in the global analysis map
          // Use dDate as key to allow multiple D-date analyses
          const analysisKey = `${setName}_${dDate}`;
          analysisMap[analysisKey] = result;
          
          // Also store under just setName for the most recent window (for backward compatibility)
          if (i === allDates.length - 1) {
            analysisMap[setName] = result;
          }
        }
        
        analyses.push(windowAnalysis);
      }
      
      console.log(`✅ [Rule-1] Completed ${analyses.length} window analyses`);
      setMultipleAnalyses(analyses);
      setAbcdBcdAnalysis(analysisMap); // Set for UI compatibility with existing components
    };

    performMultipleAnalyses();
  }, [activeHR, allDaysData]);

  // Helper functions for matrix display
  const generateColumnHeader = (dateKey) => {
    const dayObj = allDaysData[dateKey];
    if (!dayObj) {
      return '(Missing)';
    }
    
    if (!dayObj.success || dayObj.isEmpty || !activeHR || !dayObj.hrData[activeHR]) {
      return `${dayObj.date} [No Data]`;
    }
    
    const planet = dayObj.hrData[activeHR].selectedPlanet;
    return `${dayObj.date}-${planet}`;
  };

  // Helper functions for column styling - mark most recent 4 dates for ABCD analysis
  const getMostRecentDates = () => {
    const allDates = Object.keys(allDaysData).sort((a, b) => new Date(a) - new Date(b));
    return allDates.slice(-4); // Get last 4 dates
  };

  const getDayLabel = (dateKey) => {
    const recentDates = getMostRecentDates();
    const index = recentDates.indexOf(dateKey);
    return index >= 0 ? ['A', 'B', 'C', 'D'][index] : null;
  };

  const isDColumn = (dateKey) => {
    return getDayLabel(dateKey) === 'D';
  };
  
  const headerCellClass = (dateKey) => {
    const dayObj = allDaysData[dateKey];
    let base = 'border border-gray-300 px-2 py-2 font-semibold text-center text-xs';
    
    if (!dayObj || dayObj.isEmpty || !dayObj.success) {
      base += ' bg-gray-200 text-gray-500';
    } else if (isDColumn(dateKey)) {
      base += ' bg-blue-600 text-white';
    } else {
      const dayLabel = getDayLabel(dateKey);
      if (dayLabel) {
        base += ' bg-green-100 text-green-800'; // Recent 4 dates get green highlight
      } else {
        base += ' bg-gray-50 text-gray-700'; // Older dates get standard styling
      }
    }
    
    return base;
  };

  // Get all available dates (chronologically sorted)
  const availableDates = Object.keys(allDaysData).sort((a, b) => new Date(a) - new Date(b));
  
  // Get HR choices from ANY available date that has data
  const hrChoices = (() => {
    const allHRs = new Set();
    availableDates.forEach(dateKey => {
      if (allDaysData[dateKey]?.hrData && allDaysData[dateKey].success) {
        Object.keys(allDaysData[dateKey].hrData).forEach(hr => allHRs.add(hr));
      }
    });
    const hrArray = Array.from(allHRs).sort((a, b) => parseInt(a) - parseInt(b));
    console.log(`🔍 [Rule-1] Available HR choices:`, hrArray, 'from successful dates:', availableDates.filter(dateKey => allDaysData[dateKey]?.success));
    return hrArray;
  })();

  // Get available sets only from dates that have data
  const getAvailableSetsForDisplay = () => {
    if (!activeHR) return [];
    
    const allSets = new Set();
    availableDates.forEach(dateKey => {
      if (allDaysData[dateKey]?.success && allDaysData[dateKey].hrData[activeHR]) {
        Object.keys(allDaysData[dateKey].hrData[activeHR].sets).forEach(setName => {
          allSets.add(setName);
        });
      }
    });
    return Array.from(allSets);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-lg font-semibold text-gray-700">Loading Rule-1 Data...</p>
          <p className="text-sm text-gray-500 mt-2">Analyzing {windowType}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-lg shadow-md p-6 text-center max-w-md">
          <div className="text-red-600 text-xl mb-2">⚠️ Rule-1 Error</div>
          <p className="mb-4 text-gray-700">{error}</p>
          <button onClick={onBack} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg">
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 border-t-4 border-green-600">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">🔗 Rule-1 Analysis</h1>
              <div className="mt-2 text-sm text-green-800">
                <p>👤 User: {selectedUserData?.username || selectedUser}</p>
                <p>📅 Clicked Date: {new Date(date).toLocaleDateString()}</p>
                <p>🗓️ Historical View: {availableDates.length} dates</p>
                <p>⚙️ Type: {windowType}</p>
                <p>🔍 Multiple D-day Analyses: {multipleAnalyses.length} windows</p>
              </div>
            </div>
            <button
              onClick={onBack}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* HR Selection & Matrix */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200 p-4">
            <span className="text-sm font-medium text-gray-600 mr-4">Select HR:</span>
            {hrChoices.length > 0 ? (
              hrChoices.map(hr => (
                <button
                  key={hr}
                  onClick={() => setActiveHR(hr)}
                  className={`mx-1 px-3 py-1 rounded-lg text-sm font-medium ${
                    activeHR === hr
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-green-100'
                  }`}
                >
                  HR {hr}
                </button>
              ))
            ) : (
              <span className="text-red-600 text-sm">
                No HR data available for any of the days in this window
              </span>
            )}
          </div>
          
          <div className="p-6">
            {activeHR ? (
              getAvailableSetsForDisplay().map(setName => (
                <div key={setName} className="mb-8">
                  <h2 className="text-lg font-bold mb-3 bg-green-50 p-2 rounded">
                    {setName}
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto border-collapse">
                      <thead>
                        <tr>
                          <th className="border border-gray-300 px-4 py-2 font-semibold bg-gray-100">
                            Element
                          </th>
                          {availableDates.map(dateKey => {
                            const dayLabel = getDayLabel(dateKey);
                            return (
                              <th key={dateKey} className={headerCellClass(dateKey)}>
                                <div className="text-center">
                                  <div>{generateColumnHeader(dateKey)}</div>
                                  {dayLabel && (
                                    <div className="text-xs mt-1 font-bold">
                                      ({dayLabel})
                                    </div>
                                  )}
                                </div>
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const elements = new Set();
                          // Only collect elements from dates that have data
                          availableDates.forEach(dateKey => {
                            const dayObj = allDaysData[dateKey];
                            if (dayObj?.success && dayObj.hrData[activeHR]?.sets[setName]) {
                              Object.keys(dayObj.hrData[activeHR].sets[setName]).forEach(el => elements.add(el));
                            }
                          });
                          return Array.from(elements).map(elName => (
                            <tr key={elName} className="hover:bg-gray-50">
                              <td className="border border-gray-300 px-4 py-2 font-medium bg-blue-200">
                                {elName}
                              </td>
                              {availableDates.map(dateKey => {
                                const dayObj = allDaysData[dateKey];
                                const dayLabel = getDayLabel(dateKey);
                                let cellValue = '—';
                                let cellClass = 'border border-gray-300 px-2 py-2 text-center font-mono text-xs';
                                
                                if (dayObj?.success && dayObj.hrData[activeHR]?.sets[setName]) {
                                  const elemMap = dayObj.hrData[activeHR].sets[setName] || {};
                                  cellValue = elemMap[elName]?.rawData || '—';
                                } else if (dayObj?.isEmpty) {
                                  cellValue = '(No Data)';
                                  cellClass += ' text-gray-400 italic';
                                }
                                
                                if (isDColumn(dateKey)) {
                                  cellClass += ' ring-2 ring-blue-400 bg-blue-50';
                                } else if (dayLabel) {
                                  cellClass += ' bg-green-50 text-gray-800'; // Recent 4 dates
                                } else {
                                  cellClass += ' bg-gray-50 text-gray-600'; // Older dates
                                }
                                
                                return (
                                  <td key={dateKey} className={cellClass}>
                                    {renderSimpleDayNumber(cellValue)}
                                  </td>
                                );
                              })}
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* PROMINENT ABCD-BCD NUMBER DISPLAY */}
                  {abcdBcdAnalysis[setName] && (
                    <div className="mt-4 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-gray-300 shadow-lg">
                      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                        🎯 ABCD & BCD Numbers for {setName}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* ABCD Numbers - Prominent Display */}
                        <div className="bg-white p-4 rounded-lg border-2 border-green-400 shadow-md">
                          <div className="text-center mb-3">
                            <span className="bg-green-600 text-white px-4 py-2 rounded-lg text-lg font-bold">
                              ABCD NUMBERS
                            </span>
                          </div>
                          <div className="text-center text-2xl font-mono font-bold text-green-800 mb-2">
                            {abcdBcdAnalysis[setName].abcdNumbers.length > 0 
                              ? abcdBcdAnalysis[setName].abcdNumbers.join(', ')
                              : 'None found'
                            }
                          </div>
                          <div className="text-center text-sm text-green-600">
                            Found in ≥2 of A,B,C days • Count: {abcdBcdAnalysis[setName].abcdNumbers.length}
                          </div>
                        </div>
                        
                        {/* BCD Numbers - Prominent Display */}
                        <div className="bg-white p-4 rounded-lg border-2 border-blue-400 shadow-md">
                          <div className="text-center mb-3">
                            <span className="bg-blue-600 text-white px-4 py-2 rounded-lg text-lg font-bold">
                              BCD NUMBERS
                            </span>
                          </div>
                          <div className="text-center text-2xl font-mono font-bold text-blue-800 mb-2">
                            {abcdBcdAnalysis[setName].bcdNumbers.length > 0 
                              ? abcdBcdAnalysis[setName].bcdNumbers.join(', ')
                              : 'None found'
                            }
                          </div>
                          <div className="text-center text-sm text-blue-600">
                            Exclusive B-D or C-D pairs • Count: {abcdBcdAnalysis[setName].bcdNumbers.length}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 text-center text-sm text-gray-600 bg-white p-2 rounded">
                        <strong>Analysis Data:</strong> D-day: {abcdBcdAnalysis[setName].dDayCount} numbers | 
                        A-day: {abcdBcdAnalysis[setName].aDayCount} | 
                        B-day: {abcdBcdAnalysis[setName].bDayCount} | 
                        C-day: {abcdBcdAnalysis[setName].cDayCount}
                      </div>
                      
                      {abcdBcdAnalysis[setName].error && (
                        <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                          ⚠️ {abcdBcdAnalysis[setName].error}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">🏠</div>
                <p className="text-lg font-semibold mb-2">Select an HR above</p>
                <p>Click an HR tab to view the matrices with D-date column highlighted</p>
              </div>
            )}
          </div>
        </div>

        {/* Multiple Window Analyses Display */}
        {multipleAnalyses.length > 0 && (
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b border-gray-200 p-4">
              <h2 className="text-xl font-bold text-gray-800">
                🔄 Multiple D-day Window Analyses
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Each window shows ABCD/BCD analysis with different dates as D-day
              </p>
            </div>
            
            <div className="p-6 space-y-6">
              {multipleAnalyses.map((analysis, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 text-purple-800">
                    📅 Window {analysis.windowId + 1}: D-day = {analysis.dDate}
                  </h3>
                  <div className="text-sm text-gray-600 mb-4">
                    <span className="font-medium">Sequence:</span> A={analysis.aDate} → B={analysis.bDate} → C={analysis.cDate} → D={analysis.dDate}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(analysis.sets).map(([setName, setAnalysis]) => (
                      <div key={setName} className="border-2 border-gray-300 rounded-lg p-4 bg-white shadow-md">
                        <h4 className="font-bold text-gray-800 mb-3 text-center text-lg">{setName}</h4>
                        
                        <div className="space-y-3">
                          {/* ABCD Numbers - Large Display */}
                          <div className="text-center">
                            <div className="mb-2">
                              <span className="bg-green-600 text-white px-3 py-1 rounded-lg font-bold text-sm">
                                ABCD
                              </span>
                            </div>
                            <div className="text-xl font-mono font-bold text-green-800">
                              {setAnalysis.abcdNumbers.length > 0 
                                ? setAnalysis.abcdNumbers.join(', ')
                                : 'None'
                              }
                            </div>
                          </div>
                          
                          {/* BCD Numbers - Large Display */}
                          <div className="text-center">
                            <div className="mb-2">
                              <span className="bg-blue-600 text-white px-3 py-1 rounded-lg font-bold text-sm">
                                BCD
                              </span>
                            </div>
                            <div className="text-xl font-mono font-bold text-blue-800">
                              {setAnalysis.bcdNumbers.length > 0 
                                ? setAnalysis.bcdNumbers.join(', ')
                                : 'None'
                              }
                            </div>
                          </div>
                          
                          <div className="text-center text-xs text-gray-600 pt-2 border-t">
                            D-day: {setAnalysis.dDayCount} numbers
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Information Panel */}
        <div className="bg-blue-50 rounded-lg p-4 mt-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">📝 Rule-1 Expanded Historical Analysis</h3>
          <div className="text-sm text-blue-700 space-y-2">
            <p><strong>🆓 Independent Mode:</strong> Works without Excel/Hour Entry requirements (like Rule-2)</p>
            <p><strong>📈 Historical View:</strong> Shows ALL dates before trigger date (not just 4)</p>
            <p><strong>🔄 Multiple D-day Analysis:</strong> Performs separate ABCD/BCD analysis for each possible 4-day window</p>
            <p><strong>🎯 Trigger Date:</strong> {date} (triggers analysis but not shown in matrix)</p>
            <p><strong>📊 Matrix Display:</strong> Recent 4 dates highlighted with A-B-C-D labels, D-date in blue</p>
            <p><strong>🎨 Color Coding:</strong> ABCD (green) and BCD (blue) labels show on D-date columns</p>
            <p><strong>📅 Current View:</strong> {availableDates.length} total dates, {multipleAnalyses.length} analysis windows</p>
            <p><strong>⚙️ Window Type:</strong> {windowType}</p>
            <p><strong>🔄 Graceful Handling:</strong> Missing data shows empty cells, doesn't block operation</p>
            {activeHR && Object.keys(abcdBcdAnalysis).length > 0 && (
              <p><strong>✅ Analysis Active:</strong> ABCD/BCD results computed for HR {activeHR}</p>
            )}
            {multipleAnalyses.length > 0 && (
              <p><strong>🎯 Multiple Windows:</strong> Each date can serve as D-day with its own ABCD/BCD analysis</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Rule1Page;