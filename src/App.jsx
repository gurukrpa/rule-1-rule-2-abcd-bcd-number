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
import ProtectedRoute from './components/ProtectedRoute';
import SimpleProtectedRoute from './components/SimpleProtectedRoute';
import DayDetails from './components/DayDetails';
import NumberGen from './components/NumberGen';
import ABCDBCDNumber from './components/ABCDBCDNumber';
import PlanetsAnalysisPage from './components/PlanetsAnalysisPage';
import DualServiceDemo from './components/DualServiceDemo';
import ErrorBoundary from './components/ErrorBoundary';
import EnvironmentBanner from './components/EnvironmentBanner';

function App() {
  const [session, setSession] = useState(null);
  // Authentication enabled - users must login to access the application
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isHouseCountEnabled, setIsHouseCountEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
    
    // Set loading to false after authentication check is complete
    setIsLoading(false);
  }, []);

  const enableHouseCounting = () => {
    setIsHouseCountEnabled(true);
    localStorage.setItem('house_count_enabled', 'true');
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-indigo-600 font-medium">Loading viboothi.in...</p>
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
        <EnvironmentBanner />
        <div className="min-h-screen bg-gray-100">
          <Routes>
            {/* Authentication routes */}
            <Route path="/auth" element={<SimpleAuth />} />
            <Route path="/legacy-auth" element={<Auth onEnableHouseCounting={enableHouseCounting} />} />
            
            {/* Default route - show login page if not authenticated, otherwise to users */}
            <Route path="/" element={
              isAuthenticated ? <Navigate to="/users" replace /> : <SimpleAuth />
            } />
            
            {/* Protected Routes */}
            <Route path="/users" element={
              <SimpleProtectedRoute isAuthenticated={isAuthenticated}>
                <UserList />
              </SimpleProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <SimpleProtectedRoute isAuthenticated={isAuthenticated}>
                <Navigate to="/abcd-number/1" replace />
              </SimpleProtectedRoute>
            } />
            
            <Route path="/user/:userId" element={
              <SimpleProtectedRoute isAuthenticated={isAuthenticated}>
                <UserData />
              </SimpleProtectedRoute>
            } />
            
            <Route path="/user-data/:userId" element={
              <SimpleProtectedRoute isAuthenticated={isAuthenticated}>
                <UserData />
              </SimpleProtectedRoute>
            } />
            
            <Route path="/day-details/:userId" element={
              <SimpleProtectedRoute isAuthenticated={isAuthenticated}>
                <ErrorBoundary>
                  <DayDetails />
                </ErrorBoundary>
              </SimpleProtectedRoute>
            } />
            
            <Route path="/number-gen" element={
              <SimpleProtectedRoute isAuthenticated={isAuthenticated}>
                <ErrorBoundary>
                  <NumberGen />
                </ErrorBoundary>
              </SimpleProtectedRoute>
            } />
            
            <Route path="/abcd-number/:userId" element={
              <SimpleProtectedRoute isAuthenticated={isAuthenticated}>
                <ErrorBoundary>
                  <ABCDBCDNumber />
                </ErrorBoundary>
              </SimpleProtectedRoute>
            } />
            
            <Route path="/planets-analysis" element={
              <SimpleProtectedRoute isAuthenticated={isAuthenticated}>
                <ErrorBoundary>
                  <PlanetsAnalysisPage />
                </ErrorBoundary>
              </SimpleProtectedRoute>
            } />
            
            <Route path="/planets-analysis/:userId" element={
              <SimpleProtectedRoute isAuthenticated={isAuthenticated}>
                <ErrorBoundary>
                  <PlanetsAnalysisPage />
                </ErrorBoundary>
              </SimpleProtectedRoute>
            } />

            {/* Dual-Service Demo */}
            <Route path="/dual-service-demo" element={
              <SimpleProtectedRoute isAuthenticated={isAuthenticated}>
                <ErrorBoundary>
                  <DualServiceDemo />
                </ErrorBoundary>
              </SimpleProtectedRoute>
            } />
            
            {/* Catch all route - redirect to auth */}
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </div>
      </ErrorBoundary>
    </Router>
  );
}

export default App