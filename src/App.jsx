//
// LOCALHOST AUTO-LOGIN FOR DEVELOPMENT
// Automatically logs in with specified credentials when running on localhost
// This speeds up development by skipping manual authentication
// Production deployments will still require proper login
//
import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route,
  Navigate
} from 'react-router-dom';
import { supabase } from './supabaseClient';
import { firebaseAuthService } from './services/FirebaseAuthService.js';
import UserData from './components/UserData';
import UserList from './components/UserList';
import Auth from './components/Auth';
import SimpleAuth from './components/SimpleAuth';
import FirebaseAuth from './components/FirebaseAuth';
import ProtectedRoute from './components/ProtectedRoute';
import SimpleProtectedRoute from './components/SimpleProtectedRoute';
import FirebaseProtectedRoute from './components/FirebaseProtectedRoute';
import DayDetails from './components/DayDetails';
import NumberGen from './components/NumberGen';
import ABCDBCDNumber from './components/ABCDBCDNumber';
import PlanetsAnalysisPage from './components/PlanetsAnalysisPage';
import ErrorBoundary from './components/ErrorBoundary';

// Development auto-login credentials (localhost only)
const DEV_AUTO_LOGIN = {
  email: 'gurukrpasharma@gmail.com',
  password: '#vanakamnanba2020#',
  enabled: true // Set to false to disable auto-login
};

function App() {
  const [session, setSession] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isHouseCountEnabled, setIsHouseCountEnabled] = useState(false);
  const [isAutoLoginInProgress, setIsAutoLoginInProgress] = useState(false);

  // Helper function to detect if running on localhost
  const isLocalhost = () => {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname === '::1';
  };

  // Automatic authentication for localhost development
  useEffect(() => {
    console.log('🚀 App initialization started...');
    
    // Check if already authenticated
    const currentUser = firebaseAuthService.getCurrentUser();
    if (currentUser) {
      console.log('✅ User already authenticated:', currentUser.email);
      setIsAuthenticated(true);
      setIsHouseCountEnabled(true);
      setSession(currentUser);
      localStorage.setItem('house_count_enabled', 'true');
      localStorage.setItem('auth_type', 'firebase');
      return;
    }

    // Auto-login for localhost development
    if (isLocalhost() && DEV_AUTO_LOGIN.enabled) {
      console.log('🔧 Localhost detected - Starting auto-login...');
      setIsAutoLoginInProgress(true);
      
      // Attempt automatic login with dev credentials
      firebaseAuthService.signIn(DEV_AUTO_LOGIN.email, DEV_AUTO_LOGIN.password)
        .then((result) => {
          console.log('🎉 Auto-login successful!', result.user.email);
          setIsAuthenticated(true);
          setIsHouseCountEnabled(true);
          setSession(result);
          localStorage.setItem('house_count_enabled', 'true');
          localStorage.setItem('auth_type', 'firebase');
          setIsAutoLoginInProgress(false);
        })
        .catch((error) => {
          console.log('⚠️ Auto-login failed, will show login form:', error.message);
          setIsAutoLoginInProgress(false);
          // If auto-login fails, user will see the normal login form
        });
    } else {
      console.log('🌐 Production mode or auto-login disabled - normal authentication required');
    }

    // Listen for authentication state changes
    const unsubscribe = firebaseAuthService.onAuthStateChange((user) => {
      if (user) {
        setIsAuthenticated(true);
        setIsHouseCountEnabled(true);
        setSession({ user });
        localStorage.setItem('house_count_enabled', 'true');
        localStorage.setItem('auth_type', 'firebase');
      } else {
        setIsAuthenticated(false);
        setIsHouseCountEnabled(false);
        setSession(null);
        localStorage.removeItem('house_count_enabled');
        localStorage.removeItem('auth_type');
      }
    });

    return unsubscribe;
  }, []);

  const enableHouseCounting = () => {
    setIsHouseCountEnabled(true);
    localStorage.setItem('house_count_enabled', 'true');
  };

  // Show loading screen during auto-login process
  if (isAutoLoginInProgress) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">🔧 Development Auto-Login...</p>
          <p className="mt-2 text-sm text-gray-500">Connecting with your credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            {/* Authentication Routes */}
            <Route path="/auth" element={<SimpleAuth />} />
            <Route path="/firebase-auth" element={<FirebaseAuth />} />
            <Route path="/legacy-auth" element={<Auth onEnableHouseCounting={enableHouseCounting} />} />
            
            {/* Smart redirect based on authentication state */}
            <Route path="/" element={
              isAuthenticated ? 
                <Navigate to="/users" replace /> : 
                <Navigate to="/firebase-auth" replace />
            } />
            
            {/* User List - main landing page */}
            <Route path="/users" element={
              <FirebaseProtectedRoute>
                <UserList />
              </FirebaseProtectedRoute>
            } />
            
            {/* Dashboard route */}
            <Route path="/dashboard" element={<Navigate to="/abcd-number/1" replace />} />
            
            {/* Protected Routes with Firebase Authentication */}
            <Route path="/user/:userId" element={
              <FirebaseProtectedRoute>
                <UserData />
              </FirebaseProtectedRoute>
            } />
            
            <Route path="/user-data/:userId" element={
              <FirebaseProtectedRoute>
                <UserData />
              </FirebaseProtectedRoute>
            } />
            
            <Route path="/day-details/:userId" element={
              <FirebaseProtectedRoute>
                <ErrorBoundary>
                  <DayDetails />
                </ErrorBoundary>
              </FirebaseProtectedRoute>
            } />
            
            <Route path="/number-gen" element={
              <FirebaseProtectedRoute>
                <ErrorBoundary>
                  <NumberGen />
                </ErrorBoundary>
              </FirebaseProtectedRoute>
            } />
            
            <Route path="/abcd-number/:userId" element={
              <FirebaseProtectedRoute>
                <ErrorBoundary>
                  <ABCDBCDNumber />
                </ErrorBoundary>
              </FirebaseProtectedRoute>
            } />
            
            <Route path="/planets-analysis" element={
              <FirebaseProtectedRoute>
                <ErrorBoundary>
                  <PlanetsAnalysisPage />
                </ErrorBoundary>
              </FirebaseProtectedRoute>
            } />
            
            <Route path="/planets-analysis/:userId" element={
              <FirebaseProtectedRoute>
                <ErrorBoundary>
                  <PlanetsAnalysisPage />
                </ErrorBoundary>
              </FirebaseProtectedRoute>
            } />
            
            {/* Catch all route - smart redirect based on auth state */}
            <Route path="*" element={
              isAuthenticated ? 
                <Navigate to="/users" replace /> : 
                <Navigate to="/firebase-auth" replace />
            } />
          </Routes>
        </div>
      </ErrorBoundary>
    </Router>
  );
}

export default App