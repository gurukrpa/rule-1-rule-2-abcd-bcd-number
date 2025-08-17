import React, { useState, useEffect } from 'react';
import PureNumberBoxService from '../services/PureNumberBoxService';

const SimpleNumberBox = ({ 
  number, 
  userId, 
  topic, 
  dateKey, 
  hour, 
  onClickChange 
}) => {
  const [isClicked, setIsClicked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load initial state
  useEffect(() => {
    loadState();
  }, [userId, topic, dateKey, hour]);

  const loadState = async () => {
    try {
      const clickedNumbers = await PureNumberBoxService.getClickedNumbers(
        userId, topic, dateKey, hour
      );
      setIsClicked(clickedNumbers.includes(number));
    } catch (error) {
      console.error('Error loading number box state:', error);
    }
  };

  const handleClick = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const newState = await PureNumberBoxService.clickNumber(
        userId, topic, dateKey, hour, number
      );
      setIsClicked(newState);
      if (onClickChange) onClickChange(number, newState);
    } catch (error) {
      console.error('Error clicking number box:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        w-8 h-8 flex items-center justify-center text-sm font-bold 
        border-2 cursor-pointer transition-all duration-200
        ${isClicked 
          ? 'bg-red-500 text-white border-red-600' 
          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
        }
        ${loading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {number}
    </div>
  );
};

export default SimpleNumberBox;
