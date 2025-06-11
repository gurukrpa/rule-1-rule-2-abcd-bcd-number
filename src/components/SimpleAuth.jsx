import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from './ProgressBar';

const AUTHORIZED_USERNAME = 'gurukrpasharma';
const AUTHORIZED_PASSWORD = 'Srimatha1@';

export default function SimpleAuth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setProgress(20);

    // Simulate authentication delay for better UX
    setTimeout(() => {
      setProgress(60);
      
      // Validate credentials
      if (username === AUTHORIZED_USERNAME && password === AUTHORIZED_PASSWORD) {
        setProgress(100);
        
        // Store authentication session
        const session = {
          user: {
            username: AUTHORIZED_USERNAME,
            email: 'gurukrpasharma@gmail.com',
            authenticated: true,
            loginTime: new Date().toISOString()
          }
        };
        
        localStorage.setItem('house_count_session', JSON.stringify(session));
        localStorage.setItem('house_count_enabled', 'true');
        localStorage.setItem('user_email', 'gurukrpasharma@gmail.com');
        localStorage.setItem('auth_type', 'simple');
        
        // Redirect to user list
        setTimeout(() => {
          navigate('/users');
        }, 1000);
        
      } else {
        setProgress(0);
        setError('Invalid username or password. Please try again.');
        setLoading(false);
      }
    }, 1500);
  };

  const handleSignOut = () => {
    localStorage.removeItem('house_count_session');
    localStorage.removeItem('house_count_enabled');
    localStorage.removeItem('user_email');
    localStorage.removeItem('auth_type');
    setUsername('');
    setPassword('');
    setError(null);
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
              viboothi.in
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            {/* Progress Bar */}
            {loading && progress > 0 && (
              <div className="space-y-2">
                <ProgressBar 
                  progress={progress} 
                  message={progress === 100 ? "Login successful! Redirecting..." : "Authenticating..."}
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
                    <p className="text-sm text-green-800">Welcome back! Redirecting to dashboard...</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <div className="mt-1">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Enter your username"
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

            {/* Login Button */}
            <div>
              <button
                type="submit"
                disabled={loading || !username || !password}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </span>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            {/* Sign Out Button (if already signed in) */}
            {localStorage.getItem('house_count_session') && !loading && (
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
              <h3 className="text-sm font-medium text-blue-800 mb-2">Application Info</h3>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Secure username/password authentication</li>
                <li>• Access to ABCD/BCD Number Analysis System</li>
                <li>• Full feature access after login</li>
                <li>• Data synchronized with Supabase cloud</li>
              </ul>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
