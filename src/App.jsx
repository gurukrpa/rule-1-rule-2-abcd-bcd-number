// 
// TEMPORARY DEVELOPMENT MODE: Authentication is disabled
// All routes are accessible without login for development purposes
// To re-enable authentication, search for "TEMPORARY" comments and restore original logic
//
import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route,
  Navigate
} from 'react-router-dom';
import { supabase } from './supabaseClient';
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

function App() {
  const [session, setSession] = useState(null);
  // TEMPORARY: Disable authentication for development
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isHouseCountEnabled, setIsHouseCountEnabled] = useState(true);

  useEffect(() => {
    // TEMPORARY: Auto-enable house counting for development
    localStorage.setItem('house_count_enabled', 'true');
    localStorage.setItem('auth_type', 'simple');
    
    // Create a temporary session for development
    const tempSession = {
      user: {
        authenticated: true,
        email: 'dev@temporary.com',
        id: 'temp-dev-user'
      }
    };
    localStorage.setItem('house_count_session', JSON.stringify(tempSession));
    setSession(tempSession);

    /* COMMENTED OUT FOR DEVELOPMENT - Authentication logic
    // Check if house counting is enabled in localStorage
    const houseCountEnabled = localStorage.getItem('house_count_enabled');
    if (houseCountEnabled === 'true') {
      setIsHouseCountEnabled(true);
    }

    // Check if there's a valid simple auth session
    const savedSession = localStorage.getItem('house_count_session');
    const authType = localStorage.getItem('auth_type');
    
    if (savedSession && authType === 'simple') {
      try {
        const sessionData = JSON.parse(savedSession);
        if (sessionData.user && sessionData.user.authenticated) {
          setIsAuthenticated(true);
          setSession(sessionData);
        }
      } catch (error) {
        console.error('Error parsing session:', error);
        // Clear invalid session
        localStorage.removeItem('house_count_session');
        localStorage.removeItem('house_count_enabled');
        localStorage.removeItem('auth_type');
      }
    }
    */
  }, []);

  const enableHouseCounting = () => {
    setIsHouseCountEnabled(true);
    localStorage.setItem('house_count_enabled', 'true');
  };

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
            
            {/* Default route - redirect to Firebase auth */}
            <Route path="/" element={<Navigate to="/firebase-auth" replace />} />
            
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
            
            {/* Catch all route - redirect to Firebase auth */}
            <Route path="*" element={<Navigate to="/firebase-auth" replace />} />
          </Routes>
        </div>
      </ErrorBoundary>
    </Router>
  );
}

export default App