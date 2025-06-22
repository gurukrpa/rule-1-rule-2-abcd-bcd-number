import React, { useState, useEffect } from 'react';
import CleanSupabaseService from '../services/CleanSupabaseService';

/**
 * 🎯 CLEAN RULE 2 PAGE - Supabase Only
 * 
 * Features:
 * ✅ No localStorage
 * ✅ No fallback systems
 * ✅ Direct Supabase ABCD analysis
 * ✅ Clean data flow
 * ✅ Proper topic ordering (ascending)
 */

const CleanRule2Page = () => {
  // Topic order in ascending sequence (D-1, D-3, D-4, etc.)
  const TOPIC_ORDER = [
    'D-1 Set-1', 'D-1 Set-2',
    'D-3 Set-1', 'D-3 Set-2', 
    'D-4 Set-1', 'D-4 Set-2',
    'D-5 Set-1', 'D-5 Set-2',
    'D-7 Set-1', 'D-7 Set-2',
    'D-9 Set-1', 'D-9 Set-2',
    'D-10 Set-1', 'D-10 Set-2',
    'D-11 Set-1', 'D-11 Set-2',
    'D-12 Set-1', 'D-12 Set-2',
    'D-27 Set-1', 'D-27 Set-2',
    'D-30 Set-1', 'D-30 Set-2',
    'D-60 Set-1', 'D-60 Set-2',
    'D-81 Set-1', 'D-81 Set-2',
    'D-108 Set-1', 'D-108 Set-2',
    'D-144 Set-1', 'D-144 Set-2'
  ];

  // State
  const [currentUser] = useState({ id: 'demo-user' }); // Demo user for now
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [excelData, setExcelData] = useState(null);
  const [hourEntry, setHourEntry] = useState(null);
  const [analysisResults, setAnalysisResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize service
  const [dataService] = useState(new CleanSupabaseService());

  // Load data when date changes
  useEffect(() => {
    if (currentUser && selectedDate) {
      loadDataAndAnalyze();
    }
  }, [selectedDate]);

  /**
   * Load data and perform analysis
   */
  const loadDataAndAnalyze = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load Excel data and hour entries
      const [excel, hours] = await Promise.all([
        dataService.getExcelData(currentUser.id, selectedDate),
        dataService.getHourEntry(currentUser.id, selectedDate)
      ]);

      setExcelData(excel);
      setHourEntry(hours);

      // Perform ABCD analysis if we have both data types
      if (excel?.sets && hours?.planet_selections) {
        await performCleanAnalysis(excel.sets, hours.planet_selections);
      }

      console.log('📊 Clean Rule2 data loaded:', { excel, hours });
    } catch (error) {
      console.error('❌ Rule2 data loading failed:', error);
      setError('Failed to load data for analysis');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Perform clean ABCD analysis using Supabase service
   */
  const performCleanAnalysis = async (sets, planetSelections) => {
    try {
      const results = {};

      // Analyze each topic in proper order
      for (const topic of TOPIC_ORDER) {
        if (sets[topic]) {
          console.log(`🔍 Analyzing ${topic}...`);
          
          // Use CleanSupabaseService for analysis
          const analysis = await dataService.performABCDAnalysis(
            currentUser.id,
            selectedDate,
            topic,
            sets[topic].data,
            planetSelections
          );

          results[topic] = analysis;
        }
      }

      setAnalysisResults(results);
      console.log('✅ Clean ABCD analysis completed:', results);
    } catch (error) {
      console.error('❌ ABCD analysis failed:', error);
      setError('Failed to perform ABCD analysis');
    }
  };

  /**
   * Get available topics in ascending order
   */
  const getAvailableTopics = () => {
    if (!excelData?.sets) return [];
    
    return TOPIC_ORDER.filter(topic => excelData.sets[topic]);
  };

  /**
   * Format analysis results for display
   */
  const formatAnalysisResult = (result) => {
    if (!result) return 'No analysis';
    
    const { A, B, C, D, total } = result;
    return `A:${A} B:${B} C:${C} D:${D} (Total:${total})`;
  };

  /**
   * Get status color based on analysis results
   */
  const getStatusColor = (result) => {
    if (!result) return '#gray';
    
    const { A, B, C, D } = result;
    if (A >= 10) return '#10b981'; // Green for good A count
    if (B >= 8) return '#f59e0b';  // Orange for good B count
    if (C >= 6) return '#ef4444';  // Red for mostly C
    return '#6b7280'; // Gray for mostly D
  };

  return (
    <div className="clean-rule2-page">
      {/* Header */}
      <div className="header-section">
        <h1>🎯 Clean Rule 2 ABCD Analysis</h1>
        <div className="status-badges">
          <span className="badge success">Supabase Only</span>
          <span className="badge info">Ascending Order</span>
          <span className="badge primary">Direct Analysis</span>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-section">
        <div className="date-control">
          <label>📅 Analysis Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-input"
          />
        </div>
        
        <button 
          onClick={loadDataAndAnalyze}
          disabled={loading}
          className="refresh-btn"
        >
          {loading ? '🔄 Analyzing...' : '🔄 Refresh Analysis'}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-section">
          <div className="spinner"></div>
          <p>Performing clean ABCD analysis...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-section">
          <p>❌ {error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {/* Data Status */}
      <div className="status-section">
        <div className="status-item">
          <h4>📊 Excel Data</h4>
          <p>{excelData ? `✅ Loaded (${Object.keys(excelData.sets || {}).length} topics)` : '❌ Not available'}</p>
        </div>
        
        <div className="status-item">
          <h4>⏰ Hour Entries</h4>
          <p>{hourEntry ? `✅ Loaded (${Object.keys(hourEntry.planet_selections || {}).length} hours)` : '❌ Not available'}</p>
        </div>
        
        <div className="status-item">
          <h4>🧮 Analysis Results</h4>
          <p>{Object.keys(analysisResults).length > 0 ? `✅ ${Object.keys(analysisResults).length} topics analyzed` : '⏳ Pending'}</p>
        </div>
      </div>

      {/* Analysis Results */}
      {Object.keys(analysisResults).length > 0 && (
        <div className="results-section">
          <h3>📈 ABCD Analysis Results (Ascending Order)</h3>
          
          <div className="results-grid">
            {getAvailableTopics().map((topic, index) => {
              const result = analysisResults[topic];
              const statusColor = getStatusColor(result);
              
              return (
                <div 
                  key={topic} 
                  className="result-card"
                  style={{ borderLeft: `4px solid ${statusColor}` }}
                >
                  <div className="result-header">
                    <span className="topic-number">{index + 1}</span>
                    <h4>{topic}</h4>
                  </div>
                  
                  <div className="result-content">
                    <p className="analysis-text">
                      {formatAnalysisResult(result)}
                    </p>
                    
                    {result && (
                      <div className="abcd-breakdown">
                        <span className="abcd-item a">A: {result.A}</span>
                        <span className="abcd-item b">B: {result.B}</span>
                        <span className="abcd-item c">C: {result.C}</span>
                        <span className="abcd-item d">D: {result.D}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      {Object.keys(analysisResults).length > 0 && (
        <div className="summary-section">
          <h3>📊 Analysis Summary</h3>
          
          <div className="summary-stats">
            <div className="stat-item">
              <h4>Total Topics Analyzed</h4>
              <p>{Object.keys(analysisResults).length}</p>
            </div>
            
            <div className="stat-item">
              <h4>Average A Count</h4>
              <p>
                {(Object.values(analysisResults).reduce((sum, r) => sum + r.A, 0) / Object.keys(analysisResults).length).toFixed(1)}
              </p>
            </div>
            
            <div className="stat-item">
              <h4>Best Topic (Most A's)</h4>
              <p>
                {Object.entries(analysisResults)
                  .sort(([,a], [,b]) => b.A - a.A)[0]?.[0] || 'N/A'}
              </p>
            </div>
            
            <div className="stat-item">
              <h4>Analysis Date</h4>
              <p>{selectedDate}</p>
            </div>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!loading && (!excelData || !hourEntry) && (
        <div className="no-data-section">
          <h3>📝 Missing Data</h3>
          <p>To perform ABCD analysis, you need:</p>
          <ul>
            <li>{excelData ? '✅' : '❌'} Excel data with 30 topics</li>
            <li>{hourEntry ? '✅' : '❌'} Hour entries with planet selections</li>
          </ul>
          <p>Please upload the required data first.</p>
        </div>
      )}

      {/* Footer */}
      <div className="footer-section">
        <p>🎯 Clean Rule 2 Analysis: Pure Supabase implementation</p>
        <p>Topics ordered: D-1 → D-3 → D-4 → D-5 → D-7 → D-9 → ... → D-144</p>
      </div>

      <style jsx>{`
        .clean-rule2-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .header-section {
          text-align: center;
          margin-bottom: 30px;
        }

        .status-badges {
          margin-top: 10px;
        }

        .badge {
          display: inline-block;
          padding: 4px 12px;
          margin: 0 5px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .badge.success { background: #10b981; color: white; }
        .badge.info { background: #06b6d4; color: white; }
        .badge.primary { background: #3b82f6; color: white; }

        .controls-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .date-control label {
          margin-right: 10px;
          font-weight: 600;
        }

        .date-input {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
        }

        .refresh-btn {
          padding: 10px 20px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
        }

        .refresh-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .loading-section, .error-section, .status-section, 
        .results-section, .summary-section, .no-data-section {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .error-section {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
        }

        .status-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .status-item h4 {
          margin: 0 0 8px 0;
          color: #1e293b;
        }

        .status-item p {
          margin: 0;
          color: #64748b;
        }

        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .result-card {
          background: #f8fafc;
          border-radius: 8px;
          padding: 16px;
          border: 1px solid #e2e8f0;
        }

        .result-header {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
        }

        .topic-number {
          background: #3b82f6;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          margin-right: 10px;
        }

        .result-header h4 {
          margin: 0;
          color: #1e293b;
          font-size: 14px;
        }

        .analysis-text {
          font-family: 'Monaco', 'Menlo', monospace;
          background: #1e293b;
          color: #f1f5f9;
          padding: 8px;
          border-radius: 4px;
          font-size: 12px;
          margin: 0 0 10px 0;
        }

        .abcd-breakdown {
          display: flex;
          gap: 8px;
        }

        .abcd-item {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
        }

        .abcd-item.a { background: #dcfce7; color: #166534; }
        .abcd-item.b { background: #fef3c7; color: #92400e; }
        .abcd-item.c { background: #fed7d7; color: #c53030; }
        .abcd-item.d { background: #e5e7eb; color: #374151; }

        .summary-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 20px;
        }

        .stat-item {
          text-align: center;
          padding: 16px;
          background: #f8fafc;
          border-radius: 8px;
        }

        .stat-item h4 {
          margin: 0 0 8px 0;
          color: #1e293b;
          font-size: 14px;
        }

        .stat-item p {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #3b82f6;
        }

        .footer-section {
          text-align: center;
          padding: 20px;
          color: #64748b;
          font-size: 14px;
        }

        .spinner {
          border: 3px solid #f3f4f6;
          border-radius: 50%;
          border-top: 3px solid #3b82f6;
          width: 30px;
          height: 30px;
          animation: spin 1s linear infinite;
          margin: 0 auto 10px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CleanRule2Page;
