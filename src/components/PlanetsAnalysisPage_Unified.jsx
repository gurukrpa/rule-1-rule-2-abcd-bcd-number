// src/components/PlanetsAnalysisPage_Unified.jsx
// ✅ PLANETS ANALYSIS PAGE WITH UNIFIED NUMBER BOX SYSTEM
// Cross-page sync with Rule1 page ensured

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { supabase } from '../supabaseClient';
import { abcdBcdDatabaseService } from '../services/abcdBcdDatabaseService';
import { PlanetsAnalysisDataService } from '../services/planetsAnalysisDataService';
import { DateValidationService } from '../services/dateValidationService.js';
import { DateManagementService } from '../utils/dateManagement.js';
import UnifiedNumberBox from './UnifiedNumberBox';
import HighlightedCountDisplay from './HighlightedCountDisplay';
import { useUnifiedNumberBox } from '../hooks/useUnifiedNumberBox';

function PlanetsAnalysisPageUnified() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const location = useLocation();

  // Basic state management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [planetsData, setPlanetsData] = useState(null);
  const [selectedTopics, setSelectedTopics] = useState(new Set());
  const [showTopicSelector, setShowTopicSelector] = useState(true);
  
  // User information state
  const [userInfo, setUserInfo] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  
  // Hour tab functionality
  const [selectedHour, setSelectedHour] = useState(1);
  const [hourTabsData, setHourTabsData] = useState({});
  const [hourSwitchLoading, setHourSwitchLoading] = useState(false);
  
  // Database ABCD/BCD analysis data
  const [databaseTopicNumbers, setDatabaseTopicNumbers] = useState(null);
  const [databaseLoading, setDatabaseLoading] = useState(false);
  const [realAnalysisData, setRealAnalysisData] = useState(null);
  const [dataSource, setDataSource] = useState('loading');

  // ✅ UNIFIED NUMBER BOX INTEGRATION
  const {
    forceHighlightUpdate,
    setAnalysisData,
    refreshClickedNumbers,
    refreshCount
  } = useUnifiedNumberBox(userId, null, selectedDate, selectedHour);

  // Planet codes constant
  const PLANET_CODES = ['Su', 'Mo', 'Ma', 'Me', 'Ju', 'Ve', 'Sa', 'Ra', 'Ke'];

  // ✅ LOAD USER INFORMATION
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
          setSelectedHour(userData.hr || 1);
          
          console.log('✅ [PlanetsUnified] User info loaded:', userData);

        } catch (error) {
          console.error('❌ [PlanetsUnified] User loading error:', error);
          setError('Failed to load user information');
        }
      }
    };

    loadUserInfo();
  }, [userId]);

  // ✅ HANDLE FILE UPLOAD
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      console.log('📁 [PlanetsUnified] Processing file:', file.name);

      // Read Excel file
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      
      // Process each sheet as a topic
      const processedData = {};
      
      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length > 0) {
          processedData[sheetName] = jsonData;
        }
      }

      setPlanetsData(processedData);
      
      // Extract available topics
      const topics = Object.keys(processedData);
      setSelectedTopics(new Set(topics));
      
      // Load ABCD/BCD analysis data
      await loadDatabaseAnalysis();
      
      setSuccess(`Successfully loaded ${topics.length} topics from ${file.name}`);
      console.log('✅ [PlanetsUnified] File processed successfully');

    } catch (error) {
      console.error('❌ [PlanetsUnified] File upload error:', error);
      setError('Failed to process Excel file: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOAD DATABASE ANALYSIS
  const loadDatabaseAnalysis = async () => {
    if (!userId || !selectedDate) return;

    try {
      setDatabaseLoading(true);
      console.log('🔍 [PlanetsUnified] Loading ABCD/BCD analysis from database...');

      const analysisData = await abcdBcdDatabaseService.getTopicNumbers(userId, selectedDate);
      
      if (analysisData && Object.keys(analysisData).length > 0) {
        setRealAnalysisData(analysisData);
        setDataSource('database');
        
        // ✅ SET ANALYSIS DATA FOR UNIFIED NUMBER BOX
        Object.keys(analysisData).forEach(topicName => {
          const topicData = analysisData[topicName];
          setAnalysisData(
            topicName,
            selectedDate,
            topicData.abcdNumbers || [],
            topicData.bcdNumbers || []
          );
        });

        console.log('✅ [PlanetsUnified] Database analysis loaded');
        
        // ✅ FORCE HIGHLIGHT UPDATE
        setTimeout(() => {
          forceHighlightUpdate();
          refreshCount();
        }, 200);
        
      } else {
        setDataSource('none');
        console.log('ℹ️ [PlanetsUnified] No database analysis found');
      }

    } catch (error) {
      console.error('❌ [PlanetsUnified] Database analysis error:', error);
      setDataSource('error');
    } finally {
      setDatabaseLoading(false);
    }
  };

  // ✅ HANDLE HOUR CHANGE
  const handleHourChange = (hour) => {
    setHourSwitchLoading(true);
    setSelectedHour(hour);
    
    setTimeout(() => {
      setHourSwitchLoading(false);
      // Refresh unified number box data
      refreshClickedNumbers();
      refreshCount();
      forceHighlightUpdate();
    }, 300);
  };

  // ✅ HANDLE DATE CHANGE
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    if (newDate) {
      loadDatabaseAnalysis();
    }
  };

  // ✅ RENDER TOPIC SECTION
  const renderTopicSection = (topicName, topicData) => {
    if (!Array.isArray(topicData) || topicData.length === 0) return null;

    const analysis = realAnalysisData?.[topicName];
    const abcdNumbers = analysis?.abcdNumbers || [];
    const bcdNumbers = analysis?.bcdNumbers || [];

    return (
      <div key={topicName} className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          {/* Topic Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">{topicName}</h3>
            <HighlightedCountDisplay 
              userId={userId}
              currentDate={selectedDate}
              currentHour={selectedHour}
              variant="badge"
              showDetails={false}
            />
          </div>

          {/* Number Box */}
          {(abcdNumbers.length > 0 || bcdNumbers.length > 0) && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <UnifiedNumberBox
                userId={userId}
                topic={topicName}
                date={selectedDate}
                hour={selectedHour}
                abcdNumbers={abcdNumbers}
                bcdNumbers={bcdNumbers}
                showTitle={true}
                gridCols={6}
                size="medium"
              />
            </div>
          )}

          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  {topicData[0]?.map((header, index) => (
                    <th key={index} className="border border-gray-300 px-3 py-2 text-left font-semibold">
                      {header || `Column ${index + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topicData.slice(1).map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {row.map((cell, cellIndex) => {
                      const cellValue = cell || '';
                      
                      return (
                        <td
                          key={cellIndex}
                          className="border border-gray-300 px-3 py-2 text-sm"
                          data-topic={topicName}
                          data-date={selectedDate}
                          data-number={cellValue.toString().match(/(\d+)/) ? cellValue.toString().match(/(\d+)/)[1] : ''}
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

          {/* Analysis Info */}
          {analysis && (
            <div className="mt-4 p-3 bg-blue-50 rounded">
              <div className="text-sm text-blue-800">
                <strong>Analysis Data:</strong> ABCD: [{abcdNumbers.join(', ')}] | BCD: [{bcdNumbers.join(', ')}]
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Planets Analysis - Unified System
            </h1>
            <p className="text-gray-600">
              {userInfo?.username} | Date: {selectedDate || 'Select date'} | Hour: {selectedHour}
            </p>
          </div>
          <div className="flex gap-3">
            <HighlightedCountDisplay 
              userId={userId}
              currentDate={selectedDate}
              currentHour={selectedHour}
              variant="card"
              showDetails={true}
            />
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Date Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Hour Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Hour
          </label>
          <div className="flex gap-2">
            {[1, 2, 3].map(hour => (
              <button
                key={hour}
                onClick={() => handleHourChange(hour)}
                disabled={hourSwitchLoading}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  selectedHour === hour
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } ${hourSwitchLoading ? 'opacity-50' : ''}`}
              >
                HR-{hour}
              </button>
            ))}
          </div>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Excel File
          </label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-green-800">{success}</div>
        </div>
      )}

      {loading && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-blue-800">Processing file...</div>
        </div>
      )}

      {/* Topic Selector */}
      {planetsData && showTopicSelector && (
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
            {Object.keys(planetsData).map(topic => (
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

      {planetsData && !showTopicSelector && (
        <div className="mb-4">
          <button
            onClick={() => setShowTopicSelector(true)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Show Topic Selector ↓
          </button>
        </div>
      )}

      {/* Data Display */}
      {planetsData ? (
        <div className="space-y-6">
          {Array.from(selectedTopics).map(topicName => 
            renderTopicSection(topicName, planetsData[topicName])
          )}
          
          {selectedTopics.size === 0 && (
            <div className="text-center py-8 text-gray-500">
              No topics selected. Use the topic selector above to choose topics to display.
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mb-4 text-gray-400 text-6xl">📊</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Data Loaded</h3>
          <p className="text-gray-500">
            Upload an Excel file to begin planets analysis
          </p>
        </div>
      )}

      {/* Database Status */}
      {selectedDate && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Database Analysis Status</h4>
          <div className={`text-sm ${
            dataSource === 'database' ? 'text-green-600' :
            dataSource === 'none' ? 'text-yellow-600' :
            dataSource === 'error' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {dataSource === 'loading' && '⏳ Loading analysis data...'}
            {dataSource === 'database' && '✅ ABCD/BCD analysis data loaded from database'}
            {dataSource === 'none' && '⚠️ No analysis data found for this date'}
            {dataSource === 'error' && '❌ Error loading analysis data'}
          </div>
        </div>
      )}
    </div>
  );
}

export default PlanetsAnalysisPageUnified;
