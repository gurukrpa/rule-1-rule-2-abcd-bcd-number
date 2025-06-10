// src/components/modals/AddDateModal.jsx

import React from 'react';

function AddDateModal({ 
  visible, 
  onClose, 
  onSubmit, 
  newDate, 
  setNewDate, 
  dateError, 
  datesList 
}) {
  if (!visible) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  const getMinDate = () => {
    if (datesList.length === 0) return '';
    const mostRecent = new Date(datesList[0]);
    mostRecent.setDate(mostRecent.getDate() + 1);
    return mostRecent.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Add New Date</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              min={getMinDate()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            {dateError && (
              <p className="mt-2 text-sm text-red-600">{dateError}</p>
            )}
          </div>

          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> New date must be after the most recent date.
              {datesList.length >= 4 && (
                <span className="block mt-1">
                  Adding a 5th date will remove the oldest date automatically.
                </span>
              )}
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Add Date
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddDateModal;
