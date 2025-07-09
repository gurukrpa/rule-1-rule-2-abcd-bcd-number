import React from 'react';

const Logo = ({ 
  size = 'medium', 
  className = '', 
  showText = true,
  position = 'left',
  pageTitle = null // New prop for page identification
}) => {
  const sizeClasses = {
    small: 'h-10 w-10',
    medium: 'h-14 w-14', 
    large: 'h-18 w-18',
    xlarge: 'h-24 w-24'
  };

  const positionClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  return (
    <div className={`flex items-center gap-3 ${positionClasses[position]} ${className}`}>
      <img 
        src="/logo.png" 
        alt="Viboothi Logo" 
        className={`${sizeClasses[size]} object-contain transition-transform hover:scale-105`}
        style={{ 
          filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15))',
          imageRendering: 'crisp-edges'
        }}
        onError={(e) => {
          console.error('Logo failed to load');
          // Hide the image if it fails to load
          e.target.style.display = 'none';
        }}
      />
      {showText && (
        <div className="flex flex-col">
          <span className="font-bold text-lg text-gray-800">
            viboothi.in
          </span>
          {pageTitle && (
            <span className="text-sm text-gray-600 font-medium">
              {pageTitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
