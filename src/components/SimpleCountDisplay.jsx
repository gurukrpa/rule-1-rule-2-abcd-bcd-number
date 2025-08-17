import React, { useState, useEffect } from 'react';
import PureNumberBoxService from '../services/PureNumberBoxService';

const SimpleCountDisplay = ({ 
  userId, 
  dateKey, 
  hour, 
  abcdBcdData,
  refreshTrigger 
}) => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCount();
  }, [userId, dateKey, hour, abcdBcdData, refreshTrigger]);

  const loadCount = async () => {
    if (!userId || !dateKey || !hour || !abcdBcdData) return;
    
    setLoading(true);
    try {
      const highlightedCount = await PureNumberBoxService.getHighlightedCount(
        userId, dateKey, hour, abcdBcdData
      );
      setCount(highlightedCount);
    } catch (error) {
      console.error('Error loading count:', error);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
        <div className="text-sm text-blue-600">Loading count...</div>
      </div>
    );
  }

  return (
    <div className="bg-green-100 border border-green-300 rounded-lg p-3">
      <div className="text-sm font-medium text-green-700">
        Highlighted Topics: {count}
      </div>
    </div>
  );
};

export default SimpleCountDisplay;
