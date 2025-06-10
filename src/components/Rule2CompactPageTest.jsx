import React from 'react';

const Rule2CompactPage = ({ date, selectedUser, datesList, onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 border-t-4 border-purple-600">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">🔗 Rule-2 Compact Analysis (30-Topic Format)</h1>
              <div className="mt-2 text-sm text-purple-800">
                <p>👤 User: {selectedUser}</p>
                <p>📅 Trigger Date: {new Date(date).toLocaleDateString()}</p>
                <p>📊 Testing new compact format...</p>
              </div>
            </div>
            <button onClick={onBack} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">
              ← Back
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            📋 30-Topic Single-Row Results (Test Mode)
          </h2>
          
          <div className="space-y-2 font-mono text-sm">
            <div className="p-3 rounded border-l-4 border-green-500 bg-green-50">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-blue-700">01.</span>
                <span className="font-bold text-gray-800">D-1 Set-1 Matrix</span>
                <span className="text-green-700">-ABCD Numbers-</span>
                <span className="font-semibold bg-green-100 px-2 py-1 rounded">6,7,8,10</span>
                <span className="text-blue-700">/ BCD Numbers-</span>
                <span className="font-semibold bg-blue-100 px-2 py-1 rounded">1</span>
                <span className="text-xs text-gray-500 ml-auto">(Test data)</span>
              </div>
            </div>
            
            <div className="p-3 rounded border-l-4 border-green-500 bg-green-50">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-blue-700">02.</span>
                <span className="font-bold text-gray-800">D-1 Set-2 Matrix</span>
                <span className="text-green-700">-ABCD Numbers-</span>
                <span className="font-semibold bg-green-100 px-2 py-1 rounded">2,5,9</span>
                <span className="text-blue-700">/ BCD Numbers-</span>
                <span className="font-semibold bg-blue-100 px-2 py-1 rounded">3,11</span>
                <span className="text-xs text-gray-500 ml-auto">(Test data)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">🔍 Test Mode Active</h4>
            <div className="text-xs text-blue-700 space-y-1">
              <p>This is a simplified test version to verify the import/export functionality.</p>
              <p>The full 30-topic analysis will be implemented once the basic structure works.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rule2CompactPage;
