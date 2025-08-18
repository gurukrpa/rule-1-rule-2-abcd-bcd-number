// Example: Direct Database Approach for Planets Analysis Page
// This shows how to fetch clicked numbers directly without CrossPageSync

import { useState, useEffect, useCallback } from 'react';
import cleanSupabaseService from '../services/CleanSupabaseService';

function PlanetsAnalysisDirectDB({ userId }) {
  const [clickedNumbersData, setClickedNumbersData] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch clicked numbers directly from database
  const fetchClickedNumbers = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get all clicked numbers from topic_clicks table
      const topicClicks = await cleanSupabaseService.getTopicClicks(userId);
      
      // Organize data by date and topic
      const organized = {};
      topicClicks.forEach(click => {
        const dateKey = click.date_key;
        const topicName = click.topic_name;
        
        if (!organized[dateKey]) {
          organized[dateKey] = {};
        }
        
        if (!organized[dateKey][topicName]) {
          organized[dateKey][topicName] = {
            clickedNumbers: [],
            hour: click.hour || 1
          };
        }
        
        // Add clicked number if not already present
        if (click.clicked_number && !organized[dateKey][topicName].clickedNumbers.includes(click.clicked_number)) {
          organized[dateKey][topicName].clickedNumbers.push(click.clicked_number);
        }
      });
      
      setClickedNumbersData(organized);
      console.log('✅ [Direct DB] Fetched clicked numbers:', organized);
      
    } catch (error) {
      console.error('❌ [Direct DB] Error fetching clicked numbers:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchClickedNumbers();
    }
  }, [userId, fetchClickedNumbers]);

  // Example: Get clicked numbers for a specific date and topic
  const getClickedNumbersForDateTopic = (dateKey, topicName) => {
    return clickedNumbersData[dateKey]?.[topicName]?.clickedNumbers || [];
  };

  // Example: Get all clicked numbers for analysis
  const getAllClickedNumbers = () => {
    const allNumbers = [];
    Object.values(clickedNumbersData).forEach(dateData => {
      Object.values(dateData).forEach(topicData => {
        allNumbers.push(...topicData.clickedNumbers);
      });
    });
    return [...new Set(allNumbers)]; // Remove duplicates
  };

  return (
    <div className="planets-analysis-direct">
      <h2>Planets Analysis (Direct DB)</h2>
      {loading ? (
        <p>Loading clicked numbers...</p>
      ) : (
        <div>
          <h3>Clicked Numbers Summary:</h3>
          <p>Total unique numbers: {getAllClickedNumbers().length}</p>
          {/* Your planets analysis logic here using clicked numbers */}
        </div>
      )}
    </div>
  );
}

export default PlanetsAnalysisDirectDB;
