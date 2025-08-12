import React from 'react';

function SimpleUserList() {
  console.log('SimpleUserList component loaded');
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">House Count App</h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <p className="text-gray-600 mb-4">
            Application is loading successfully. Database connection will be established.
          </p>
          <div className="bg-green-50 border border-green-200 rounded p-4">
            <p className="text-green-800">✅ App is working correctly</p>
            <p className="text-sm text-green-600 mt-2">
              This confirms the React app is rendering properly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimpleUserList;
