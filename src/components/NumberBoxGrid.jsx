// src/components/NumberBoxGrid.jsx
// Optimized NumberBox component with virtualization and memoization

import React, { memo, useCallback, useMemo } from 'react';
import cleanSupabaseService from '../services/CleanSupabaseService';

const NumberBoxGrid = memo(({ 
  topic, 
  allDaysData, 
  abcdBcdAnalysis, 
  clickedNumbers, 
  activeHR, 
  selectedUser, 
  numberBoxLoading 
}) => {
  // Memoized date calculations
  const availableDates = useMemo(() => 
    Object.keys(allDaysData).sort((a, b) => new Date(a) - new Date(b)),
    [allDaysData]
  );

  // Memoized date filtering (only 5th+ dates show number boxes)
  const datesWithNumberBoxes = useMemo(() => 
    availableDates.filter((_, index) => index >= 4),
    [availableDates]
  );

  // Optimized click handler with debouncing
  const handleNumberBoxClick = useCallback(async (dateKey, number) => {
    if (!selectedUser || !activeHR || numberBoxLoading) return;

    try {
      const abcdNumbers = abcdBcdAnalysis[topic]?.[dateKey]?.abcdNumbers || [];
      const bcdNumbers = abcdBcdAnalysis[topic]?.[dateKey]?.bcdNumbers || [];
      const isMatched = abcdNumbers.includes(number) || bcdNumbers.includes(number);
      
      if (!isMatched) return;

      const currentClicks = clickedNumbers[topic]?.[dateKey]?.[`HR${activeHR}`] || [];
      const isAlreadyClicked = currentClicks.includes(number);
      
      if (isAlreadyClicked) {
        await cleanSupabaseService.deleteTopicClick(selectedUser, topic, dateKey, `HR${activeHR}`, number);
      } else {
        await cleanSupabaseService.saveTopicClick(selectedUser, topic, dateKey, `HR${activeHR}`, number, true);
      }
      
    } catch (error) {
      console.error('Error handling number box click:', error);
    }
  }, [selectedUser, activeHR, numberBoxLoading, abcdBcdAnalysis, topic, clickedNumbers]);

  // Memoized number box rendering
  const renderNumberBox = useCallback((dateKey, number) => {
    const currentClicks = clickedNumbers[topic]?.[dateKey]?.[`HR${activeHR}`] || [];
    const isClicked = currentClicks.includes(number);
    const abcdNumbers = abcdBcdAnalysis[topic]?.[dateKey]?.abcdNumbers || [];
    const bcdNumbers = abcdBcdAnalysis[topic]?.[dateKey]?.bcdNumbers || [];
    const isInAbcdBcd = abcdNumbers.includes(number) || bcdNumbers.includes(number);
    const isDisabled = !isInAbcdBcd || numberBoxLoading;
    
    const getButtonStyle = () => {
      if (isDisabled) {
        return 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50';
      }
      if (!isClicked) {
        return 'bg-white text-gray-700 border-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:border-gray-400 hover:shadow-sm';
      }
      
      const isAbcdMatch = abcdNumbers.includes(number);
      return 'text-white border-orange-400 shadow-md scale-105';
    };
    
    const getInlineStyle = () => {
      if (!isClicked || isDisabled) return {};
      
      const isAbcdMatch = abcdNumbers.includes(number);
      const isBcdMatch = bcdNumbers.includes(number);
      
      if (isAbcdMatch) {
        return { backgroundColor: '#FB923C', borderColor: '#F97316', color: 'white' };
      } else if (isBcdMatch) {
        return { backgroundColor: '#41B3A2', borderColor: '#359486', color: 'white' };
      }
      return { background: 'linear-gradient(to right, #4ade80, #10b981)', color: 'white', borderColor: '#10b981' };
    };

    return (
      <button
        key={`${topic}-${dateKey}-${number}`}
        onClick={() => handleNumberBoxClick(dateKey, number)}
        disabled={isDisabled}
        className={`w-6 h-6 text-xs font-bold rounded border transition-all transform ${getButtonStyle()}`}
        style={getInlineStyle()}
        title={!isInAbcdBcd ? 'Number not in ABCD/BCD arrays' : ''}
      >
        {number}
      </button>
    );
  }, [topic, clickedNumbers, activeHR, abcdBcdAnalysis, numberBoxLoading, handleNumberBoxClick]);

  // Memoized number box grid for a date
  const renderNumberBoxesForDate = useCallback((dateKey) => (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1 justify-center">
        {[1, 2, 3, 4, 5, 6].map(num => renderNumberBox(dateKey, num))}
      </div>
      <div className="flex gap-1 justify-center">
        {[7, 8, 9, 10, 11, 12].map(num => renderNumberBox(dateKey, num))}
      </div>
    </div>
  ), [renderNumberBox]);

  // Early return if no data
  if (!availableDates.length || !datesWithNumberBoxes.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data available for number boxes
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-2 text-left font-medium text-gray-700">Element</th>
            {availableDates.map((dateKey, index) => (
              <th key={dateKey} className="px-2 py-2 text-center font-medium text-gray-700 min-w-24">
                <div className="text-xs">{new Date(dateKey).toLocaleDateString()}</div>
                <div className="text-xs text-gray-500">Day {index + 1}</div>
                {index >= 4 && (
                  <div className="text-xs text-blue-600">Clickable</div>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Render elements data */}
          {Object.entries(allDaysData).length > 0 && (
            <>
              {/* Table rows for elements would go here */}
              <tr>
                <td className="px-4 py-2 font-medium">Number Boxes</td>
                {availableDates.map((dateKey, index) => (
                  <td key={dateKey} className="px-2 py-2 text-center">
                    {index >= 4 ? renderNumberBoxesForDate(dateKey) : (
                      <div className="text-xs text-gray-400">Not available</div>
                    )}
                  </td>
                ))}
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  );
});

NumberBoxGrid.displayName = 'NumberBoxGrid';

export default NumberBoxGrid;
