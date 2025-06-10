import React, { useState } from 'react';
import { backupService } from '../utils/backupService';

function BackupManager({ userId, onBackupCreated, onBackupRestored }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backups] = useState(() => backupService.getBackups(userId));

  const handleCreateBackup = async () => {
    try {
      setLoading(true);
      setError(null);
      const backup = await backupService.createBackup(userId);
      onBackupCreated?.(backup);
    } catch (error) {
      setError('Failed to create backup: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = async (timestamp) => {
    if (!confirm('Are you sure you want to restore this backup? Current data will be overwritten.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const backup = await backupService.restoreBackup(userId, timestamp);
      onBackupRestored?.(backup);
    } catch (error) {
      setError('Failed to restore backup: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBackup = (timestamp) => {
    if (!confirm('Are you sure you want to delete this backup?')) {
      return;
    }
    backupService.deleteBackup(userId, timestamp);
    // Force a re-render by updating the backups state
    window.location.reload();
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Backup Manager</h2>
        <button
          onClick={handleCreateBackup}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Backup'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {backups.map((backup) => (
          <div
            key={backup.timestamp}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div>
              <p className="font-medium">Backup from {formatDate(backup.timestamp)}</p>
              <p className="text-sm text-gray-500">
                {backup.hrData.length} data entries
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleRestoreBackup(backup.timestamp)}
                disabled={loading}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Restore
              </button>
              <button
                onClick={() => handleDeleteBackup(backup.timestamp)}
                disabled={loading}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {backups.length === 0 && (
          <p className="text-gray-500 text-center py-4">
            No backups available. Create one to save your current data.
          </p>
        )}
      </div>
    </div>
  );
}

export default BackupManager;