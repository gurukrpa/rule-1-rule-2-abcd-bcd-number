// src/components/modals/AddDateModal.jsx

import React, { useEffect, useRef } from 'react';

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
    if (datesList.length === 0) {
      console.log('🚫 No dates in list, no minimum restriction');
      return '';
    }
    
    // Find the most recent date from the dates list
    const sortedDates = [...datesList].sort((a, b) => new Date(b) - new Date(a));
    const mostRecentDateString = sortedDates[0];
    
    // Debug: Log the calculation process
    console.log('🗓️ Date restriction calculation:');
    console.log('   Original dates list:', datesList);
    console.log('   Sorted dates (newest first):', sortedDates);
    console.log('   Most recent date string:', mostRecentDateString);
    
    // Create date object from the most recent date string
    // Use the date string directly to avoid timezone issues
    const mostRecentDate = new Date(mostRecentDateString + 'T00:00:00');
    console.log('   Most recent date as Date object:', mostRecentDate);
    
    // Set minimum date to the day AFTER the most recent date
    // This disables the most recent date and all dates before it
    const nextDay = new Date(mostRecentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    console.log('   Next day date object:', nextDay);
    console.log('   Next day getDate():', nextDay.getDate());
    console.log('   Next day getMonth():', nextDay.getMonth());
    console.log('   Next day getFullYear():', nextDay.getFullYear());
    
    const minDateString = nextDay.toISOString().split('T')[0];
    console.log('   Calculated min date (day after most recent):', minDateString);
    
    // Alternative timezone-safe calculation for verification
    const year = nextDay.getFullYear();
    const month = String(nextDay.getMonth() + 1).padStart(2, '0');
    const day = String(nextDay.getDate()).padStart(2, '0');
    const safeMinDate = `${year}-${month}-${day}`;
    console.log('   Timezone-safe min date:', safeMinDate);
    
    console.log('   🚫 All dates up to and including', mostRecentDateString, 'should be disabled');
    console.log('   ✅ Only dates from', safeMinDate, 'onwards should be selectable');
    
    return safeMinDate;
  };

  // Add a useEffect or direct check to verify the min attribute
  const minDate = getMinDate();
  console.log('🔍 Current min attribute value:', minDate);

  const dateInputRef = useRef(null);

  useEffect(() => {
    if (dateInputRef.current && visible) {
      console.log('📅 Date input element:', dateInputRef.current);
      console.log('📅 Date input min attribute:', dateInputRef.current.min);
      console.log('📅 Date input value:', dateInputRef.current.value);
    }
  }, [visible, minDate]);

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
              ref={dateInputRef}
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              min={minDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            {dateError && (
              <p className="mt-2 text-sm text-red-600">{dateError}</p>
            )}
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
