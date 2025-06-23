import React, { useState } from 'react';

function AddNewDate({ onAddDate, existingDates }) {
  const [newDate, setNewDate] = useState('');
  const [error, setError] = useState('');

  const getMinDate = () => {
    if (!existingDates || existingDates.length === 0) return '';
    
    // Find the most recent date from the existing dates
    const sortedDates = [...existingDates].sort((a, b) => new Date(b) - new Date(a));
    const mostRecentDate = new Date(sortedDates[0]);
    
    // Set minimum date to the day AFTER the most recent date
    // This disables the most recent date and all dates before it
    mostRecentDate.setDate(mostRecentDate.getDate() + 1);
    
    return mostRecentDate.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!newDate) {
      setError('Select date');
      return;
    }

    if (existingDates.includes(newDate)) {
      setError('Date exists');
      return;
    }

    const success = await onAddDate(newDate);
    if (success) {
      setNewDate('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1">
      <input
        type="date"
        value={newDate}
        onChange={(e) => setNewDate(e.target.value)}
        min={getMinDate()}
        className="text-xs rounded border-gray-300"
        title={existingDates.length > 0 ? `Dates up to and including ${new Date(existingDates.sort((a, b) => new Date(b) - new Date(a))[0]).toLocaleDateString()} are disabled` : ''}
      />
      <button
        type="submit"
        className="bg-green-500 text-white px-2 py-1 text-xs rounded hover:bg-green-600"
      >
        Add
      </button>
      {error && (
        <span className="text-xs text-red-600">{error}</span>
      )}
    </form>
  );
}

export default AddNewDate;