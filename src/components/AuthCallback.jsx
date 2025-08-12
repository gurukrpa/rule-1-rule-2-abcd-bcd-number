import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import ProgressBar from './ProgressBar';

const ALLOWED_EMAIL = import.meta.env.VITE_ALLOWED_EMAIL || 'gurukrpasharma@gmail.com';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing authentication...');
  const [progress, setProgress] = useState(10);
  const [error, setError] = useState(null);

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      setProgress(30);
      setStatus('Verifying authentication...');

      // Get the session from the URL hash
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth callback error:', error);
        throw new Error('Authentication failed');
      }

      setProgress(60);
      setStatus('Checking permissions...');

      if (data.session) {
        const userEmail = data.session.user.email;
        
        // Check if the email is allowed
        if (userEmail !== ALLOWED_EMAIL) {
          setProgress(100);
          setError(`Access denied. Only ${ALLOWED_EMAIL} is allowed to access this application.`);
          
          // Sign out the unauthorized user
          await supabase.auth.signOut();
          
          setTimeout(() => {
            navigate('/auth');
          }, 3000);
          return;
        }

        setProgress(80);
        setStatus('Setting up your session...');

        // Create or update user in our database
        const { data: userData, error: userError } = await supabase
          .from('auth_users')
          .upsert({
            email: userEmail,
            name: data.session.user.user_metadata?.full_name || userEmail,
            avatar_url: data.session.user.user_metadata?.avatar_url,
            last_login: new Date().toISOString()
          }, {
            onConflict: 'email'
          })
          .select()
          .single();

        if (userError) {
          console.error('Error creating/updating user:', userError);
          // Continue anyway, as this is not critical
        }

        setProgress(90);
        setStatus('Finalizing login...');

        // Store session data
        localStorage.setItem('house_count_session', JSON.stringify(data.session));
        localStorage.setItem('house_count_enabled', 'true');
        localStorage.setItem('user_email', userEmail);

        setProgress(100);
        setStatus('Welcome! Redirecting to dashboard...');

        // Redirect to the main application
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);

      } else {
        throw new Error('No session found');
      }

    } catch (error) {
      console.error('Auth callback error:', error);
      setError(error.message || 'Authentication failed');
      setProgress(100);
      
      setTimeout(() => {
        navigate('/auth');
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center animate-spin">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {error ? 'Authentication Failed' : 'Authenticating...'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {error ? 'Please try again' : 'Please wait while we verify your access'}
            </p>
          </div>

          <div className="mt-8 space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <ProgressBar 
                progress={progress} 
                message={status}
                color={error ? "bg-red-600" : "bg-indigo-600"}
              />
            </div>

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
                    <p className="text-xs text-red-600 mt-1">Redirecting to login page...</p>
                  </div>
                </div>
              </div>
            )}

            {/* Success indicators */}
            {!error && progress === 100 && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-800">Authentication successful!</p>
                  </div>
                </div>
              </div>
            )}

            {/* Processing steps */}
            {!error && (
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${progress >= 30 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                  <div className={`w-2 h-2 rounded-full ${progress >= 60 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                  <div className={`w-2 h-2 rounded-full ${progress >= 80 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                  <div className={`w-2 h-2 rounded-full ${progress >= 100 ? 'bg-indigo-600' : 'bg-gray-300'}`}></div>
                </div>
                <p className="text-xs text-gray-500">
                  Securing your access to the ABCD/BCD Number Application
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
