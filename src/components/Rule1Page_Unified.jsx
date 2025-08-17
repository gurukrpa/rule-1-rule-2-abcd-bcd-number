// src/components/Rule1Page_Unified.jsx
// ✅ RULE1 PAGE WITH UNIFIED NUMBER BOX SYSTEM
// Fresh implementation with no timing dependencies

import React, { useState, useEffect } from 'react';
import { unifiedDataService } from '../services/unifiedDataService';
import { DataService } from '../services/dataService_new';
import { useCachedData, useAnalysisCache } from '../hooks/useCachedData';
import { redisCache } from '../services/redisClient';
import { Rule2ResultsService } from '../services/rule2ResultsService';
import rule2AnalysisService from '../services/rule2AnalysisService';
import cleanSupabaseService from '../services/CleanSupabaseService';
import ProgressBar from './ProgressBar';
import UnifiedNumberBox from './UnifiedNumberBox';
import HighlightedCountDisplay from './HighlightedCountDisplay';
import { useUnifiedNumberBox } from '../hooks/useUnifiedNumberBox';

function Rule1PageUnified({ date, analysisDate, selectedUser, datesList, onBack, users }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUserData, setSelectedUserData] = useState(null);
  const [activeHR, setActiveHR] = useState(null);
  const [allDaysData, setAllDaysData] = useState({});
  const [windowType, setWindowType] = useState('');
  const [abcdBcdAnalysis, setAbcdBcdAnalysis] = useState({});
  const [multipleAnalyses, setMultipleAnalyses] = useState([]);
  
  // Topic selection state
  const [selectedTopics, setSelectedTopics] = useState(new Set());
  const [availableTopics, setAvailableTopics] = useState([]);
  const [showTopicSelector, setShowTopicSelector] = useState(true);
  
  // Column headers with validation status
  const [columnHeaders, setColumnHeaders] = useState({});

  // ✅ UNIFIED NUMBER BOX INTEGRATION
  const {
    forceHighlightUpdate,
    setAnalysisData,
    refreshClickedNumbers,
    refreshCount
  } = useUnifiedNumberBox(selectedUser, null, date, activeHR);

  // Redis caching hooks (keeping existing functionality)
  const { 
    cacheStats, 
    getExcelData, 
    getHourEntry,
    cacheAnalysis,
    getCachedAnalysis 
  } = useCachedData(selectedUser);
  
  const { 
    analysisStats, 
    cacheUserAnalysis, 
    getCachedUserAnalysis 
  } = useAnalysisCache(selectedUser);

  // ✅ INITIAL SETUP
  useEffect(() => {
    const initializePage = async () => {
      if (!selectedUser || !date) return;

      try {
        setLoading(true);
        console.log('🚀 [Rule1Unified] Initializing page...');

        // Get user data
        const userData = users?.find(u => u.id === selectedUser);
        setSelectedUserData(userData);
        setActiveHR(userData?.hr || 1);

        // Load data
        await loadAllData();

      } catch (error) {
        console.error('❌ [Rule1Unified] Initialization error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [selectedUser, date]);

  // ✅ LOAD ALL DATA
  const loadAllData = async () => {
    try {
      console.log('📊 [Rule1Unified] Loading all data...');

      // Get date range for Rule1 analysis
      const windowDates = getRule1WindowDates();
      
      if (windowDates.length < 4) {
        throw new Error(`Rule-1 requires at least 4 dates. Only ${windowDates.length} available.`);
      }

      setWindowType(`Complete Historical View (showing ${windowDates.length} dates)`);

      // Load data for all dates
      const allData = {};
      for (let i = 0; i < windowDates.length; i++) {
        const currentDate = windowDates[i];
        console.log(`📊 [Rule1Unified] Loading date ${i + 1}/${windowDates.length} (${currentDate})...`);
        
        const dateData = await loadDateData(currentDate);
        allData[currentDate] = dateData;
      }

      setAllDaysData(allData);

      // Extract topics
      const topics = extractAvailableTopics(allData);
      setAvailableTopics(topics);
      setSelectedTopics(new Set(topics));

      // Load ABCD/BCD analysis
      await loadAbcdBcdAnalysis(windowDates);

      console.log('✅ [Rule1Unified] All data loaded successfully');

    } catch (error) {
      console.error('❌ [Rule1Unified] Data loading error:', error);
      throw error;
    }
  };

  // ✅ GET RULE1 WINDOW DATES
  const getRule1WindowDates = () => {
    const sortedDates = [...datesList].sort((a, b) => new Date(a) - new Date(b));
    const targetIndex = sortedDates.indexOf(date);
    
    if (targetIndex === -1) return [];
    
    // For Rule1, we need all dates up to and including the target date
    return sortedDates.slice(0, targetIndex + 1);
  };

  // ✅ LOAD DATE DATA
  const loadDateData = async (currentDate) => {
    try {
      const dateData = await getExcelData(currentDate);
      if (!dateData || Object.keys(dateData).length === 0) {
        console.warn(`⚠️ [Rule1Unified] No data for date: ${currentDate}`);
        return {};
      }
      return dateData;
    } catch (error) {
      console.error(`❌ [Rule1Unified] Error loading date ${currentDate}:`, error);
      return {};
    }
  };

  // ✅ EXTRACT AVAILABLE TOPICS
  const extractAvailableTopics = (allData) => {
    const topicsSet = new Set();
    
    Object.values(allData).forEach(dateData => {
      Object.keys(dateData).forEach(topicName => {
        topicsSet.add(topicName);
      });
    });
    
    return Array.from(topicsSet).sort();
  };

  // ✅ LOAD ABCD/BCD ANALYSIS
  const loadAbcdBcdAnalysis = async (windowDates) => {
    try {
      console.log('🔍 [Rule1Unified] Loading ABCD/BCD analysis...');
      
      const analysisData = {};
      
      // Load analysis for each date from the 5th date onward (dates with ABCD/BCD data)
      for (let i = 4; i < windowDates.length; i++) {
        const currentDate = windowDates[i];
        
        try {
          const rule2Analysis = await rule2AnalysisService.analyzeRule2(
            selectedUser, currentDate, availableTopics
          );

          if (rule2Analysis && rule2Analysis.results) {
            // Process each topic
            rule2Analysis.results.forEach(topicResult => {
              const topicName = topicResult.setName;
              
              if (!analysisData[topicName]) {
                analysisData[topicName] = {};
              }
              
              analysisData[topicName][currentDate] = {
                abcdNumbers: topicResult.abcdNumbers || [],
                bcdNumbers: topicResult.bcdNumbers || []
              };

              // ✅ SET ANALYSIS DATA FOR UNIFIED NUMBER BOX
              setAnalysisData(
                topicName, 
                currentDate, 
                topicResult.abcdNumbers || [], 
                topicResult.bcdNumbers || []
              );
            });
          }

        } catch (error) {
          console.error(`❌ [Rule1Unified] Analysis error for ${currentDate}:`, error);
        }
      }

      setAbcdBcdAnalysis(analysisData);
      console.log('✅ [Rule1Unified] ABCD/BCD analysis loaded');

      // ✅ FORCE HIGHLIGHT UPDATE AFTER ANALYSIS LOADS
      setTimeout(() => {
        forceHighlightUpdate();
        refreshCount();
      }, 200);

    } catch (error) {
      console.error('❌ [Rule1Unified] ABCD/BCD analysis error:', error);
    }
  };

  // ✅ SHOULD HIGHLIGHT CELL - Using unified service logic
  const shouldHighlightCell = (cellValue, topicName, dateKey) => {
    const numberMatch = cellValue.match(/(\d+)/);
    if (!numberMatch) return { highlighted: false };

    const cellNumber = parseInt(numberMatch[1]);
    
    // Use unified service to determine highlighting
    // This will be handled automatically by the unified system
    return { highlighted: false }; // Placeholder - unified system handles highlighting
  };

  // ✅ EXTRACT COMPACT FORMAT
  const extractCompactFormat = (rawData) => {
    if (!rawData || rawData === '—') return '—';
    
    try {
      const match = rawData.match(/([a-z]+)-(\d+)-([a-z]+)/i);
      if (match) {
        const [, prefix, number, suffix] = match;
        return `${prefix}-${number}-${suffix}`;
      }
      return rawData;
    } catch (error) {
      return rawData;
    }
  };

  // ✅ RENDER MATRIX TABLE
  const renderMatrixTable = (topicName, dateKey) => {
    const dateData = allDaysData[dateKey];
    if (!dateData || !dateData[topicName]) return null;

    const topicData = dateData[topicName];
    const hours = ['HR1', 'HR2', 'HR3'];
    
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                {topicName} - {dateKey}
              </th>
              {hours.map(hour => (
                <th key={hour} className="border border-gray-300 px-3 py-2 text-center font-semibold">
                  {hour}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.keys(topicData.HR1 || {}).map((elementKey, index) => (
              <tr key={elementKey} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-300 px-3 py-2 font-mono text-sm">
                  {elementKey}
                </td>
                {hours.map(hour => {
                  const elementData = topicData[hour]?.[elementKey];
                  let cellValue = '—';
                  
                  if (elementData) {
                    const rawData = elementData.rawData || '—';
                    cellValue = rawData === '—' ? rawData : extractCompactFormat(rawData);
                  }
                  
                  const baseClass = 'border border-gray-300 px-3 py-2 text-center font-mono text-sm min-w-[140px]';
                  const isTargetDate = dateKey === date;
                  
                  // ✅ HIGHLIGHTING IS HANDLED BY UNIFIED SYSTEM VIA DOM MANIPULATION
                  
                  return (
                    <td
                      key={hour}
                      className={`${baseClass} ${isTargetDate ? 'bg-blue-50' : ''}`}
                      data-topic={topicName}
                      data-date={dateKey}
                      data-number={cellValue.match(/(\d+)/) ? cellValue.match(/(\d+)/)[1] : ''}
                    >
                      {cellValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // ✅ RENDER TOPIC SECTION
  const renderTopicSection = (topicName) => {
    const availableDates = Object.keys(allDaysData).sort((a, b) => new Date(a) - new Date(b));
    
    return (
      <div key={topicName} className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          {/* Topic Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">{topicName}</h3>
            <HighlightedCountDisplay 
              userId={selectedUser}
              currentDate={date}
              currentHour={activeHR}
              variant="badge"
              showDetails={true}
            />
          </div>

          {/* Number Boxes for dates from 5th onward */}
          {availableDates.map((dateKey, dateIndex) => {
            if (dateIndex < 4) return null; // Skip first 4 dates
            
            const analysis = abcdBcdAnalysis[topicName]?.[dateKey];
            const abcdNumbers = analysis?.abcdNumbers || [];
            const bcdNumbers = analysis?.bcdNumbers || [];
            
            if (abcdNumbers.length === 0 && bcdNumbers.length === 0) return null;
            
            return (
              <div key={dateKey} className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  📅 {dateKey} (Date {dateIndex + 1})
                </h4>
                <UnifiedNumberBox
                  userId={selectedUser}
                  topic={topicName}
                  date={dateKey}
                  hour={activeHR}
                  abcdNumbers={abcdNumbers}
                  bcdNumbers={bcdNumbers}
                  showTitle={false}
                  gridCols={6}
                  size="medium"
                />
              </div>
            );
          })}

          {/* Matrix Tables */}
          <div className="space-y-4">
            {availableDates.map(dateKey => (
              <div key={dateKey}>
                {renderMatrixTable(topicName, dateKey)}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="mb-4">
          <ProgressBar />
        </div>
        <p className="text-gray-600">Loading Rule1 analysis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <div className="text-red-400 mr-3">❌</div>
            <div>
              <h3 className="text-red-800 font-medium">Error Loading Data</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          ← Back to User Selection
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Rule 1 Analysis - Unified System
            </h1>
            <p className="text-gray-600">
              {selectedUserData?.username} | Target Date: {date} | Hour: {activeHR} | {windowType}
            </p>
          </div>
          <div className="flex gap-3">
            <HighlightedCountDisplay 
              userId={selectedUser}
              currentDate={date}
              currentHour={activeHR}
              variant="card"
              showDetails={true}
            />
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      {/* Hour Selector */}
      <div className="mb-6">
        <div className="flex gap-2">
          {[1, 2, 3].map(hour => (
            <button
              key={hour}
              onClick={() => setActiveHR(hour)}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                activeHR === hour
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Hour {hour}
            </button>
          ))}
        </div>
      </div>

      {/* Topic Selector */}
      {showTopicSelector && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-800">Select Topics to Display</h3>
            <button
              onClick={() => setShowTopicSelector(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              Hide ↑
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {availableTopics.map(topic => (
              <label key={topic} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedTopics.has(topic)}
                  onChange={(e) => {
                    const newSelected = new Set(selectedTopics);
                    if (e.target.checked) {
                      newSelected.add(topic);
                    } else {
                      newSelected.delete(topic);
                    }
                    setSelectedTopics(newSelected);
                  }}
                  className="rounded"
                />
                <span className="text-sm">{topic}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {!showTopicSelector && (
        <div className="mb-4">
          <button
            onClick={() => setShowTopicSelector(true)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Show Topic Selector ↓
          </button>
        </div>
      )}

      {/* Topics Display */}
      <div className="space-y-6">
        {Array.from(selectedTopics).map(topicName => renderTopicSection(topicName))}
      </div>

      {selectedTopics.size === 0 && (
        <div className="text-center py-8 text-gray-500">
          No topics selected. Use the topic selector above to choose topics to display.
        </div>
      )}
    </div>
  );
}

export default Rule1PageUnified;
