// filepath: /Volumes/t7 sharma/vs coad/rule-1-rule-2-abcd-bcd-number-main/src/components/PlanetsAnalysisPage.jsx
// COMPLETELY REWRITTEN - Simple, focused PlanetsAnalysisPage for Topic-Specific ABCD/BCD Numbers

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Rule2AnalysisResultsService } from '../services/rule2AnalysisResultsService';

function PlanetsAnalysisPage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const location = useLocation();

  // Core state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  
  // ABCD/BCD Analysis Data
  const [analysisData, setAnalysisData] = useState(null);
  const [selectedHR, setSelectedHR] = useState(1);
  const [availableHRs, setAvailableHRs] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

  // All topic names (30 topics)
  const ALL_TOPICS = [
    'D-1 Set-1 Matrix', 'D-1 Set-2 Matrix', 'D-3 Set-1 Matrix', 'D-3 Set-2 Matrix',
    'D-4 Set-1 Matrix', 'D-4 Set-2 Matrix', 'D-5 Set-1 Matrix', 'D-5 Set-2 Matrix',
    'D-7 Set-1 Matrix', 'D-7 Set-2 Matrix', 'D-9 Set-1 Matrix', 'D-9 Set-2 Matrix',
    'D-10 Set-1 Matrix', 'D-10 Set-2 Matrix', 'D-11 Set-1 Matrix', 'D-11 Set-2 Matrix',
    'D-12 Set-1 Matrix', 'D-12 Set-2 Matrix', 'D-27 Set-1 Matrix', 'D-27 Set-2 Matrix',
    'D-30 Set-1 Matrix', 'D-30 Set-2 Matrix', 'D-60 Set-1 Matrix', 'D-60 Set-2 Matrix',
    'D-81 Set-1 Matrix', 'D-81 Set-2 Matrix', 'D-108 Set-1 Matrix', 'D-108 Set-2 Matrix',
    'D-144 Set-1 Matrix', 'D-144 Set-2 Matrix'
  ];

  // Load user info and analysis data on component mount
  useEffect(() => {
    loadUserAndAnalysisData();
  }, [userId]);

  // Load analysis data when HR changes
  useEffect(() => {
    if (userInfo) {
      loadAnalysisDataForHR(selectedHR);
    }
  }, [selectedHR, userInfo]);

  const loadUserAndAnalysisData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🚀 [PlanetsAnalysis] Loading user and analysis data...');
      
      // Load user info
      let userData = null;
      if (userId) {
        const { data, error: userError } = await supabase
          .from('users')
          .select('id, username, hr, days')
          .eq('id', userId)
          .single();
        
        if (!userError && data) {
          userData = data;
        }
      }

      // Fallback user info
      if (!userData) {
        userData = {
          id: userId || 'guest',
          username: userId || 'Guest User',
          hr: 'N/A'
        };
      }

      setUserInfo(userData);
      console.log('✅ [PlanetsAnalysis] User info loaded:', userData);

      // Load initial analysis data
      await loadAnalysisDataForHR(selectedHR);

    } catch (err) {
      console.error('❌ [PlanetsAnalysis] Error loading data:', err);
      setError('Failed to load user data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalysisDataForHR = async (hrPeriod) => {
    console.log(`🔍 [PlanetsAnalysis] Loading analysis data for HR ${hrPeriod}...`);
    
    try {
      // Get the latest enhanced analysis results
      const result = await Rule2AnalysisResultsService.getLatestAnalysisResults(userId || 'guest');
      
      if (result.success && result.data) {
        console.log('✅ [PlanetsAnalysis] Enhanced analysis data found:', result.data);
        
        const data = result.data;
        const topicNumbers = data.topicNumbers || {};
        
        // Set available HRs based on data
        if (data.availableHRs && data.availableHRs.length > 0) {
          setAvailableHRs(data.availableHRs);
        }
        
        // Build topic-specific analysis data
        const topicAnalysisData = {};
        ALL_TOPICS.forEach(topicName => {
          if (topicNumbers[topicName]) {
            topicAnalysisData[topicName] = {
              abcd: topicNumbers[topicName].abcd || [],
              bcd: topicNumbers[topicName].bcd || []
            };
          } else {
            // No data for this topic
            topicAnalysisData[topicName] = {
              abcd: [],
              bcd: []
            };
          }
        });

        setAnalysisData({
          source: 'Enhanced Database',
          analysisDate: data.analysisDate,
          selectedHR: data.selectedHR || hrPeriod,
          totalTopics: Object.keys(topicNumbers).length,
          overallNumbers: data.overallNumbers || { abcd: [], bcd: [] },
          topicNumbers: topicAnalysisData,
          hasTopicSpecificData: Object.keys(topicNumbers).length > 0
        });

        console.log(`✅ [PlanetsAnalysis] Topic-specific data loaded: ${Object.keys(topicNumbers).length} topics`);
        
      } else {
        console.log('⚠️ [PlanetsAnalysis] No enhanced analysis data found, checking fallback...');
        await loadFallbackData(hrPeriod);
      }

    } catch (err) {
      console.error('❌ [PlanetsAnalysis] Error loading analysis data:', err);
      await loadFallbackData(hrPeriod);
    }
  };

  const loadFallbackData = async (hrPeriod) => {
    console.log('📋 [PlanetsAnalysis] Loading fallback data from rule2_results...');
    
    try {
      const { data, error } = await supabase
        .from('rule2_results')
        .select('*')
        .eq('user_id', userId || 'guest')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (!error && data && data.length > 0) {
        const result = data[0];
        console.log('📋 [PlanetsAnalysis] Fallback data found:', result);
        
        // Build fallback analysis data (same numbers for all topics)
        const fallbackTopicNumbers = {};
        ALL_TOPICS.forEach(topicName => {
          fallbackTopicNumbers[topicName] = {
            abcd: result.abcd_numbers || [],
            bcd: result.bcd_numbers || []
          };
        });

        setAnalysisData({
          source: 'Fallback Database',
          analysisDate: result.date,
          selectedHR: hrPeriod,
          totalTopics: 30,
          overallNumbers: {
            abcd: result.abcd_numbers || [],
            bcd: result.bcd_numbers || []
          },
          topicNumbers: fallbackTopicNumbers,
          hasTopicSpecificData: false
        });

        console.log('⚠️ [PlanetsAnalysis] Using fallback - all topics get same numbers');
        
      } else {
        console.log('❌ [PlanetsAnalysis] No fallback data found');
        setAnalysisData(null);
        setError('No ABCD/BCD analysis data found. Please run Rule-2 analysis first.');
      }

    } catch (err) {
      console.error('❌ [PlanetsAnalysis] Error loading fallback data:', err);
      setError('Failed to load analysis data: ' + err.message);
    }
  };

  const renderTopicNumbers = (topicName, numbers) => {
    const { abcd = [], bcd = [] } = numbers;
    
    return (
      <div key={topicName} className="topic-card">
        <div className="topic-header">
          <h4>{topicName}</h4>
        </div>
        <div className="numbers-display">
          <div className="abcd-numbers">
            <span className="label">ABCD:</span>
            <span className="numbers">
              {abcd.length > 0 ? `[${abcd.join(', ')}]` : '[None]'}
            </span>
          </div>
          <div className="bcd-numbers">
            <span className="label">BCD:</span>
            <span className="numbers">
              {bcd.length > 0 ? `[${bcd.join(', ')}]` : '[None]'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="planets-analysis-container">
        <div className="loading-state">
          <h2>🔄 Loading Analysis Data...</h2>
          <p>Please wait while we load your ABCD/BCD numbers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="planets-analysis-container">
        <div className="error-state">
          <h2>❌ Error Loading Data</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="back-button">
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="planets-analysis-container">
      {/* Header */}
      <div className="analysis-header">
        <div className="header-content">
          <h1>🪐 Planets Analysis - ABCD/BCD Numbers Display</h1>
          <div className="user-info">
            <span className="user-badge">👤 User: {userInfo?.username || 'Unknown'}</span>
          </div>
        </div>
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>
      </div>

      {/* Analysis Status */}
      {analysisData && (
        <div className="analysis-status">
          <div className="status-grid">
            <div className="status-item">
              <span className="label">📅 Target Date:</span>
              <span className="value">{analysisData.analysisDate || '2025-07-07'}</span>
            </div>
            <div className="status-item">
              <span className="label">📊 Data Source:</span>
              <span className="value">{analysisData.source}</span>
            </div>
            <div className="status-item">
              <span className="label">🎯 Total Topics:</span>
              <span className="value">{analysisData.totalTopics}</span>
            </div>
            <div className="status-item">
              <span className="label">✅ Topic-Specific:</span>
              <span className="value">
                {analysisData.hasTopicSpecificData ? 'Yes ✅' : 'No ⚠️ (Using fallback)'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Hour Tabs */}
      <div className="hour-tabs-container">
        <h3>⏰ HR Period Selection</h3>
        <div className="hour-tabs">
          {availableHRs.map(hr => (
            <button
              key={hr}
              className={`hour-tab ${selectedHR === hr ? 'active' : ''}`}
              onClick={() => setSelectedHR(hr)}
            >
              HR {hr}
            </button>
          ))}
        </div>
        <div className="selected-hr-info">
          <span>Selected: <strong>HR {selectedHR}</strong></span>
        </div>
      </div>

      {/* Topic-Specific ABCD/BCD Numbers */}
      {analysisData && analysisData.topicNumbers && (
        <div className="topics-container">
          <div className="topics-header">
            <h3>🎯 Topic-Specific ABCD/BCD Numbers</h3>
            {!analysisData.hasTopicSpecificData && (
              <div className="fallback-warning">
                ⚠️ Using fallback data - all topics show same numbers. Run Rule-2 analysis for topic-specific numbers.
              </div>
            )}
          </div>
          
          <div className="topics-grid">
            {ALL_TOPICS.map(topicName => {
              const numbers = analysisData.topicNumbers[topicName] || { abcd: [], bcd: [] };
              return renderTopicNumbers(topicName, numbers);
            })}
          </div>
        </div>
      )}

      {/* No Data State */}
      {!analysisData && (
        <div className="no-data-state">
          <h3>📋 No Analysis Data Available</h3>
          <p>No ABCD/BCD analysis data found for this user.</p>
          <p>Please run Rule-2 analysis first to generate topic-specific numbers.</p>
          <button onClick={() => navigate('/rule2-compact')} className="action-button">
            🚀 Run Rule-2 Analysis
          </button>
        </div>
      )}

      {/* Styles */}
      <style jsx>{`
        .planets-analysis-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        .analysis-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 12px;
        }

        .header-content h1 {
          margin: 0 0 10px 0;
          font-size: 1.8rem;
        }

        .user-badge {
          background: rgba(255,255,255,0.2);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.9rem;
        }

        .back-button {
          background: rgba(255,255,255,0.2);
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }

        .back-button:hover {
          background: rgba(255,255,255,0.3);
        }

        .analysis-status {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 30px;
        }

        .status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
        }

        .status-item {
          display: flex;
          justify-content: space-between;
          padding: 10px 15px;
          background: white;
          border-radius: 8px;
          border-left: 4px solid #007bff;
        }

        .status-item .label {
          font-weight: 500;
          color: #666;
        }

        .status-item .value {
          font-weight: 600;
          color: #333;
        }

        .hour-tabs-container {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }

        .hour-tabs-container h3 {
          margin: 0 0 20px 0;
          color: #333;
        }

        .hour-tabs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 15px;
        }

        .hour-tab {
          background: #f8f9fa;
          border: 2px solid #e9ecef;
          color: #666;
          padding: 10px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .hour-tab:hover {
          background: #e9ecef;
          border-color: #007bff;
        }

        .hour-tab.active {
          background: #007bff;
          border-color: #007bff;
          color: white;
        }

        .selected-hr-info {
          padding: 10px 15px;
          background: #e7f3ff;
          border-radius: 8px;
          border-left: 4px solid #007bff;
        }

        .topics-container {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .topics-header {
          margin-bottom: 25px;
        }

        .topics-header h3 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .fallback-warning {
          background: #fff3cd;
          color: #856404;
          padding: 12px 16px;
          border-radius: 8px;
          border-left: 4px solid #ffc107;
          font-size: 0.9rem;
        }

        .topics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .topic-card {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 16px;
          transition: all 0.2s;
        }

        .topic-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }

        .topic-header h4 {
          margin: 0 0 12px 0;
          color: #007bff;
          font-size: 1rem;
          font-weight: 600;
        }

        .numbers-display {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .abcd-numbers, .bcd-numbers {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: white;
          border-radius: 6px;
          border-left: 4px solid #28a745;
        }

        .bcd-numbers {
          border-left-color: #dc3545;
        }

        .numbers-display .label {
          font-weight: 600;
          font-size: 0.9rem;
          color: #333;
        }

        .numbers-display .numbers {
          font-family: 'Monaco', 'Menlo', monospace;
          font-weight: 500;
          color: #666;
          font-size: 0.9rem;
        }

        .loading-state, .error-state, .no-data-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .loading-state h2, .error-state h2, .no-data-state h3 {
          margin: 0 0 15px 0;
          color: #333;
        }

        .action-button {
          background: #28a745;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          margin-top: 20px;
        }

        .action-button:hover {
          background: #218838;
        }

        @media (max-width: 768px) {
          .analysis-header {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }

          .topics-grid {
            grid-template-columns: 1fr;
          }

          .hour-tabs {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}

export default PlanetsAnalysisPage;
