import React from 'react';

/**
 * Environment Banner Component
 * Shows a warning banner when in automation or development environment
 */
const EnvironmentBanner = () => {
  // Simple check for automation environment
  const isAutomation = typeof window !== 'undefined' && 
    (window.location.href.includes('automation') || 
     import.meta.env.VITE_AUTOMATION_MODE === 'true');
  
  // Don't show banner in production
  if (!isAutomation) {
    return null;
  }
  
  return (
    <div className="w-full px-4 py-2 text-center text-sm font-semibold border-b-2 bg-yellow-100 border-yellow-400 text-yellow-800">
      <div className="flex items-center justify-center space-x-4">
        <span className="text-lg">🤖 AUTOMATION ENVIRONMENT</span>
        <div className="hidden md:flex space-x-2 text-xs">
          <span className="bg-black bg-opacity-10 px-2 py-1 rounded">
            Testing Mode Active
          </span>
        </div>
      </div>
      
      {/* Environment switch helper */}
      <div className="mt-1 text-xs opacity-75">
        💡 Switch to production: <code>./switch-environment.sh production</code>
      </div>
    </div>
  );
};

export default EnvironmentBanner;
