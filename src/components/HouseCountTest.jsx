import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function HouseCountTest() {
  const [fromHouse, setFromHouse] = useState('');
  const [toHouse, setToHouse] = useState('');
  const [count, setCount] = useState(null);
  const [error, setError] = useState(null);

  const houses = ["Ar", "Ta", "Ge", "Cn", "Le", "Vi", "Li", "Sc", "Sg", "Cp", "Aq", "Pi"];

  const calculateHouseNumber = (startHouse, endHouse) => {
    if (!startHouse || !endHouse) {
      setError('Please select both houses');
      return null;
    }

    const startIndex = houses.indexOf(startHouse);
    const endIndex = houses.indexOf(endHouse);
    
    if (startIndex === -1 || endIndex === -1) {
      setError('Invalid house selection');
      return null;
    }

    // If same house, return 1
    if (startHouse === endHouse) return 1;

    // Calculate forward movement from startHouse to endHouse
    let count = 1; // Start counting from 1
    let currentIndex = startIndex;

    // Keep moving forward until we reach the end house
    while (currentIndex !== endIndex) {
      currentIndex = (currentIndex + 1) % 12; // Move to next house, wrap around at 12
      count++;
    }

    setError(null);
    return count;
  };

  const handleCalculate = () => {
    const result = calculateHouseNumber(fromHouse, toHouse);
    if (result !== null) {
      setCount(result);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">House Count Test</h1>
          <Link
            to="/"
            className="text-blue-500 hover:text-blue-700"
          >
            Back to Home
          </Link>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From House
            </label>
            <select
              value={fromHouse}
              onChange={(e) => setFromHouse(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="">Select House</option>
              {houses.map((house) => (
                <option key={house} value={house}>{house}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To House
            </label>
            <select
              value={toHouse}
              onChange={(e) => setToHouse(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="">Select House</option>
              {houses.map((house) => (
                <option key={house} value={house}>{house}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleCalculate}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Calculate Count
          </button>

          {count !== null && (
            <div className="mt-6 p-4 bg-blue-50 rounded-md">
              <p className="text-blue-800 font-medium">
                House Count: {count}
              </p>
              <p className="text-sm text-blue-600 mt-2">
                Path: {fromHouse} → {houses.slice((houses.indexOf(fromHouse) + 1) % 12, houses.indexOf(toHouse) + 1).join(' → ')}
              </p>
            </div>
          )}

          <div className="mt-8 p-4 bg-gray-50 rounded-md">
            <h2 className="font-medium mb-2">Example Counts:</h2>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Aq → Cn = 6 (Aq → Pi → Ar → Ta → Ge → Cn)</li>
              <li>• Ar → Le = 5 (Ar → Ta → Ge → Cn → Le)</li>
              <li>• Same house → Same house = 1</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HouseCountTest;