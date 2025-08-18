// Example: Using CrossPageSync Service (RECOMMENDED)
// This approach provides better organization and additional features

import { useState, useEffect, useCallback } from 'react';
import crossPageSyncService from '../services/crossPageSyncService';

function PlanetsAnalysisWithSync({ userId }) {
  const [syncData, setSyncData] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch organized sync data using CrossPageSync service
  const fetchSyncData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get organized data including clicked numbers + analysis results
      const organizedData = await crossPageSyncService.getAllClickedNumbers(userId);
      
      setSyncData(organizedData);
      console.log('✅ [CrossPageSync] Fetched organized data:', organizedData);
      
    } catch (error) {
      console.error('❌ [CrossPageSync] Error fetching sync data:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchSyncData();
    }
  }, [userId, fetchSyncData]);

  // Get clicked numbers with additional analysis data
  const getEnhancedDataForDateTopic = (dateKey, topicName) => {
    return syncData[dateKey]?.[topicName] || {
      clickedNumbers: [],
      abcdNumbers: [],
      bcdNumbers: [],
      hour: 1
    };
  };

  // Get comprehensive analysis data
  const getComprehensiveAnalysis = () => {
    const analysis = {
      totalClickedNumbers: 0,
      totalABCDNumbers: 0,
      totalBCDNumbers: 0,
      byDate: {},
      byTopic: {}
    };

    Object.keys(syncData).forEach(dateKey => {
      analysis.byDate[dateKey] = {};
      
      Object.keys(syncData[dateKey]).forEach(topicName => {
        const data = syncData[dateKey][topicName];
        
        analysis.totalClickedNumbers += data.clickedNumbers.length;
        analysis.totalABCDNumbers += data.abcdNumbers.length;
        analysis.totalBCDNumbers += data.bcdNumbers.length;
        
        // Organize by date
        analysis.byDate[dateKey][topicName] = data;
        
        // Organize by topic
        if (!analysis.byTopic[topicName]) {
          analysis.byTopic[topicName] = {
            clickedNumbers: [],
            abcdNumbers: [],
            bcdNumbers: []
          };
        }
        analysis.byTopic[topicName].clickedNumbers.push(...data.clickedNumbers);
        analysis.byTopic[topicName].abcdNumbers.push(...data.abcdNumbers);
        analysis.byTopic[topicName].bcdNumbers.push(...data.bcdNumbers);
      });
    });

    return analysis;
  };

  return (
    <div className="planets-analysis-sync">
      <h2>Planets Analysis (CrossPageSync)</h2>
      {loading ? (
        <p>Loading sync data...</p>
      ) : (
        <div>
          <h3>Comprehensive Analysis:</h3>
          {(() => {
            const analysis = getComprehensiveAnalysis();
            return (
              <div>
                <p>Total Clicked Numbers: {analysis.totalClickedNumbers}</p>
                <p>Total ABCD Numbers: {analysis.totalABCDNumbers}</p>
                <p>Total BCD Numbers: {analysis.totalBCDNumbers}</p>
                {/* Your planets analysis logic here */}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

export default PlanetsAnalysisWithSync;
