import React from 'react';
import { useNavigate } from 'react-router-dom';

const TestPlanetsAnalysis = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 border-t-4 border-teal-600">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">🔬 Test Planets Analysis</h1>
              <p className="text-sm text-teal-800">This is a test component to verify import/export functionality</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/users')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              >
                ← Back to Users
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Test Component Loaded Successfully!</h3>
          <p className="text-gray-600 mb-4">
            If you can see this, the import/export is working correctly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestPlanetsAnalysis;
