import React, { useState, useEffect } from 'react';

const DataSyncStatus = () => {
  const [syncStatus, setSyncStatus] = useState('Connected');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Simplified status check for development
    setSyncStatus('Development Mode');
  }, []);

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
      <div className="flex items-center">
        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
        <span className="text-green-700 font-medium">
          Status: {syncStatus}
        </span>
        {isLoading && (
          <div className="ml-2 text-sm text-gray-500">Checking...</div>
        )}
      </div>
    </div>
  );
};

export default DataSyncStatus;
