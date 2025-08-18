// src/components/UnifiedNumberBox.jsx
// ✅ UNIFIED NUMBER BOX COMPONENT
// Works on both Rule1 and PlanetsAnalysis pages with consistent behavior

import React from 'react';
import { useUnifiedNumberBox } from '../hooks/useUnifiedNumberBox';

const UnifiedNumberBox = ({ 
  userId, 
  topic, 
  date, 
  hour, 
  abcdNumbers = [], 
  bcdNumbers = [],
  showTitle = true,
  gridCols = 6,
  size = 'medium' // 'small', 'medium', 'large'
}) => {

  const {
    handleNumberClick,
    isNumberClicked,
    getCurrentClickedNumbers,
    highlightedCount,
    loading,
    setAnalysisData
  } = useUnifiedNumberBox(userId, topic, date, hour);

  // Feedback message state
  const [feedback, setFeedback] = React.useState('');

  // Set analysis data for highlighting logic
  React.useEffect(() => {
    if (abcdNumbers.length > 0 || bcdNumbers.length > 0) {
      setAnalysisData(topic, date, abcdNumbers, bcdNumbers);
    }
  }, [topic, date, abcdNumbers, bcdNumbers, setAnalysisData]);

  // Debug logging for props
  React.useEffect(() => {
    console.log(`🎯 [UnifiedNumberBox] Props received:`, {
      userId,
      topic,
      date,
      hour,
      hourType: typeof hour,
      abcdNumbers,
      bcdNumbers
    });
  }, [userId, topic, date, hour, abcdNumbers, bcdNumbers]);

  // Size configurations
  const sizeConfig = {
    small: {
      button: 'w-8 h-8 text-xs',
      container: 'gap-1',
      title: 'text-xs'
    },
    medium: {
      button: 'w-12 h-12 text-sm',
      container: 'gap-2',
      title: 'text-sm'
    },
    large: {
      button: 'w-16 h-16 text-lg',
      container: 'gap-3',
      title: 'text-base'
    }
  };

  const config = sizeConfig[size] || sizeConfig.medium;
  const numbers = Array.from({ length: 12 }, (_, i) => i + 1);
  const clickedNumbers = getCurrentClickedNumbers();

  // Determine button style based on number type and state
  const getButtonStyle = (number) => {
    const isClicked = isNumberClicked(number);
    const isAbcd = abcdNumbers.includes(number);
    const isBcd = bcdNumbers.includes(number);
    const isAvailable = isAbcd || isBcd;

    if (isClicked) {
      if (isAbcd) {
        return 'bg-orange-400 text-white border-orange-600 shadow-lg transform scale-105';
      } else if (isBcd) {
        return 'bg-teal-500 text-white border-teal-600 shadow-lg transform scale-105';
      } else {
        return 'bg-blue-400 text-white border-blue-600 shadow-lg transform scale-105';
      }
    } else if (isAvailable) {
      if (isAbcd) {
        return 'bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200 hover:border-orange-400';
      } else if (isBcd) {
        return 'bg-teal-100 text-teal-800 border-teal-300 hover:bg-teal-200 hover:border-teal-400';
      }
    }

    // Disabled state for unavailable numbers
    return 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed opacity-50';
  };

  const isNumberAvailable = (number) => {
    return abcdNumbers.includes(number) || bcdNumbers.includes(number);
  };

  return (
    <div className="number-box-container">
      {showTitle && (
        <div className={`font-semibold text-gray-700 mb-2 ${config.title}`}>
          📊 Numbers for {topic} {date} HR-{hour}
          {clickedNumbers.length > 0 && (
            <span className="ml-2 text-blue-600">
              ({clickedNumbers.length} clicked)
            </span>
          )}
        </div>
      )}

      {/* ABCD/BCD Legend */}
      {(abcdNumbers.length > 0 || bcdNumbers.length > 0) && (
        <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
          <div className="flex flex-wrap gap-2">
            {abcdNumbers.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 bg-orange-400 rounded"></span>
                <span>ABCD: [{abcdNumbers.join(', ')}]</span>
              </div>
            )}
            {bcdNumbers.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 bg-teal-500 rounded"></span>
                <span>BCD: [{bcdNumbers.join(', ')}]</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Number Grid */}
      <div 
        className={`grid ${config.container}`}
        style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}
      >
        {numbers.map(number => (
          <button
            key={number}
            onClick={async () => {
              if (isNumberAvailable(number) && !loading) {
                setFeedback('');
                // Debug log for parameters
                console.log('[DEBUG] Saving click:', {
                  userId,
                  topic,
                  date,
                  hour,
                  number
                });
                try {
                  await handleNumberClick(number);
                  setFeedback('Saved!');
                } catch (error) {
                  setFeedback('Failed to save. Please try again.');
                  console.error('[DEBUG] Save error:', error);
                }
              }
            }}
            disabled={!isNumberAvailable(number) || loading}
            className={`
              ${config.button} 
              ${getButtonStyle(number)}
              rounded-lg border-2 font-bold transition-all duration-200
              ${!loading && isNumberAvailable(number) ? 'hover:scale-105' : ''}
              ${loading ? 'opacity-50' : ''}
            `}
            title={
              isNumberAvailable(number) 
                ? `Click to ${isNumberClicked(number) ? 'unclick' : 'click'} number ${number}`
                : `Number ${number} not available in ABCD/BCD`
            }
          >
            {number}
          </button>
        ))}
      </div>

      {/* Status Info & Feedback */}
      <div className="mt-2 text-xs text-gray-600">
        <div className="flex justify-between items-center">
          <span>
            Available: {abcdNumbers.length + bcdNumbers.length} numbers
          </span>
          <span>
            Clicked: {clickedNumbers.length}
          </span>
        </div>
        {loading && (
          <div className="text-blue-600 mt-1">
            ⏳ Updating...
          </div>
        )}
        {feedback && (
          <div className="mt-1 text-sm text-green-700">
            {feedback}
          </div>
        )}
      </div>

      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-2 text-xs">
          <summary className="cursor-pointer text-gray-500">Debug Info</summary>
          <pre className="mt-1 bg-gray-100 p-2 rounded text-xs overflow-auto">
            {JSON.stringify({
              topic,
              date, 
              hour,
              abcdNumbers,
              bcdNumbers,
              clickedNumbers,
              highlightedCount
            }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default UnifiedNumberBox;
