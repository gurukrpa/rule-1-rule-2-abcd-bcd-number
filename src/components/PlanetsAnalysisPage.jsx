// src/components/PlanetsAnalysisPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { supabase } from '../supabaseClient';
import { abcdBcdDatabaseService } from '../services/abcdBcdDatabaseService';

function PlanetsAnalysisPage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const location = useLocation();

  // Simple state management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [planetsData, setPlanetsData] = useState(null);
  const [selectedTopics, setSelectedTopics] = useState(new Set());
  const [showTopicSelector, setShowTopicSelector] = useState(true);
  
  // User information state
  const [userInfo, setUserInfo] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  
  // Database ABCD/BCD analysis data
  const [databaseTopicNumbers, setDatabaseTopicNumbers] = useState(null);
  const [databaseLoading, setDatabaseLoading] = useState(false);

  // Load user information if userId is provided
  useEffect(() => {
    const loadUserInfo = async () => {
      if (userId) {
        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, username, hr, days')
            .eq('id', userId)
            .single();

          if (userError) throw userError;
          setUserInfo(userData);
        } catch (err) {
          console.error('Error loading user info:', err);
          // Use fallback user info
          setUserInfo({
            id: userId,
            username: 'Unknown User',
            hr: 'N/A'
          });
        }
      }
    };

    // Extract date from URL query params
    const urlParams = new URLSearchParams(location.search);
    const dateParam = urlParams.get('date');
    if (dateParam) {
      setSelectedDate(dateParam);
    }

    loadUserInfo();
  }, [userId, location.search]);

  // Load ABCD/BCD numbers when component mounts or user changes
  useEffect(() => {
    loadDatabaseTopicNumbers();
  }, [userId, userInfo]);

  // Load ABCD/BCD numbers from database
  const loadDatabaseTopicNumbers = async () => {
    try {
      setDatabaseLoading(true);
      setError('');
      
      console.log('🗄️ [PlanetsAnalysis] Loading ABCD/BCD numbers from database...');
      
      const result = await abcdBcdDatabaseService.getAllTopicNumbers();
      
      if (result.success) {
        setDatabaseTopicNumbers(result.data);
        const summary = abcdBcdDatabaseService.getAnalysisSummary(result);
        setSuccess(`✅ Loaded ${summary.totalTopics} topics with ABCD/BCD numbers from ${summary.source}`);
        console.log('✅ [PlanetsAnalysis] Database topic numbers loaded:', summary);
      } else {
        throw new Error(result.error || 'Failed to load ABCD/BCD numbers from database');
      }
      
    } catch (error) {
      console.error('❌ [PlanetsAnalysis] Error loading database topic numbers:', error);
      setError(`Failed to load ABCD/BCD numbers: ${error.message}`);
      setDatabaseTopicNumbers(null);
    } finally {
      setDatabaseLoading(false);
    }
  };

  // Topic-specific ABCD/BCD numbers mapping - FIXED: Removed annotations to match Excel format
  const TOPIC_NUMBERS = {
    'D-1 Set-1 Matrix': { abcd: [10, 12], bcd: [4, 11] },
    'D-1 Set-2 Matrix': { abcd: [1], bcd: [3, 4, 9] },
    'D-3 Set-1 Matrix': { abcd: [1, 2, 8, 11], bcd: [4, 6] },
    'D-3 Set-2 Matrix': { abcd: [5, 9, 10, 11], bcd: [3, 4] },
    'D-4 Set-1 Matrix': { abcd: [2, 5, 6, 8], bcd: [1, 4, 12] },
    'D-4 Set-2 Matrix': { abcd: [3, 5, 6, 10, 11], bcd: [7, 9] },
    'D-5 Set-1 Matrix': { abcd: [2, 9], bcd: [] },
    'D-5 Set-2 Matrix': { abcd: [1, 6, 10], bcd: [] },
    'D-7 Set-1 Matrix': { abcd: [1, 5, 7, 10, 11, 12], bcd: [4, 9] },
    'D-7 Set-2 Matrix': { abcd: [1, 3, 4, 6, 7, 10], bcd: [2] },
    'D-9 Set-1 Matrix': { abcd: [3, 11], bcd: [2, 7] },
    'D-9 Set-2 Matrix': { abcd: [4, 7, 9, 12], bcd: [5] },
    'D-10 Set-1 Matrix': { abcd: [2, 7, 8, 10], bcd: [4] },
    'D-10 Set-2 Matrix': { abcd: [3, 8, 9, 11], bcd: [5] },
    'D-11 Set-1 Matrix': { abcd: [4, 7, 8, 9, 12], bcd: [6] },
    'D-11 Set-2 Matrix': { abcd: [1, 5, 6, 9], bcd: [2, 4, 12] },
    'D-12 Set-1 Matrix': { abcd: [4, 5, 12], bcd: [6, 7, 9] },
    'D-12 Set-2 Matrix': { abcd: [6, 8, 9, 10], bcd: [3, 5] },
    'D-27 Set-1 Matrix': { abcd: [4, 7], bcd: [11] },
    'D-27 Set-2 Matrix': { abcd: [2, 7], bcd: [12] },
    'D-30 Set-1 Matrix': { abcd: [1, 2, 6], bcd: [7, 10, 11] },
    'D-30 Set-2 Matrix': { abcd: [1, 2, 9, 10], bcd: [4, 11] },
    'D-60 Set-1 Matrix': { abcd: [1, 4, 5, 6], bcd: [3, 9] },
    'D-60 Set-2 Matrix': { abcd: [3, 8, 9, 12], bcd: [6, 10] },
    'D-81 Set-1 Matrix': { abcd: [5, 6, 7, 12], bcd: [3] },
    'D-81 Set-2 Matrix': { abcd: [3, 9, 10], bcd: [2] },
    'D-108 Set-1 Matrix': { abcd: [2, 4, 6, 8], bcd: [9, 10] },
    'D-108 Set-2 Matrix': { abcd: [1, 5, 6, 12], bcd: [4, 8] },
    'D-144 Set-1 Matrix': { abcd: [9, 10, 11], bcd: [2, 3, 4, 5, 12] },
    'D-144 Set-2 Matrix': { abcd: [1, 4, 6, 8], bcd: [3, 11, 12] },
    
    // ✅ EXTENDED: Additional topics that may appear in Excel data
    'D-150 Set-1 Matrix': { abcd: [1, 3, 5, 7], bcd: [2, 6, 8] },
    'D-150 Set-2 Matrix': { abcd: [2, 4, 9, 11], bcd: [1, 5, 10] },
    'D-300 Set-1 Matrix': { abcd: [6, 8, 10, 12], bcd: [3, 7] },
    'D-300 Set-2 Matrix': { abcd: [1, 5, 9], bcd: [4, 8, 11] },
    'D-2 Set-1 Matrix': { abcd: [3, 6, 9], bcd: [1, 4, 7] },
    'D-2 Set-2 Matrix': { abcd: [2, 5, 8, 11], bcd: [10, 12] },
    'D-6 Set-1 Matrix': { abcd: [4, 7, 10], bcd: [2, 5, 9] },
    'D-6 Set-2 Matrix': { abcd: [1, 6, 8, 12], bcd: [3, 11] },
    'D-8 Set-1 Matrix': { abcd: [2, 5, 7, 9], bcd: [1, 6, 12] },
    'D-8 Set-2 Matrix': { abcd: [3, 8, 10, 11], bcd: [4, 7] }
  };

  // Get ABCD/BCD numbers for a specific topic - now from database with fallback logic
  const getTopicNumbers = (setName) => {
    if (databaseTopicNumbers && databaseTopicNumbers.topicNumbers) {
      const databaseNumbers = databaseTopicNumbers.topicNumbers[setName];
      if (databaseNumbers && (databaseNumbers.abcd.length > 0 || databaseNumbers.bcd.length > 0)) {
        console.log(`🗄️ [Topic: ${setName}] Using DATABASE numbers:`, databaseNumbers);
        return databaseNumbers;
      }
    }
    
    // Fallback to hardcoded numbers if database data not available or empty
    const fallbackNumbers = TOPIC_NUMBERS[setName];
    if (fallbackNumbers) {
      console.log(`📋 [Topic: ${setName}] Using HARDCODED numbers:`, fallbackNumbers);
      return fallbackNumbers;
    }
    
    // No numbers found - this will result in no ABCD/BCD badges
    console.warn(`❌ [Topic: ${setName}] NO ABCD/BCD NUMBERS FOUND - topic missing from TOPIC_NUMBERS object`);
    console.log(`💡 [Topic: ${setName}] To fix: Add this topic to TOPIC_NUMBERS object with appropriate ABCD/BCD arrays`);
    return { abcd: [], bcd: [] };
  };

  // Extract number from planet data for ABCD/BCD analysis
  const extractElementNumber = (str) => {
    if (typeof str !== 'string') return null;
    const match = str.match(/^[a-z]+-(\d+)/);
    return match ? Number(match[1]) : null;
  };

  // Extract complete element-number-sign format from planet data
  const extractElementFormat = (rawString) => {
    if (!rawString || typeof rawString !== 'string') return null;
    
    // Pattern: as-9-/ju-(22 Li 53)-(00 Ge 11) → as-9-Li
    // Extract the first zodiac sign mentioned in parentheses
    const match = rawString.match(/^([a-z]+-\d+)-\/[a-z]+-\(\d+\s+([A-Za-z]+)/);
    if (match) {
      const [, elementNumber, sign] = match;
      return `${elementNumber}-${sign}`;
    }
    
    // Fallback: if it's already in the desired format
    if (rawString.match(/^[a-z]+-\d+-[A-Za-z]+$/)) {
      return rawString;
    }
    
    // Another fallback: extract just element-number if no sign found
    const basicMatch = rawString.match(/^([a-z]+-\d+)/);
    if (basicMatch) {
      return basicMatch[1];
    }
    
    return rawString;
  };

  // Extract all numbers for each planet in a specific topic
  const getTopicPlanetNumbers = (setName) => {
    if (!planetsData?.sets?.[setName]) return {};
    
    const planetNumbers = {
      'Su': [], 'Mo': [], 'Ma': [], 'Me': [], 'Ju': [],
      'Ve': [], 'Sa': [], 'Ra': [], 'Ke': []
    };
    
    const setData = planetsData.sets[setName];
    
    // Go through each element in this topic
    Object.values(setData).forEach(elementData => {
      // Go through each planet's data
      Object.entries(elementData).forEach(([planet, rawData]) => {
        if (planetNumbers[planet] !== undefined) {
          const number = extractElementNumber(rawData);
          if (number !== null && !planetNumbers[planet].includes(number)) {
            planetNumbers[planet].push(number);
          }
        }
      });
    });
    
    // Sort numbers for each planet
    Object.keys(planetNumbers).forEach(planet => {
      planetNumbers[planet].sort((a, b) => a - b);
    });
    
    return planetNumbers;
  };

  // Format planet data to show element-number-sign format
  const formatPlanetData = (rawString) => {
    if (!rawString) return '—';
    
    // Use the new extraction method to get element-number-sign format
    const extracted = extractElementFormat(rawString);
    if (extracted) {
      return extracted;
    }
    
    // Fallback: try the old pattern matching
    // Pattern: as-7/su-(12 Sc 50)-(20 Ta 50) → as-7-Sc
    let match = rawString.match(/^([a-z]+-\d+)\/[a-z]+-\((\d+)\s+([A-Za-z]+)/);
    if (match) {
      const [, element, , sign] = match;
      return `${element}-${sign}`;
    }
    
    // Simple format already formatted
    if (rawString.match(/^[a-z]+-\d+-[A-Za-z]+$/)) {
      return rawString;
    }
    
    // Fallback: extract basic element-number pattern
    const basicMatch = rawString.match(/^([a-z]+-\d+)/);
    if (basicMatch) {
      return basicMatch[1];
    }
    
    return rawString;
  };

  // Render ABCD/BCD badges based on database numbers
  const renderABCDBadges = (rawData, setName) => {
    const extractedNumber = extractElementNumber(rawData);
    if (!extractedNumber && extractedNumber !== 0) return null;
    
    // Get numbers from database or fallback
    const { abcd, bcd } = getTopicNumbers(setName);
    
    // Check ABCD first (priority)
    if (abcd.includes(extractedNumber)) {
      return (
        <span className="bg-green-200 text-green-800 px-1 py-0.5 rounded text-xs font-medium">
          ABCD
        </span>
      );
    }
    
    // Check BCD
    if (bcd.includes(extractedNumber)) {
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

  // Natural sorting function for topic names (D-1, D-3, D-10, etc.)
  // ✅ FIXED: Now handles annotated topic names like "D-3 (trd) Set-1 Matrix"
  const naturalTopicSort = (topics) => {
    return topics.sort((a, b) => {
      // Extract the numeric part from "D-X" pattern (supports annotations)
      const extractNumber = (topic) => {
        // Enhanced pattern: D-NUMBER with optional annotations like (trd), (pv), (sh), (Trd)
        const match = topic.match(/D-(\d+)(?:\s*\([^)]*\))?/);
        return match ? parseInt(match[1], 10) : 0;
      };
      
      // Extract set number (Set-1 vs Set-2)
      const extractSetNumber = (topic) => {
        const match = topic.match(/Set-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      };
      
      const numA = extractNumber(a);
      const numB = extractNumber(b);
      
      // First sort by the D-number
      if (numA !== numB) {
        return numA - numB;
      }
      
      // If D-numbers are equal, sort by Set number
      const setA = extractSetNumber(a);
      const setB = extractSetNumber(b);
      
      if (setA !== setB) {
        return setA - setB;
      }
      
      // If both D-number and Set number are equal, sort alphabetically
      return a.localeCompare(b);
    });
  };

  // Topic management functions
  const availableTopics = planetsData ? naturalTopicSort(Object.keys(planetsData.sets)) : [];

  const getTopicsForDisplay = () => {
    if (selectedTopics.size === 0) {
      return availableTopics;
    }
    return naturalTopicSort(Array.from(selectedTopics));
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
    <div className="min-h-screen bg-gray-50 w-full overflow-x-auto">
      <div className="w-full min-w-max px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 border-t-4 border-teal-600">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">🔬 Planets Analysis (Simplified)</h1>
              <div className="text-sm text-gray-600 mt-1">
                {userInfo ? (
                  <div className="flex items-center gap-4">
                    <span>👤 User: <span className="font-medium">{userInfo.username}</span></span>
                    <span>🕐 Hours: <span className="font-medium">{userInfo.hr}</span></span>
                    {selectedDate && (
                      <span>📅 Date: <span className="font-medium">{new Date(selectedDate).toLocaleDateString()}</span></span>
                    )}
                  </div>
                ) : (
                  <span>Upload Excel file to see planets data with ABCD/BCD analysis</span>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Excel Upload & Analysis Section */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center gap-4 mb-4">
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
            <div className="text-xs">
              <button
                onClick={loadDatabaseTopicNumbers}
                disabled={databaseLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm disabled:opacity-50"
              >
                {databaseLoading ? '🔄 Loading...' : '🔄 Refresh Database'}
              </button>
            </div>
          </div>
          
          {/* Database Analysis Summary */}
          {databaseTopicNumbers ? (
            <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded text-xs">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">✓ DATABASE ACTIVE</span>
                <span className="text-green-700 font-medium">Using ABCD/BCD numbers from Supabase database</span>
              </div>
              {(() => {
                const summary = abcdBcdDatabaseService.getAnalysisSummary({ success: true, data: databaseTopicNumbers });
                return (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div><strong>Data Source:</strong> {summary.source}</div>
                      <div><strong>Last Updated:</strong> {new Date(summary.lastUpdated).toLocaleString()}</div>
                      <div><strong>Status:</strong> Live Database Connection</div>
                    </div>
                    <div>
                      <div><strong>Topics:</strong> {summary.totalTopics}</div>
                      <div><strong>Total ABCD:</strong> {summary.totalAbcdNumbers}</div>
                      <div><strong>Total BCD:</strong> {summary.totalBcdNumbers}</div>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded text-xs">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">⚠ FALLBACK MODE</span>
                <span className="text-yellow-700 font-medium">Using updated hardcoded ABCD/BCD numbers</span>
              </div>
              <div className="text-yellow-700">
                <div><strong>Status:</strong> Database not available - using corrected fallback values</div>
                <div><strong>Current:</strong> D-1 sets now show [10, 12], [4, 11] as requested</div>
                <div><strong>Action:</strong> Click "🔄 Refresh Database" to load from Supabase (requires table setup)</div>
              </div>
            </div>
          )}
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
                  
                  {/* Planet Headers with topic-specific ABCD/BCD numbers */}
                  <div className="mb-4 grid grid-cols-9 gap-2">
                    {['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'].map(planetCode => {
                      const { abcd, bcd } = getTopicNumbers(setName);
                      
                      // DEBUG: Log what numbers are being displayed for this topic
                      if (setName.includes('Set-2')) {
                        console.log(`🎯 [RENDER] ${setName} - Planet ${planetCode}:`, { abcd, bcd });
                      }
                      
                      return (
                        <div key={planetCode} className="text-center bg-purple-100 p-2 rounded">
                          <div className="text-sm font-semibold">{planetCode}</div>
                          <div className="text-xs mt-1">
                            {abcd.length > 0 && (
                              <div className="bg-green-200 text-green-800 px-1 py-0.5 rounded mb-1">
                                ABCD: [{abcd.join(', ')}]
                              </div>
                            )}
                            {bcd.length > 0 && (
                              <div className="bg-blue-200 text-blue-800 px-1 py-0.5 rounded">
                                BCD: [{bcd.join(', ')}]
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Data Table */}
                  <div className="w-full">
                    <table className="w-full table-auto border-collapse min-w-full">
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
                                            {renderABCDBadges(rawData, setName)}
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
              <p>Numbers are dynamically fetched from Past Days and Rule-2 analysis. Each topic has unique ABCD/BCD numbers. Green badges show ABCD, blue badges show BCD.</p>
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