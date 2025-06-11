// src/components/ProgressBar.jsx
import React from 'react';

const ProgressBar = ({ 
  progress = 0, 
  message = 'Loading...', 
  showPercentage = true,
  className = '',
  color = 'blue' 
}) => {
  const colorClasses = {
    blue: 'bg-blue-600',
    purple: 'bg-purple-600',
    green: 'bg-green-600',
    orange: 'bg-orange-600'
  };

  const progressBarColor = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{message}</span>
        {showPercentage && (
          <span className="text-sm font-medium text-gray-500">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`${progressBarColor} h-2.5 rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
