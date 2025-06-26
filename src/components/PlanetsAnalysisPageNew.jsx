// src/components/PlanetsAnalysisPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { supabase } from '../supabaseClient';

// Import modular components
import { planetsServiceAdapter } from './modules/PlanetsServiceAdapter';
import { 
  buildTargetData, 
  extractAvailableTopics 
} from './modules/PlanetsDataUtils';
import { 
  processRule1LatestData, 
  performAbcdBcdAnalysis 
} from './modules/ABCDAnalysisModule';
import { 
  processExcelFile, 
  uploadExcelData, 
  validateExcelData 
} from './modules/ExcelUploadModule';
import {
  UserSelector,
  DateSelector,
  HRSelector,
  TopicSelector,
  ExcelUploadSection,
  StatusMessages,
  LoadingSpinner,
  DataSummary,
  SetSection,
  Rule1Section
} from './modules/PlanetsUIComponents';

function PlanetsAnalysisPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State management
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(userId || '');
  const [datesList, setDatesList] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [activeHR, setActiveHR] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data states
  const [planetsData, setPlanetsData] = useState(null); // Excel uploaded data
  const [targetData, setTargetData] = useState(null);   // Target data (selected planets)
  const [availableTopics, setAvailableTopics] = useState([]);
  const [abcdBcdAnalysis, setAbcdBcdAnalysis] = useState({}); // Store ABCD/BCD analysis results
  const [analysisLoading, setAnalysisLoading] = useState(false);
  
  // Topic selection state (Rule-1 style)
  const [selectedTopics, setSelectedTopics] = useState(new Set()); // Set of selected topic names
  const [showTopicSelector, setShowTopicSelector] = useState(true); // Show/hide topic selector

  // Rule-1 integration states
  const [rule1LatestData, setRule1LatestData] = useState(null);
  const [rule1Loading, setRule1Loading] = useState(false);
  
  // UI states
  const [selectedElements, setSelectedElements] = useState(new Set());
  
  // Loading states
  const [uploading, setUploading] = useState(false);

  // Function definitions (must be defined before useEffect hooks)
  const fetchUsers = useCallback(async () => {
    try {
      const usersData = await planetsServiceAdapter.fetchUsers();
      setUsers(usersData || []);
      
      if (userId && usersData && usersData.length > 0) {
        setSelectedUser(userId);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    }
  }, [userId]);

  const loadUserDates = useCallback(async () => {
    try {
      if (!selectedUser) return;
      
      const dates = await planetsServiceAdapter.getDates(selectedUser);
      setDatesList(dates);
      if (dates.length > 0) {
        // Auto-select date from URL params or use the first available date
        const urlDate = searchParams.get('date');
        if (urlDate && dates.includes(urlDate)) {
          setSelectedDate(urlDate);
        } else {
          setSelectedDate(dates[0]);
        }
      }
    } catch (err) {
      console.error('Error loading dates:', err);
      setError('Failed to load dates');
    }
  }, [selectedUser, searchParams]);

  // Build target data from Excel and Hour Entry data
  const buildCurrentTargetData = useCallback((excelData, hourData) => {
    const result = buildTargetData(excelData, hourData, activeHR);
    setTargetData(result);
  }, [activeHR]);

  const loadDateData = useCallback(async () => {
    if (!selectedUser || !selectedDate) return;

    setLoading(true);
    try {
      // Load planets data (Excel upload)
      const excelData = await planetsServiceAdapter.getExcelData(selectedUser, selectedDate);
      
      // Load hour entry data to get planet selections
      const hourData = await planetsServiceAdapter.getHourEntry(selectedUser, selectedDate);
      
      // Combine data and store together to prevent useEffect loops
      const combinedData = {
        ...excelData,
        hourData: hourData
      };
      setPlanetsData(combinedData);

      // Extract available topics
      if (excelData) {
        const topics = extractAvailableTopics(excelData);
        setAvailableTopics(topics);
      }

      // Build target data (selected planet data for each element/set)
      if (excelData && hourData && hourData.planetSelections) {
        buildCurrentTargetData(excelData, hourData);
      }

    } catch (err) {
      console.error('Error loading date data:', err);
      setError('Failed to load data for selected date');
    } finally {
      setLoading(false);
    }
  }, [selectedUser, selectedDate, buildCurrentTargetData]);

  // Function to fetch Rule-1 latest target data
  const fetchRule1LatestData = useCallback(async () => {
    if (!selectedUser || !datesList.length || datesList.length < 5) {
      setRule1LatestData(null);
      return;
    }

    setRule1Loading(true);
    try {
      const result = await processRule1LatestData(selectedUser, datesList, activeHR);
      setRule1LatestData(result);
    } catch (error) {
      console.error('Error fetching Rule-1 data:', error);
      setRule1LatestData(null);
    } finally {
      setRule1Loading(false);
    }
  }, [selectedUser, datesList, activeHR]);

  // Excel upload handling
  const handleExcelUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!selectedUser || !selectedDate) {
      setError('Please select a user and date first');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Process the Excel file
      const excelData = await processExcelFile(file);
      
      // Validate the data
      const validation = validateExcelData(excelData);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Upload the data
      await uploadExcelData(selectedUser, selectedDate, excelData);
      
      // Refresh the page data
      await loadDateData();
      
      setSuccess(`Excel file uploaded successfully with ${validation.topics} topics`);
      
    } catch (error) {
      console.error('Error uploading Excel file:', error);
      setError(`Failed to upload Excel file: ${error.message}`);
    } finally {
      setUploading(false);
    }

    // Clear the input
    event.target.value = '';
  };

  // Topic selection handlers
  const handleTopicsChange = (newSelectedTopics) => {
    setSelectedTopics(newSelectedTopics);
  };

  const handleElementClick = (setName, elementName) => {
    const elementKey = `${setName}_${elementName}`;
    const newSelected = new Set(selectedElements);
    
    if (newSelected.has(elementKey)) {
      newSelected.delete(elementKey);
    } else {
      newSelected.add(elementKey);
    }
    
    setSelectedElements(newSelected);
  };

  // Initialize data
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (selectedUser) {
      loadUserDates();
    }
  }, [selectedUser, loadUserDates]);

  useEffect(() => {
    loadDateData();
  }, [loadDateData]);

  useEffect(() => {
    fetchRule1LatestData();
  }, [fetchRule1LatestData]);

  // Clear messages after a delay
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-t-4 border-blue-600">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">🪐 Planets Analysis</h1>
              <p className="text-gray-600 mt-1">Advanced planetary data analysis with ABCD/BCD pattern matching</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/users')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                ← Back to Users
              </button>
              <button
                onClick={() => navigate(`/abcd-number/${selectedUser}`)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                disabled={!selectedUser}
              >
                📊 ABCD Analysis
              </button>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        <StatusMessages error={error} success={success} />

        {/* Main Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Analysis Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <UserSelector 
              users={users}
              selectedUser={selectedUser}
              onUserChange={setSelectedUser}
              loading={loading}
            />

            <DateSelector 
              datesList={datesList}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              loading={loading}
            />

            <HRSelector 
              activeHR={activeHR}
              onHRChange={setActiveHR}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Actions:
              </label>
              <div className="space-y-2">
                <button
                  onClick={loadDateData}
                  disabled={!selectedUser || !selectedDate || loading}
                  className="w-full px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50"
                >
                  🔄 Refresh Data
                </button>
                <button
                  onClick={fetchRule1LatestData}
                  disabled={!selectedUser || datesList.length < 5 || rule1Loading}
                  className="w-full px-3 py-2 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 disabled:opacity-50"
                >
                  🎯 Load Rule-1
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Excel Upload */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <ExcelUploadSection 
            onFileUpload={handleExcelUpload}
            uploading={uploading}
          />
        </div>

        {/* Data Summary */}
        <DataSummary 
          targetData={targetData}
          planetsData={planetsData}
        />

        {/* Rule-1 Integration */}
        <Rule1Section 
          rule1Data={rule1LatestData}
          loading={rule1Loading}
        />

        {/* Topic Selection */}
        {availableTopics.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <TopicSelector 
              availableTopics={availableTopics}
              selectedTopics={selectedTopics}
              onTopicsChange={handleTopicsChange}
              showTopicSelector={showTopicSelector}
              onToggleSelector={() => setShowTopicSelector(!showTopicSelector)}
            />
          </div>
        )}

        {/* Main Data Display */}
        {loading ? (
          <LoadingSpinner message="Loading planets data..." />
        ) : targetData ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Planet Data Analysis - {targetData.selectedPlanet}
              </h2>
              <div className="text-sm text-gray-600">
                Sets: {Object.keys(targetData.sets).length} | 
                Selected Elements: {selectedElements.size}
              </div>
            </div>

            {/* Filter by selected topics if any are selected */}
            {Object.entries(targetData.sets)
              .filter(([setName]) => selectedTopics.size === 0 || selectedTopics.has(setName))
              .map(([setName, elements]) => (
                <SetSection
                  key={setName}
                  setName={setName}
                  elements={elements}
                  onElementClick={handleElementClick}
                  selectedElements={selectedElements}
                />
              ))
            }

            {selectedTopics.size > 0 && 
             Object.keys(targetData.sets).filter(setName => selectedTopics.has(setName)).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No data available for selected topics.</p>
                <p className="text-sm mt-2">Try selecting different topics or upload new data.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Planets Data Available</h3>
            <p className="text-gray-600 mb-6">
              {selectedUser && selectedDate 
                ? "Upload an Excel file with planets data to begin analysis"
                : "Please select a user and date first"
              }
            </p>
            {!selectedUser && (
              <p className="text-sm text-gray-500">
                👆 Start by selecting a user from the dropdown above
              </p>
            )}
          </div>
        )}

        {/* Rule-1 Latest Data Display */}
        {rule1LatestData && rule1LatestData.targetElements && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6 border-t-4 border-green-500">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              🎯 Rule-1 Latest Analysis - {rule1LatestData.selectedPlanet}
            </h2>
            
            <div className="mb-4 p-4 bg-green-50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Target Date:</span>
                  <div className="text-lg font-bold text-green-600">{rule1LatestData.targetDate}</div>
                </div>
                <div>
                  <span className="font-medium">Data Source:</span>
                  <div className="text-sm text-gray-600">{rule1LatestData.dataDate}</div>
                </div>
                <div>
                  <span className="font-medium">Analysis Sequence:</span>
                  <div className="text-xs text-gray-600">
                    {rule1LatestData.abcdSequence?.join(' → ') || 'N/A'}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Total Elements:</span>
                  <div className="text-lg font-bold text-blue-600">
                    {Object.values(rule1LatestData.targetElements).reduce((total, setElements) => 
                      total + Object.keys(setElements).length, 0)}
                  </div>
                </div>
              </div>
            </div>

            {Object.entries(rule1LatestData.targetElements)
              .filter(([setName]) => selectedTopics.size === 0 || selectedTopics.has(setName))
              .map(([setName, elements]) => (
                <SetSection
                  key={`rule1_${setName}`}
                  setName={`${setName} (Rule-1)`}
                  elements={elements}
                  onElementClick={handleElementClick}
                  selectedElements={selectedElements}
                />
              ))
            }
          </div>
        )}

        {/* Debug Information (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg text-xs">
            <h4 className="font-semibold mb-2">Debug Info:</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>State:</strong>
                <ul className="mt-1 space-y-1">
                  <li>Users: {users.length}</li>
                  <li>Selected User: {selectedUser || 'None'}</li>
                  <li>Dates: {datesList.length}</li>
                  <li>Selected Date: {selectedDate || 'None'}</li>
                  <li>Active HR: {activeHR}</li>
                  <li>Topics: {availableTopics.length}</li>
                  <li>Selected Topics: {selectedTopics.size}</li>
                </ul>
              </div>
              <div>
                <strong>Data:</strong>
                <ul className="mt-1 space-y-1">
                  <li>Planets Data: {planetsData ? 'Loaded' : 'None'}</li>
                  <li>Target Data: {targetData ? 'Built' : 'None'}</li>
                  <li>Rule-1 Data: {rule1LatestData ? 'Loaded' : 'None'}</li>
                  <li>Loading: {loading ? 'Yes' : 'No'}</li>
                  <li>Rule-1 Loading: {rule1Loading ? 'Yes' : 'No'}</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PlanetsAnalysisPage;
