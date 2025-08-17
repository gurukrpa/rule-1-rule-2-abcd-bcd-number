import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { abcdBcdDatabaseService } from '../services/abcdBcdDatabaseService';
import PureNumberBoxService from '../services/PureNumberBoxService';
import SimpleNumberBox from './SimpleNumberBox';
import SimpleCountDisplay from './SimpleCountDisplay';

function PlanetsAnalysisPagePure() {
  const navigate = useNavigate();
  const { userId } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedHour, setSelectedHour] = useState(1);
  const [abcdBcdAnalysis, setAbcdBcdAnalysis] = useState({});
  const [availableTopics, setAvailableTopics] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  console.log('🌍 PlanetsAnalysisPagePure - Pure Supabase Implementation');

  useEffect(() => {
    if (userId) {
      // Set default date to today
      const today = new Date().toISOString().split('T')[0];
      setSelectedDate(today);
      loadAnalysisData(today);
    }
  }, [userId]);

  const loadAnalysisData = async (date) => {
    setLoading(true);
    setError('');
    
    try {
      console.log('📊 Loading ABCD/BCD analysis for:', { userId, date });
      
      const analysis = await abcdBcdDatabaseService.getAbcdBcdAnalysis(userId, date);
      setAbcdBcdAnalysis(analysis);
      
      const topics = Object.keys(analysis);
      setAvailableTopics(topics);
      
      console.log('✅ Analysis loaded:', {
        topics: topics.length,
        analysis: Object.keys(analysis).length
      });
      
    } catch (err) {
      console.error('❌ Error loading analysis:', err);
      setError(`Failed to load analysis: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    loadAnalysisData(newDate);
  };

  const handleNumberBoxClick = (number, isClicked) => {
    // Trigger refresh of count display
    setRefreshTrigger(prev => prev + 1);
  };

  const renderNumberBoxes = (topicName) => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const hour = `HR-${selectedHour}`;
    
    return (
      <div className="flex gap-1 flex-wrap">
        {numbers.map(number => (
          <SimpleNumberBox
            key={number}
            number={number}
            userId={userId}
            topic={topicName}
            dateKey={selectedDate}
            hour={hour}
            onClickChange={handleNumberBoxClick}
          />
        ))}
      </div>
    );
  };

  const renderTopicAnalysis = (topicName, analysis) => {
    const { abcdNumbers = [], bcdNumbers = [], trend = '', prediction = '' } = analysis;
    
    return (
      <div key={topicName} className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">{topicName}</h3>
        
        <div className="space-y-3">
          {/* ABCD Numbers */}
          <div>
            <div className="text-sm font-medium text-blue-600 mb-1">ABCD Numbers:</div>
            <div className="flex gap-1 flex-wrap">
              {abcdNumbers.map(num => (
                <span key={num} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  {num}
                </span>
              ))}
            </div>
          </div>
          
          {/* BCD Numbers */}
          <div>
            <div className="text-sm font-medium text-green-600 mb-1">BCD Numbers:</div>
            <div className="flex gap-1 flex-wrap">
              {bcdNumbers.map(num => (
                <span key={num} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                  {num}
                </span>
              ))}
            </div>
          </div>
          
          {/* Number Boxes */}
          <div>
            <div className="text-sm font-medium text-red-600 mb-1">Click Numbers:</div>
            {renderNumberBoxes(topicName)}
          </div>
          
          {/* Trend and Prediction */}
          {trend && (
            <div className="text-xs text-gray-600">
              <div><strong>Trend:</strong> {trend}</div>
            </div>
          )}
          {prediction && (
            <div className="text-xs text-gray-600">
              <div><strong>Prediction:</strong> {prediction}</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderHourTabs = () => {
    const hours = [1, 2, 3, 4, 5, 6, 7, 8];
    
    return (
      <div className="flex gap-1 mb-4">
        {hours.map(hour => (
          <button
            key={hour}
            onClick={() => setSelectedHour(hour)}
            className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              selectedHour === hour
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            HR-{hour}
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-blue-600">Loading planets analysis...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Planets Analysis</h1>
          <p className="text-gray-600">User: {userId}</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          ← Back to Home
        </button>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Analysis Date:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Count Display */}
          <div className="flex items-end">
            <SimpleCountDisplay
              userId={userId}
              dateKey={selectedDate}
              hour={`HR-${selectedHour}`}
              abcdBcdData={abcdBcdAnalysis}
              refreshTrigger={refreshTrigger}
            />
          </div>
        </div>
      </div>

      {/* Hour Tabs */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Select Hour</h2>
        {renderHourTabs()}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
          <button 
            onClick={() => loadAnalysisData(selectedDate)}
            className="ml-2 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      )}

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableTopics.map(topicName => 
          renderTopicAnalysis(topicName, abcdBcdAnalysis[topicName])
        )}
      </div>

      {availableTopics.length === 0 && !loading && !error && (
        <div className="text-center py-8 text-gray-500">
          No analysis data found for the selected date.
        </div>
      )}
    </div>
  );
}

export default PlanetsAnalysisPagePure;
