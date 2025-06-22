import React, { useState } from 'react';

function AddNewDate({ onAddDate, existingDates }) {
  const [newDate, setNewDate] = useState('');
  const [error, setError] = useState('');

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
        className="text-xs rounded border-gray-300"
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