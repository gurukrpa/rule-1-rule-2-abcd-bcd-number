import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import ProgressBar from './ProgressBar';

const ALLOWED_EMAIL = import.meta.env.VITE_ALLOWED_EMAIL || 'gurukrpasharma@gmail.com';
const REDIRECT_URL = import.meta.env.VITE_AUTH_REDIRECT_URL || `${window.location.origin}/auth/callback`;
const DOMAIN = import.meta.env.VITE_DOMAIN || 'viboothi.in';

export default function GmailAuth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [authProgress, setAuthProgress] = useState(0);

  useEffect(() => {
    // Check if user is already authenticated
    checkAuthStatus();
    
    // Handle OAuth callback
    handleOAuthCallback();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user?.email === ALLOWED_EMAIL) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const handleOAuthCallback = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      if (data.session) {
        const userEmail = data.session.user.email;
        if (userEmail !== ALLOWED_EMAIL) {
          await supabase.auth.signOut();
          setError(`Access denied. Only ${ALLOWED_EMAIL} is allowed to access this application.`);
          return;
        }
        
        // Store user session and redirect
        localStorage.setItem('house_count_session', JSON.stringify(data.session));
        localStorage.setItem('house_count_enabled', 'true');
        setSuccess('Successfully authenticated! Redirecting...');
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      setError('Authentication failed. Please try again.');
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      setAuthProgress(10);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: REDIRECT_URL,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      setAuthProgress(50);

      if (error) throw error;

      setAuthProgress(100);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setError('Failed to initiate Google sign-in. Please try again.');
      setAuthProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('house_count_session');
      localStorage.removeItem('house_count_enabled');
      setSuccess('Successfully signed out!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              ABCD/BCD Number Application
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Secure access for authorized users only
            </p>
          </div>

          <div className="mt-8 space-y-6">
            {/* Progress Bar */}
            {loading && authProgress > 0 && (
              <div className="space-y-2">
                <ProgressBar 
                  progress={authProgress} 
                  message="Authenticating with Google..."
                  color="bg-indigo-600"
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-800">{success}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Google Sign-In Button */}
            <div>
              <button
                onClick={signInWithGoogle}
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </span>
                {loading ? 'Authenticating...' : 'Sign in with Google'}
              </button>
            </div>

            {/* Access Notice */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                🔒 Restricted Access: Only {ALLOWED_EMAIL} can access this application
              </p>
            </div>

            {/* Development Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-md">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Application Info</h3>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Secure Gmail OAuth authentication</li>
                <li>• Restricted to {ALLOWED_EMAIL} only</li>
                <li>• Powered by Supabase & deployed on {DOMAIN}</li>
                <li>• ABCD/BCD Number Analysis System</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
