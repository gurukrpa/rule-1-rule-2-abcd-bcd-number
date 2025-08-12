/**
 * Dual-Service Demo Component
 * Demonstrates how to use both Firebase and Supabase simultaneously
 */

import React, { useState, useEffect } from 'react';
import { dualServiceManager } from '../services/DualServiceManager';
import { databaseServiceSwitcher } from '../services/DatabaseServiceSwitcher';

const DualServiceDemo = () => {
  const [status, setStatus] = useState(null);
  const [health, setHealth] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const serviceStatus = dualServiceManager.getStatus();
      const healthStatus = await dualServiceManager.getHealthStatus();
      setStatus(serviceStatus);
      setHealth(healthStatus);
    } catch (error) {
      console.error('Failed to load status:', error);
    }
  };

  const enableDualService = async () => {
    setLoading(true);
    try {
      const result = dualServiceManager.enable();
      setStatus(result);
      await loadStatus();
      console.log('✅ Dual-service mode enabled');
    } catch (error) {
      console.error('❌ Failed to enable dual-service:', error);
    } finally {
      setLoading(false);
    }
  };

  const disableDualService = async () => {
    setLoading(true);
    try {
      const result = dualServiceManager.disable();
      setStatus(result);
      await loadStatus();
      console.log('✅ Dual-service mode disabled');
    } catch (error) {
      console.error('❌ Failed to disable dual-service:', error);
    } finally {
      setLoading(false);
    }
  };

  const testDualSave = async () => {
    setLoading(true);
    try {
      const testUserId = 'test-user-123';
      const testDate = '2025-01-01';
      const testData = {
        fileName: 'test-excel.xlsx',
        sets: {
          'Test Set 1': {
            'Element 1': {
              'Sun': 'sun-1/element',
              'Moon': 'moon-2/element'
            }
          }
        }
      };

      console.log('🧪 Testing dual-save operation...');
      const result = await dualServiceManager.saveExcelData(testUserId, testDate, testData);
      
      setTestResults({
        operation: 'Dual Save Excel Data',
        success: result.overall.success,
        details: result,
        timestamp: new Date().toISOString()
      });

      console.log('🧪 Dual-save test completed:', result);
    } catch (error) {
      setTestResults({
        operation: 'Dual Save Excel Data',
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      console.error('❌ Dual-save test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const testDualFetch = async () => {
    setLoading(true);
    try {
      const testUserId = 'test-user-123';
      const testDate = '2025-01-01';

      console.log('🧪 Testing dual-fetch operation...');
      const result = await dualServiceManager.getExcelData(testUserId, testDate);
      
      setTestResults({
        operation: 'Dual Fetch Excel Data',
        success: true,
        details: result,
        timestamp: new Date().toISOString()
      });

      console.log('🧪 Dual-fetch test completed:', result);
    } catch (error) {
      setTestResults({
        operation: 'Dual Fetch Excel Data',
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      console.error('❌ Dual-fetch test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const testSync = async () => {
    setLoading(true);
    try {
      const testUserId = 'test-user-123';

      console.log('🧪 Testing sync operation...');
      const result = await dualServiceManager.syncPrimaryToBackup(testUserId);
      
      setTestResults({
        operation: 'Sync Primary to Backup',
        success: result.success,
        details: result,
        timestamp: new Date().toISOString()
      });

      console.log('🧪 Sync test completed:', result);
    } catch (error) {
      setTestResults({
        operation: 'Sync Primary to Backup',
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      console.error('❌ Sync test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'degraded': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      case 'healthy': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        🔄 Dual-Service Manager Demo
      </h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">
          About Dual-Service Mode
        </h2>
        <p className="text-blue-700 text-sm">
          This demo shows how to run both Supabase and Firebase simultaneously for maximum reliability. 
          Data is saved to both services, with automatic fallback if one fails.
        </p>
      </div>

      {/* Service Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Service Status</h3>
          {status ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Dual-Service Mode:</span>
                <span className={status.enabled ? 'text-green-600 font-semibold' : 'text-red-600'}>
                  {status.enabled ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Primary Service:</span>
                <span className="font-semibold text-blue-600">{status.primary}</span>
              </div>
              <div className="flex justify-between">
                <span>Backup Service:</span>
                <span className="font-semibold text-orange-600">{status.backup}</span>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Loading...</div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Health Status</h3>
          {health ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Overall Status:</span>
                <span className={`font-semibold ${getHealthColor(health.overall.status)}`}>
                  {health.overall.status?.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Supabase:</span>
                <span className={`font-semibold ${getHealthColor(health.services.primary.status)}`}>
                  {health.services.primary.status} {health.services.primary.latency && `(${health.services.primary.latency}ms)`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Firebase:</span>
                <span className={`font-semibold ${getHealthColor(health.services.backup.status)}`}>
                  {health.services.backup.status}
                </span>
              </div>
              <div className="text-xs text-gray-600 mt-2">
                {health.overall.message}
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Loading...</div>
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3">Service Controls</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={enableDualService}
            disabled={loading || (status?.enabled)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Enable Dual-Service
          </button>
          
          <button
            onClick={disableDualService}
            disabled={loading || (!status?.enabled)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Disable Dual-Service
          </button>
          
          <button
            onClick={loadStatus}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            Refresh Status
          </button>
        </div>
      </div>

      {/* Test Operations */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3">Test Operations</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={testDualSave}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400"
          >
            Test Dual Save
          </button>
          
          <button
            onClick={testDualFetch}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400"
          >
            Test Dual Fetch
          </button>
          
          <button
            onClick={testSync}
            disabled={loading}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:bg-gray-400"
          >
            Test Sync
          </button>
        </div>
      </div>

      {/* Test Results */}
      {testResults && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Test Results</h3>
          <div className="bg-gray-50 rounded p-3">
            <div className="flex justify-between items-start mb-2">
              <span className="font-semibold">{testResults.operation}</span>
              <span className={`px-2 py-1 text-xs rounded ${
                testResults.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {testResults.success ? 'SUCCESS' : 'FAILED'}
              </span>
            </div>
            <div className="text-xs text-gray-600 mb-2">
              {testResults.timestamp}
            </div>
            {testResults.error && (
              <div className="text-red-600 text-sm mb-2">
                Error: {testResults.error}
              </div>
            )}
            <details className="text-sm">
              <summary className="cursor-pointer text-blue-600">View Details</summary>
              <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto">
                {JSON.stringify(testResults.details, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
            <span>Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DualServiceDemo;
