// src/components/modals/HourEntryModal.jsx

import React from 'react';

function HourEntryModal({
  show,
  onClose,
  hourEntryDate,
  datesList,
  hourEntryPlanetSelections,
  setHourEntryPlanetSelections,
  hourEntryError,
  handleHourEntryPlanetChange,
  handleSaveHourEntry,
  selectedUserData,
  planets
}) {
  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSaveHourEntry();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Hour Entry</h2>
            <p className="text-sm text-gray-600">
              Date: {formatDate(hourEntryDate)} | User: {selectedUserData?.username}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <p className="text-sm text-gray-700 mb-4">
              Select a planet for each HR period:
            </p>
            
            <div className="grid gap-4">
              {selectedUserData && Array.from({ length: selectedUserData.hr }, (_, i) => i + 1).map(hr => (
                <div key={hr} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <label className="font-medium text-gray-700 min-w-[60px]">
                    HR-{hr}:
                  </label>
                  <select
                    value={hourEntryPlanetSelections[hr] || ''}
                    onChange={(e) => handleHourEntryPlanetChange(hr, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Planet</option>
                    {planets.map(planet => (
                      <option key={planet.value} value={planet.value}>
                        {planet.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {hourEntryError && (
              <p className="mt-3 text-sm text-red-600">{hourEntryError}</p>
            )}
          </div>

          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> All HR periods must have a planet selected before saving.
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Hour Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default HourEntryModal;
