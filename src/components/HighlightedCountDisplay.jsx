// src/components/HighlightedCountDisplay.jsx
// ✅ HIGHLIGHTED COUNT DISPLAY COMPONENT
// Shows count of topics with clicked+highlighted numbers

import React from 'react';
import { useUnifiedNumberBox } from '../hooks/useUnifiedNumberBox';

const HighlightedCountDisplay = ({ 
  userId, 
  currentDate, 
  currentHour,
  showDetails = false,
  variant = 'badge' // 'badge', 'card', 'inline'
}) => {
  const { highlightedCount, loading } = useUnifiedNumberBox(userId, null, currentDate, currentHour);

  if (variant === 'badge') {
    return (
      <span className={`
        inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
        ${highlightedCount > 0 
          ? 'bg-green-100 text-green-800 border border-green-300' 
          : 'bg-gray-100 text-gray-600 border border-gray-300'
        }
        ${loading ? 'opacity-50' : ''}
      `}>
        {loading ? (
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
            Counting...
          </span>
        ) : (
          <span className="flex items-center gap-1">
            🎯 {highlightedCount} topic{highlightedCount !== 1 ? 's' : ''}
            {showDetails && (
              <span className="text-xs opacity-75">highlighted</span>
            )}
          </span>
        )}
      </span>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`
        p-4 rounded-lg border-2 transition-all duration-200
        ${highlightedCount > 0 
          ? 'bg-green-50 border-green-300 text-green-800' 
          : 'bg-gray-50 border-gray-300 text-gray-600'
        }
        ${loading ? 'opacity-50' : ''}
      `}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">
              {loading ? 'Counting...' : highlightedCount}
            </h3>
            <p className="text-sm opacity-75">
              Topic{highlightedCount !== 1 ? 's' : ''} with highlighted numbers
            </p>
          </div>
          <div className="text-2xl">
            {loading ? '⏳' : '🎯'}
          </div>
        </div>
        
        {showDetails && !loading && (
          <div className="mt-2 text-xs">
            <p>📅 Date: {currentDate}</p>
            <p>⏰ Hour: {currentHour}</p>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <span className={`text-sm ${loading ? 'opacity-50' : ''}`}>
        {loading ? (
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
            Counting...
          </span>
        ) : (
          <span>
            🎯 <strong>{highlightedCount}</strong> highlighted topic{highlightedCount !== 1 ? 's' : ''}
          </span>
        )}
      </span>
    );
  }

  return null;
};

export default HighlightedCountDisplay;
