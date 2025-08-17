import React, { useState, useEffect } from 'react';
import { unifiedDataService } from '../services/unifiedDataService';
import PureNumberBoxService from '../services/PureNumberBoxService';
import SimpleNumberBox from './SimpleNumberBox';
import SimpleCountDisplay from './SimpleCountDisplay';

function Rule1PagePure({ date, analysisDate, selectedUser, datesList, onBack, users }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUserData, setSelectedUserData] = useState(null);
  const [activeHR, setActiveHR] = useState(null);
  const [allDaysData, setAllDaysData] = useState({});
  const [abcdBcdAnalysis, setAbcdBcdAnalysis] = useState({});
  const [selectedTopics, setSelectedTopics] = useState(new Set());
  const [availableTopics, setAvailableTopics] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  console.log('🔥 Rule1PagePure - Pure Supabase Implementation');

  useEffect(() => {
    if (selectedUser) {
      loadInitialData();
    }
  }, [selectedUser, date, analysisDate]);

  const loadInitialData = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('📊 Loading data for user:', selectedUser);
      
      // Load user data
      const userData = await unifiedDataService.getUserDataForDateRange(selectedUser, [date]);
      setSelectedUserData(userData);
      
      // Load all days data
      const allData = await unifiedDataService.getDataForDatesRange(selectedUser, datesList);
      setAllDaysData(allData);
      
      // Load ABCD/BCD analysis
      const analysis = await unifiedDataService.getAbcdBcdAnalysis(selectedUser, analysisDate);
      setAbcdBcdAnalysis(analysis);
      
      // Set available topics
      const topics = Object.keys(analysis);
      setAvailableTopics(topics);
      setSelectedTopics(new Set(topics));
      
      console.log('✅ Data loaded successfully:', {
        userData: Object.keys(userData).length,
        analysis: Object.keys(analysis).length,
        topics: topics.length
      });
      
    } catch (err) {
      console.error('❌ Error loading data:', err);
      setError(`Failed to load data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleNumberBoxClick = (number, isClicked) => {
    // Trigger refresh of count display
    setRefreshTrigger(prev => prev + 1);
  };

  const shouldHighlightCell = (topicName, hourData, cellValue) => {
    if (!abcdBcdAnalysis[topicName] || !hourData) return false;
    
    const analysis = abcdBcdAnalysis[topicName];
    const { abcdNumbers = [], bcdNumbers = [] } = analysis;
    
    return abcdNumbers.includes(cellValue) || bcdNumbers.includes(cellValue);
  };

  const renderNumberBoxes = (topicName, dateKey, hour) => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    return (
      <div className="flex gap-1 flex-wrap">
        {numbers.map(number => (
          <SimpleNumberBox
            key={number}
            number={number}
            userId={selectedUser}
            topic={topicName}
            dateKey={dateKey}
            hour={hour}
            onClickChange={handleNumberBoxClick}
          />
        ))}
      </div>
    );
  };

  const renderMatrix = () => {
    if (!selectedUserData || !allDaysData) return null;

    const hours = ['HR-1', 'HR-2', 'HR-3', 'HR-4', 'HR-5', 'HR-6', 'HR-7', 'HR-8'];
    const selectedTopicsArray = Array.from(selectedTopics);

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2 bg-gray-100">Topic</th>
              {datesList.map(dateStr => (
                <th key={dateStr} className="border border-gray-300 p-2 bg-gray-100">
                  {dateStr}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {selectedTopicsArray.map(topicName => (
              <tr key={topicName}>
                <td className="border border-gray-300 p-2 font-medium bg-gray-50">
                  {topicName}
                </td>
                {datesList.map(dateStr => {
                  const dayData = allDaysData[dateStr]?.[topicName];
                  
                  return (
                    <td key={dateStr} className="border border-gray-300 p-2">
                      <div className="space-y-2">
                        {hours.map(hour => {
                          const hourData = dayData?.[hour];
                          const cellValue = hourData?.value;
                          const isHighlighted = shouldHighlightCell(topicName, hourData, cellValue);
                          
                          return (
                            <div key={hour} className="text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{hour}:</span>
                                <span 
                                  className={`px-1 rounded ${
                                    isHighlighted 
                                      ? 'bg-yellow-200 font-bold text-yellow-800' 
                                      : 'text-gray-600'
                                  }`}
                                >
                                  {cellValue || '-'}
                                </span>
                              </div>
                              <div className="mt-1">
                                {renderNumberBoxes(topicName, dateStr, hour)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-blue-600">Loading Rule1 data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <h3 className="font-bold">Error</h3>
        <p>{error}</p>
        <button 
          onClick={loadInitialData}
          className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Rule1 Analysis</h1>
          <p className="text-gray-600">
            User: {selectedUser} | Date: {date} | Analysis: {analysisDate}
          </p>
        </div>
        <button
          onClick={onBack}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          ← Back
        </button>
      </div>

      {/* Count Display */}
      <div className="flex justify-center">
        <SimpleCountDisplay
          userId={selectedUser}
          dateKey={date}
          hour="HR-1"
          abcdBcdData={abcdBcdAnalysis}
          refreshTrigger={refreshTrigger}
        />
      </div>

      {/* Matrix */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Data Matrix</h2>
        {renderMatrix()}
      </div>
    </div>
  );
}

export default Rule1PagePure;
