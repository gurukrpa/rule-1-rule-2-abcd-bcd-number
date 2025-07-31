import React, { useState, useEffect } from 'react';
import { dualServiceManager } from '../services/DualServiceManager';

const DataSyncStatus = () => {
  const [syncStatus, setSyncStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkSyncStatus = async () => {
    try {
      setIsLoading(true);
      const status = await dualServiceManager.getStatus();
      const health = await dualServiceManager.getHealthStatus();
      setSyncStatus({ ...status, health });
    } catch (error) {
      console.error('Error checking sync status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerSync = async () => {
    try {
      setIsLoading(true);
      const currentUser = localStorage.getItem('currentUserId') || 'gurukrpasharma';
      const result = await dualServiceManager.syncPrimaryToBackup(currentUser);
      console.log('Sync result:', result);
      await checkSyncStatus();
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSyncStatus();
  }, []);

  if (!syncStatus) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg">
        <div className="animate-pulse">Loading sync status...</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">🔄 Data Sync Status</h3>
        <button
          onClick={triggerSync}
          disabled={isLoading}
          className={`px-3 py-1 rounded text-sm font-medium ${
            isLoading
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isLoading ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
            <span className="font-medium">Primary: Supabase</span>
          </div>
          <div className="flex items-center">
            <span className={`w-3 h-3 rounded-full mr-2 ${
              syncStatus.enabled ? 'bg-orange-500' : 'bg-gray-400'
            }`}></span>
            <span className="font-medium">
              Backup: Firebase {syncStatus.enabled ? '(Active)' : '(Disabled)'}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            <strong>Sync Mode:</strong> {syncStatus.enabled ? 'Enabled' : 'Disabled'}
          </div>
          <div className="text-sm text-gray-600">
            <strong>Environment:</strong> {process.env.NODE_ENV || 'development'}
          </div>
        </div>
      </div>

      {syncStatus.enabled && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-blue-800 text-sm">
            🌐 <strong>Shared Data Active:</strong> Changes made on localhost will sync to viboothi.in and vice versa through Firebase.
          </p>
        </div>
      )}

      {!syncStatus.enabled && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-800 text-sm">
            ⚠️ <strong>Sync Disabled:</strong> Data is only stored in Supabase. Enable dual-service mode for shared data.
          </p>
        </div>
      )}
    </div>
  );
};

export default DataSyncStatus;
