import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Rule2CompactPage - Compact 30-Topic ABCD-BCD Analysis
 * 
 * Displays results for all available sets in single-row format:
 * "D-1 Set-1 Matrix -ABCD Numbers- 6,7,8,10 / BCD Numbers- 1"
 */
const Rule2CompactPage = ({ date, selectedUser, datesList, onBack, activeHR }) => {
  const navigate = useNavigate();
  const userId = selectedUser;
  const [topicResults, setTopicResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analysisInfo, setAnalysisInfo] = useState({});
  const [selectedHR, setSelectedHR] = useState(activeHR || '1');
  const [availableHRs, setAvailableHRs] = useState([]);

  // Extract the FIRST number after element prefix, e.g. "as-7/su-..." → 7
  const extractElementNumber = (str) => {
    if (typeof str !== 'string') return null;
    
    // Look for pattern: element-NUMBER/ or element-NUMBER-
    const match = str.match(/^[a-z]+-(\d+)[\/\-]/);
    return match ? Number(match[1]) : null;
  };

  // Extract numbers from a specific set for a specific date using selected HR
  const extractFromDateAndSet = (targetDate, setName) => {
    const excelKey = `abcd_excel_${userId}_${targetDate}`;
    const hourKey = `abcd_hourEntry_${userId}_${targetDate}`;
    const rawExcel = localStorage.getItem(excelKey);
    const rawHour = localStorage.getItem(hourKey);
    
    if (!rawExcel || !rawHour) {
      return [];
    }
    
    try {
      const excelData = JSON.parse(rawExcel);
      const hourData = JSON.parse(rawHour);
      const sets = excelData.data?.sets || {};
      const planetSelections = hourData.planetSelections || {};
      
      const allNumbers = new Set();
      
      // Find the specific set
      const setData = sets[setName];
      if (setData) {
        // Use the selected HR for planet selection
        const selectedPlanet = planetSelections[selectedHR];
        
        if (selectedPlanet) {
          console.log(`🪐 Using planet ${selectedPlanet} from HR ${selectedHR} for ${setName} on ${targetDate}`);
          
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
          console.log(`❌ No planet selected for HR ${selectedHR} on ${targetDate}`);
        }
      }
      
      return Array.from(allNumbers).sort((a, b) => a - b);
      
    } catch (e) {
      return [];
    }
  };

  // Process ABCD-BCD analysis for a specific set
  const processSetAnalysis = (setName, aDay, bDay, cDay, dDay) => {
    // Extract numbers from each day for this specific set
    const dDayNumbers = extractFromDateAndSet(dDay, setName);
    const cDayNumbers = extractFromDateAndSet(cDay, setName);
    const bDayNumbers = extractFromDateAndSet(bDay, setName);
    const aDayNumbers = extractFromDateAndSet(aDay, setName);
    
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

    console.log(`🔍 ${setName} Analysis:`, {
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

  // Define the specific 30-topic order
  const TOPIC_ORDER = [
    'D-1 Set-1 Matrix',
    'D-1 Set-2 Matrix',
    'D-9 Set-1 Matrix',
    'D-9 Set-2 Matrix',
    'D-10 (trd) Set-1 Matrix',
    'D-10 (trd) Set-2 Matrix',
    'D-3 (trd) Set-1 Matrix',
    'D-3 (trd) Set-2 Matrix',
    'D-4 Set-1 Matrix',
    'D-4 Set-2 Matrix',
    'D-7 (trd) Set-1 Matrix',
    'D-7 (trd) Set-2 Matrix',
    'D-12 (trd) Set-1 Matrix',
    'D-12 (trd) Set-2 Matrix',
    'D-27 (trd) Set-1 Matrix',
    'D-27 (trd) Set-2 Matrix',
    'D-30 (sh) Set-1 Matrix',
    'D-30 (sh) Set-2 Matrix',
    'D-60 (Trd) Set-1 Matrix',
    'D-60 (Trd) Set-2 Matrix',
    'D-5 (pv) Set-1 Matrix',
    'D-5 (pv) Set-2 Matrix',
    'D-11 Set-1 Matrix',
    'D-11 Set-2 Matrix',
    'D-81 Set-1 Matrix',
    'D-81 Set-2 Matrix',
    'D-108 Set-1 Matrix',
    'D-108 Set-2 Matrix',
    'D-144 Set-1 Matrix',
    'D-144 Set-2 Matrix'
  ];

  // Get all available sets from D-day data in the specified order
  const getAllAvailableSets = (dDay) => {
    const excelKey = `abcd_excel_${userId}_${dDay}`;
    const rawExcel = localStorage.getItem(excelKey);
    
    if (!rawExcel) return [];
    
    try {
      const excelData = JSON.parse(rawExcel);
      const sets = excelData.data?.sets || {};
      const availableSetNames = Object.keys(sets);
      
      // Return sets in the predefined order, only including those that actually exist
      return TOPIC_ORDER.filter(topicName => availableSetNames.includes(topicName));
    } catch (e) {
      return [];
    }
  };

  // Get available HRs from D-day data
  const getAvailableHRs = (dDay) => {
    const hourKey = `abcd_hourEntry_${userId}_${dDay}`;
    const rawHour = localStorage.getItem(hourKey);
    
    if (!rawHour) return [];
    
    try {
      const hourData = JSON.parse(rawHour);
      const planetSelections = hourData.planetSelections || {};
      return Object.keys(planetSelections).sort((a, b) => parseInt(a) - parseInt(b));
    } catch (e) {
      return [];
    }
  };

  useEffect(() => {
    if (!datesList?.length) {
      setError('Date list is empty or invalid.');
      setLoading(false);
      return;
    }

    if (datesList.length < 4) {
      setError('Need at least 4 dates to perform ABCD-BCD number extraction');
      setLoading(false);
      return;
    }

    try {
      // Sort dates in ascending order (oldest to newest)
      const sortedDates = [...datesList].sort((a, b) => new Date(a) - new Date(b));
      
      // Find the clicked date position
      const clickedIndex = sortedDates.findIndex(d => d === date);
      
      if (clickedIndex < 4) {
        setError(`Rule-2 can only be triggered from the 5th date onwards. Current position: ${clickedIndex + 1}`);
        setLoading(false);
        return;
      }
      
      // Take the 4 dates BEFORE the clicked date as ABCD sequence
      const aDay = sortedDates[clickedIndex - 4]; // 4 days before clicked date
      const bDay = sortedDates[clickedIndex - 3]; // 3 days before clicked date
      const cDay = sortedDates[clickedIndex - 2]; // 2 days before clicked date
      const dDay = sortedDates[clickedIndex - 1]; // 1 day before clicked date (D-day source)

      // Get available HRs from D-day and set the first one if selectedHR not valid
      const hrOptions = getAvailableHRs(dDay);
      setAvailableHRs(hrOptions);
      
      if (hrOptions.length > 0 && !hrOptions.includes(selectedHR)) {
        setSelectedHR(hrOptions[0]);
      }

      console.log('🎯 Rule2CompactPage - Processing all sets:');
      console.log('Clicked date (Rule-2 trigger):', date);
      console.log('A-day (oldest in sequence):', aDay);
      console.log('B-day:', bDay);
      console.log('C-day:', cDay);
      console.log('D-day (analysis day):', dDay);
      console.log('🪐 Available HRs:', hrOptions, 'Selected HR:', selectedHR);

      // Get all available sets from D-day
      const availableSets = getAllAvailableSets(dDay);
      console.log('📊 Available sets:', availableSets);

      // Process each set
      const results = availableSets.map(setName => {
        const result = processSetAnalysis(setName, aDay, bDay, cDay, dDay);
        console.log(`📊 ${setName}: ABCD(${result.abcdNumbers.length}) BCD(${result.bcdNumbers.length}) D-day(${result.dDayCount})`);
        return result;
      });

      setTopicResults(results);
      setAnalysisInfo({
        aDay, bDay, cDay, dDay,
        triggerDate: date,
        totalSets: availableSets.length,
        selectedHR,
        availableHRs: hrOptions
      });
      setLoading(false);

    } catch (error) {
      console.error('Error in Rule2CompactPage analysis:', error);
      setError('Error performing ABCD-BCD analysis: ' + error.message);
      setLoading(false);
    }
  }, [userId, date, datesList, selectedHR]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-600">Processing 30-topic ABCD-BCD analysis…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-red-600 text-xl mb-2">⚠️ Analysis Error</div>
          <p className="mb-4 text-gray-700">{error}</p>
          <button onClick={onBack} className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg">
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const { aDay, bDay, cDay, dDay, totalSets, selectedHR: currentHR, availableHRs: hrOptions } = analysisInfo;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 border-t-4 border-purple-600">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">🔗 Rule-2 Compact Analysis (30-Topic Format)</h1>
              <div className="mt-2 text-sm text-purple-800">
                <p>👤 User: {userId}</p>
                <p>📅 Trigger Date (5th): {new Date(date).toLocaleDateString()}</p>
                <p>📊 Total Topics Processed: {totalSets}</p>
                <p>🪐 Selected HR: {selectedHR}</p>
                <p>⚙️ ABCD Sequence: A({new Date(aDay).toLocaleDateString()}) → B({new Date(bDay).toLocaleDateString()}) → C({new Date(cDay).toLocaleDateString()}) → D({new Date(dDay).toLocaleDateString()})</p>
              </div>
            </div>
            <button onClick={onBack} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
              ← Back
            </button>
          </div>
        </div>

        {/* HR Selection */}
        {availableHRs && availableHRs.length > 1 && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600">Select HR Period:</span>
              {availableHRs.map(hr => (
                <button
                  key={hr}
                  onClick={() => setSelectedHR(hr)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    selectedHR === hr
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
                  }`}
                >
                  HR {hr}
                </button>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Analysis uses planet selections from the chosen HR period for all 4 dates (A, B, C, D)
            </div>
          </div>
        )}

        {/* Compact Results Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            📋 30-Topic Single-Row Results
          </h2>
          
          <div className="space-y-2 font-mono text-sm">
            {topicResults.map((result, index) => {
              const abcdDisplay = result.abcdNumbers.length > 0 ? result.abcdNumbers.join(',') : 'None';
              const bcdDisplay = result.bcdNumbers.length > 0 ? result.bcdNumbers.join(',') : 'None';
              
              return (
                <div
                  key={result.setName}
                  className={`p-3 rounded border-l-4 ${
                    result.abcdNumbers.length > 0 || result.bcdNumbers.length > 0
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-blue-700">
                      {String(index + 1).padStart(2, '0')}.
                    </span>
                    <span className="font-bold text-gray-800">
                      {result.setName}
                    </span>
                    <span className="text-green-700">
                      -ABCD Numbers-
                    </span>
                    <span className="font-semibold bg-green-100 px-2 py-1 rounded">
                      {abcdDisplay}
                    </span>
                    <span className="text-blue-700">
                      / BCD Numbers-
                    </span>
                    <span className="font-semibold bg-blue-100 px-2 py-1 rounded">
                      {bcdDisplay}
                    </span>
                    <span className="text-xs text-gray-500 ml-auto">
                      (D-day: {result.dDayCount} numbers)
                    </span>
                  </div>
                  
                  {/* Additional debug info for empty results */}
                  {result.error && (
                    <div className="text-xs text-red-600 mt-1">
                      Error: {result.error}
                    </div>
                  )}
                  
                  {result.dDayCount === 0 && !result.error && (
                    <div className="text-xs text-gray-500 mt-1">
                      No source numbers found in D-day data for this set
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary Stats */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">📊 Summary Statistics</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• HR Period used: <strong>HR {selectedHR}</strong></p>
              <p>• Total topics analyzed: <strong>{topicResults.length}</strong></p>
              <p>• Topics with ABCD numbers: <strong>{topicResults.filter(r => r.abcdNumbers.length > 0).length}</strong></p>
              <p>• Topics with BCD numbers: <strong>{topicResults.filter(r => r.bcdNumbers.length > 0).length}</strong></p>
              <p>• Topics with any results: <strong>{topicResults.filter(r => r.abcdNumbers.length > 0 || r.bcdNumbers.length > 0).length}</strong></p>
              <p>• Total ABCD numbers found: <strong>{topicResults.reduce((sum, r) => sum + r.abcdNumbers.length, 0)}</strong></p>
              <p>• Total BCD numbers found: <strong>{topicResults.reduce((sum, r) => sum + r.bcdNumbers.length, 0)}</strong></p>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">🔍 Analysis Criteria</h4>
            <div className="text-xs text-blue-700 space-y-1">
              <p><strong>ABCD Numbers:</strong> D-day numbers that appear in at least 2 out of 3 preceding days (A, B, C)</p>
              <p><strong>BCD Numbers:</strong> D-day numbers that form exclusive B-D pairs OR exclusive C-D pairs (NOT both B and C)</p>
              <p><strong>Mutual Exclusivity:</strong> Numbers cannot appear in both ABCD and BCD categories - ABCD takes priority</p>
              <p><strong>Source:</strong> All numbers extracted from Set matrices using the selected planet for HR {selectedHR}</p>
              <p><strong>HR Selection:</strong> Uses the same HR period's planet selection across all 4 dates for consistent analysis</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rule2CompactPage;