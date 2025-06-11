import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import ProgressBar from './ProgressBar';

export default function SimpleProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      // Check for valid session
      const session = localStorage.getItem('house_count_session');
      const authType = localStorage.getItem('auth_type');
      const enabled = localStorage.getItem('house_count_enabled');

      if (session && authType === 'simple' && enabled === 'true') {
        const sessionData = JSON.parse(session);
        
        // Verify session has required data
        if (sessionData.user && sessionData.user.authenticated && sessionData.user.username === 'gurukrpasharma') {
          setIsAuthenticated(true);
        } else {
          // Invalid session data
          clearAuth();
        }
      } else {
        // No valid session
        clearAuth();
      }
    } catch (error) {
      console.error('Auth check error:', error);
      clearAuth();
    }
    
    setLoading(false);
  };

  const clearAuth = () => {
    localStorage.removeItem('house_count_session');
    localStorage.removeItem('house_count_enabled');
    localStorage.removeItem('user_email');
    localStorage.removeItem('auth_type');
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center animate-pulse">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Verifying Access
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Please wait while we check your authentication
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <ProgressBar 
                progress={75} 
                message="Checking credentials..."
                color="bg-indigo-600"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}
