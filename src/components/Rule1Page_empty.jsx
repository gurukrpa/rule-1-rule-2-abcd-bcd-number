// src/components/Rule1Page.jsx

import React, { useState, useEffect } from 'react';

function Rule1Page({ date, selectedUser, datesList, onBack }) {
  const [loading, setLoading] = useState(false);
  const [selectedUserData, setSelectedUserData] = useState(null);

  useEffect(() => {
    // Load minimal user data
    loadUserData();
  }, [selectedUser]);

  const loadUserData = async () => {
    try {
      // Get basic user data
      let stored = localStorage.getItem('abcd_users_data');
      if (stored) {
        const users = JSON.parse(stored);
        const user = users.find(u => u.id.toString() === selectedUser);
        setSelectedUserData(user);
      }
    } catch (e) {
      console.error('Error loading user data:', e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-t-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">📋 Rule-1 Analysis</h1>
              {selectedUserData && (
                <div className="text-sm text-green-800 mt-2">
                  <p>✅ User: {selectedUserData.username}</p>
                  <p>🏠 HR Numbers: {selectedUserData.hr}</p>
                  <p>📅 Selected Date: {new Date(date).toLocaleDateString()}</p>
                </div>
              )}
            </div>
            <button
              onClick={onBack}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              ← Back to Dates
            </button>
          </div>
        </div>

        {/* Empty Content Placeholder */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Rule-1 Page</h2>
            <p className="text-gray-600 mb-4">This page is ready for Rule-1 implementation</p>
            <div className="text-sm text-gray-500">
              <p>Link is working • Layout is preserved • Logic is empty</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Rule1Page;
