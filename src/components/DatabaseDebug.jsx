import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function DatabaseDebug() {
  const [debugInfo, setDebugInfo] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => [...prev, { message, type, timestamp }]);
  };
  
  const runDatabaseTests = async () => {
    setLoading(true);
    setDebugInfo([]);
    
    addLog('🔍 Starting database debug tests...', 'info');
    
    // Test 1: Check environment variables
    addLog(`Environment URL: ${import.meta.env.VITE_SUPABASE_URL}`, 'info');
    addLog(`Anon Key: ${import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Found' : 'Missing'}`, 'info');
    
    try {
      // Test 2: Basic connection test
      addLog('Testing basic connection...', 'info');
      const { data: connectionTest, error: connectionError } = await supabase
        .from('users')
        .select('count');
      
      if (connectionError) {
        addLog(`❌ Connection failed: ${connectionError.message}`, 'error');
        addLog(`Error details: ${JSON.stringify(connectionError)}`, 'error');
        setLoading(false);
        return;
      }
      
      addLog('✅ Basic connection successful', 'success');
      
      // Test 3: Fetch users
      addLog('Fetching users...', 'info');
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*');
      
      if (usersError) {
        addLog(`❌ Error fetching users: ${usersError.message}`, 'error');
        addLog(`Error details: ${JSON.stringify(usersError)}`, 'error');
      } else {
        addLog(`✅ Users fetched successfully. Count: ${users.length}`, 'success');
        if (users.length > 0) {
          addLog(`Sample user: ${JSON.stringify(users[0])}`, 'info');
        }
      }
      
      // Test 4: Test user creation
      addLog('Testing user creation...', 'info');
      const testUser = {
        username: `test_${Date.now()}`,
        hr: 100,
        days: 30
      };
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([testUser])
        .select();
      
      if (createError) {
        addLog(`❌ Error creating user: ${createError.message}`, 'error');
        addLog(`Error details: ${JSON.stringify(createError)}`, 'error');
      } else {
        addLog('✅ User created successfully', 'success');
        
        // Clean up
        if (newUser && newUser[0]) {
          const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('id', newUser[0].id);
          
          if (deleteError) {
            addLog(`⚠️ Could not delete test user: ${deleteError.message}`, 'warning');
          } else {
            addLog('🧹 Test user cleaned up', 'success');
          }
        }
      }
      
    } catch (error) {
      addLog(`💥 Unexpected error: ${error.message}`, 'error');
      addLog(`Stack trace: ${error.stack}`, 'error');
    }
    
    setLoading(false);
    addLog('🏁 Database debug complete', 'info');
  };
  
  const getLogColor = (type) => {
    switch (type) {
      case 'error': return 'text-red-600';
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-gray-800';
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Database Debug Tool</h2>
        
        <button
          onClick={runDatabaseTests}
          disabled={loading}
          className={`px-4 py-2 rounded-md font-medium ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {loading ? 'Running Tests...' : 'Run Database Tests'}
        </button>
        
        {debugInfo.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Debug Log:</h3>
            <div className="bg-gray-50 rounded-md p-4 max-h-96 overflow-y-auto">
              {debugInfo.map((log, index) => (
                <div key={index} className="mb-2">
                  <span className="text-sm text-gray-500">[{log.timestamp}]</span>
                  <span className={`ml-2 ${getLogColor(log.type)}`}>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DatabaseDebug;
