import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { firebaseAuthService } from '../services/FirebaseAuthService.js';
import ProgressBar from './ProgressBar';

export default function FirebaseAuth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isSignUp, setIsSignUp] = useState(false);
  const [displayName, setDisplayName] = useState('');

  // Check if already authenticated
  useEffect(() => {
    const currentUser = firebaseAuthService.getCurrentUser();
    if (currentUser && currentUser.user.authenticated) {
      navigate('/users');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setProgress(20);

    try {
      setProgress(60);
      
      let result;
      if (isSignUp) {
        result = await firebaseAuthService.signUp(email, password, displayName);
      } else {
        result = await firebaseAuthService.signIn(email, password);
      }

      setProgress(100);
      
      if (result && result.user.authenticated) {
        console.log('🎉 Authentication successful:', result.user.email);
        
        // Enable house counting for authenticated user
        localStorage.setItem('house_count_enabled', 'true');
        localStorage.setItem('auth_type', 'firebase');
        
        // Redirect to user list
        setTimeout(() => {
          navigate('/users');
        }, 1000);
      }
    } catch (authError) {
      setProgress(0);
      setError(authError.message);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await firebaseAuthService.signOut();
      localStorage.removeItem('house_count_enabled');
      localStorage.removeItem('auth_type');
      setEmail('');
      setPassword('');
      setDisplayName('');
      setError(null);
    } catch (error) {
      setError('Error signing out: ' + error.message);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setDisplayName('');
  };

  // Quick login for testing (backward compatibility)
  const handleQuickLogin = async () => {
    setEmail('admin@viboothi.local');
    setPassword('Srimatha1@');
    setLoading(true);
    setError(null);
    setProgress(20);

    try {
      setProgress(60);
      const result = await firebaseAuthService.authenticateUser('gurukrpasharma', 'Srimatha1@');
      setProgress(100);
      
      if (result && result.user.authenticated) {
        localStorage.setItem('house_count_enabled', 'true');
        localStorage.setItem('auth_type', 'firebase');
        
        setTimeout(() => {
          navigate('/users');
        }, 1000);
      }
    } catch (error) {
      setProgress(0);
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              viboothi.in
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isSignUp ? 'Create your account' : 'Sign in to your account'}
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {/* Progress Bar */}
            {loading && progress > 0 && (
              <div className="space-y-2">
                <ProgressBar 
                  progress={progress} 
                  message={
                    progress === 100 
                      ? "Authentication successful! Redirecting..." 
                      : isSignUp 
                        ? "Creating account..." 
                        : "Signing in..."
                  }
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
            {progress === 100 && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-800">Welcome! Redirecting to dashboard...</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Display Name Field (Sign Up Only) */}
              {isSignUp && (
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                    Display Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="displayName"
                      name="displayName"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="Enter your display name"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading || !email || !password || (isSignUp && !displayName)}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </span>
                {loading ? (isSignUp ? 'Creating Account...' : 'Signing in...') : (isSignUp ? 'Create Account' : 'Sign in')}
              </button>
            </div>

            {/* Toggle Sign Up/Sign In */}
            <div className="text-center">
              <button
                type="button"
                onClick={toggleMode}
                className="text-sm text-indigo-600 hover:text-indigo-500"
                disabled={loading}
              >
                {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
              </button>
            </div>

            {/* Quick Login for Testing */}
            {!isSignUp && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleQuickLogin}
                  className="text-xs text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  Quick Login (Demo)
                </button>
              </div>
            )}

            {/* Sign Out Button (if already signed in) */}
            {firebaseAuthService.getCurrentUser() && !loading && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Sign out and try different credentials
                </button>
              </div>
            )}

            {/* Application Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-md">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Firebase Authentication</h3>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Secure Firebase authentication</li>
                <li>• Real-time data synchronization</li>
                <li>• Cloud-based user management</li>
                <li>• Enhanced security and scalability</li>
              </ul>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
