import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import ProgressBar from './ProgressBar';

const ALLOWED_EMAIL = import.meta.env.VITE_ALLOWED_EMAIL || 'gurukrpasharma@gmail.com';
const DOMAIN = import.meta.env.VITE_DOMAIN || 'viboothi.in';

export default function ProtectedRouteGmail({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Checking authentication...');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setProgress(20);
      setStatus('Verifying session...');

      // Check for local session first
      const localSession = localStorage.getItem('house_count_session');
      const userEmail = localStorage.getItem('user_email');

      if (localSession && userEmail === ALLOWED_EMAIL) {
        setProgress(50);
        setStatus('Validating with server...');

        // Verify with Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session validation error:', error);
          clearLocalAuth();
          setLoading(false);
          return;
        }

        setProgress(80);
        setStatus('Access granted...');

        if (session && session.user?.email === ALLOWED_EMAIL) {
          setProgress(100);
          setStatus('Welcome back!');
          setIsAuthenticated(true);
        } else {
          // Session expired or invalid
          clearLocalAuth();
        }
      } else {
        // No valid local session
        clearLocalAuth();
      }

      setLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      clearLocalAuth();
      setLoading(false);
    }
  };

  const clearLocalAuth = () => {
    localStorage.removeItem('house_count_session');
    localStorage.removeItem('house_count_enabled');
    localStorage.removeItem('user_email');
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
                Please wait while we check your permissions
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <ProgressBar 
                progress={progress} 
                message={status}
                color="bg-indigo-600"
              />
              
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  🔒 Secured by Gmail OAuth • {DOMAIN}
                </p>
              </div>
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
