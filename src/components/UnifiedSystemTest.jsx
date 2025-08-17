// src/components/UnifiedSystemTest.jsx
// ✅ TEST PAGE for Unified Number Box System
// Quick way to test the new system without complex routing

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import UnifiedNumberBox from './UnifiedNumberBox';
import HighlightedCountDisplay from './HighlightedCountDisplay';
import { useUnifiedNumberBox } from '../hooks/useUnifiedNumberBox';

function UnifiedSystemTest() {
  const { userId } = useParams();
  const [selectedTopic, setSelectedTopic] = useState('D-3 Set-1');
  const [selectedDate, setSelectedDate] = useState('8-8-25');
  const [selectedHour, setSelectedHour] = useState(1);

  // Test ABCD/BCD numbers (simulating D-3 Set-1 pattern)
  const abcdNumbers = [3, 4, 9, 10];
  const bcdNumbers = [5];

  const {
    getCurrentClickedNumbers,
    hasClickedNumbers,
    clickedNumbersCount,
    forceHighlightUpdate
  } = useUnifiedNumberBox(userId, selectedTopic, selectedDate, selectedHour);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🧪 Unified Number Box System Test
        </h1>
        <p className="text-gray-600">
          Test the new number box system with cross-page synchronization
        </p>
        <div className="mt-2">
          <Link 
            to={`/abcd-number/${userId}`}
            className="text-blue-600 hover:text-blue-800 mr-4"
          >
            ← Back to Main App
          </Link>
          <Link 
            to={`/planets-analysis/${userId}`}
            className="text-green-600 hover:text-green-800"
          >
            Test Cross-Page Sync →
          </Link>
        </div>
      </div>

      {/* Test Controls */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Test Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Topic
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="D-3 Set-1">D-3 Set-1</option>
              <option value="D-4 Set-1">D-4 Set-1</option>
              <option value="D-5 Set-1">D-5 Set-1</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="text"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              placeholder="8-8-25"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hour
            </label>
            <select
              value={selectedHour}
              onChange={(e) => setSelectedHour(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value={1}>Hour 1</option>
              <option value={2}>Hour 2</option>
              <option value={3}>Hour 3</option>
            </select>
          </div>
        </div>
      </div>

      {/* Count Display */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Highlighted Count Display</h2>
        <div className="flex gap-4">
          <HighlightedCountDisplay 
            userId={userId}
            currentDate={selectedDate}
            currentHour={selectedHour}
            variant="card"
            showDetails={true}
          />
          <HighlightedCountDisplay 
            userId={userId}
            currentDate={selectedDate}
            currentHour={selectedHour}
            variant="badge"
            showDetails={true}
          />
        </div>
      </div>

      {/* Number Box */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Number Box Component</h2>
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <UnifiedNumberBox
            userId={userId}
            topic={selectedTopic}
            date={selectedDate}
            hour={selectedHour}
            abcdNumbers={abcdNumbers}
            bcdNumbers={bcdNumbers}
            showTitle={true}
            gridCols={6}
            size="medium"
          />
        </div>
      </div>

      {/* Current State */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Current State</h2>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>User ID:</strong> {userId}
            </div>
            <div>
              <strong>Context:</strong> {selectedTopic} | {selectedDate} | HR-{selectedHour}
            </div>
            <div>
              <strong>Has Clicked Numbers:</strong> {hasClickedNumbers ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Clicked Count:</strong> {clickedNumbersCount}
            </div>
            <div className="col-span-2">
              <strong>Clicked Numbers:</strong> [{getCurrentClickedNumbers().join(', ')}]
            </div>
          </div>
        </div>
      </div>

      {/* Test Matrix (Simulated) */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Test Matrix (Simulated)</h2>
        <p className="text-sm text-gray-600 mb-3">
          This simulates the matrix cells that should be highlighted when numbers are clicked.
          Click number 10 above, then check if "var-10-le" and "in-10-le" get highlighted.
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          <table className="border-collapse border border-gray-300 w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2">Element</th>
                <th className="border border-gray-300 px-3 py-2">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-3 py-2">as-1-ta</td>
                <td className="border border-gray-300 px-3 py-2" data-number="1">Test Cell 1</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2">var-10-le</td>
                <td className="border border-gray-300 px-3 py-2" data-number="10">Test Cell 10</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2">sl-4-aq</td>
                <td className="border border-gray-300 px-3 py-2" data-number="4">Test Cell 4</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2">in-10-le</td>
                <td className="border border-gray-300 px-3 py-2" data-number="10">Test Cell 10 (again)</td>
              </tr>
            </tbody>
          </table>
          
          <div className="space-y-3">
            <button
              onClick={forceHighlightUpdate}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              🔄 Force Highlight Update
            </button>
            
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
              <strong>Test Instructions:</strong>
              <ol className="mt-2 space-y-1 list-decimal list-inside">
                <li>Click number 10 above</li>
                <li>Check if "var-10-le" and "in-10-le" get orange highlighting</li>
                <li>Refresh the page</li>
                <li>Verify highlighting persists</li>
                <li>Go to Planets Analysis page</li>
                <li>Verify same numbers are highlighted there</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Info */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <details>
          <summary className="cursor-pointer font-medium">🔍 Debug Information</summary>
          <pre className="mt-2 text-xs overflow-auto max-h-40">
            {JSON.stringify({
              userId,
              selectedTopic,
              selectedDate,
              selectedHour,
              abcdNumbers,
              bcdNumbers,
              currentClickedNumbers: getCurrentClickedNumbers(),
              hasClickedNumbers,
              clickedNumbersCount
            }, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}

export default UnifiedSystemTest;
