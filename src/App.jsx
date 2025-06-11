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
import HouseCountTest from './components/HouseCountTest';
import ProtectedRoute from './components/ProtectedRoute';
import SimpleProtectedRoute from './components/SimpleProtectedRoute';
import DayDetails from './components/DayDetails';
import NumberGen from './components/NumberGen';
import ABCDBCDNumber from './components/ABCDBCDNumber';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [session, setSession] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isHouseCountEnabled, setIsHouseCountEnabled] = useState(false);

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
            {/* Authentication route */}
            <Route path="/auth" element={<SimpleAuth />} />
            
            {/* Legacy auth route for backward compatibility */}
            <Route path="/legacy-auth" element={<Auth onEnableHouseCounting={enableHouseCounting} />} />
            
            {/* Default route - redirect to auth if not logged in, users if logged in */}
            <Route path="/" element={
              isAuthenticated ? <Navigate to="/users" replace /> : <Navigate to="/auth" replace />
            } />
            
            {/* User List - main landing page after login */}
            <Route path="/users" element={
              isAuthenticated ? <UserList /> : <Navigate to="/auth" replace />
            } />
            
            {/* Dashboard route */}
            <Route path="/dashboard" element={
              isAuthenticated ? <Navigate to="/abcd-number/1" replace /> : <Navigate to="/auth" replace />
            } />
            
            {/* All routes accessible after login - no protection needed */}
            <Route path="/user/:userId" element={
              isAuthenticated ? <UserData /> : <Navigate to="/auth" replace />
            } />
            
            <Route path="/user-data/:userId" element={
              isAuthenticated ? <UserData /> : <Navigate to="/auth" replace />
            } />
            
            <Route path="/day-details/:userId" element={
              isAuthenticated ? (
                <ErrorBoundary>
                  <DayDetails />
                </ErrorBoundary>
              ) : <Navigate to="/auth" replace />
            } />
            
            <Route path="/number-gen" element={
              isAuthenticated ? (
                <ErrorBoundary>
                  <NumberGen />
                </ErrorBoundary>
              ) : <Navigate to="/auth" replace />
            } />
            
            <Route path="/abcd-number/:userId" element={
              isAuthenticated ? (
                <ErrorBoundary>
                  <ABCDBCDNumber />
                </ErrorBoundary>
              ) : <Navigate to="/auth" replace />
            } />
            
            <Route path="/test" element={
              isAuthenticated ? <HouseCountTest /> : <Navigate to="/auth" replace />
            } />

            {/* Catch all route - redirect based on auth status */}
            <Route path="*" element={
              isAuthenticated ? <Navigate to="/users" replace /> : <Navigate to="/auth" replace />
            } />
          </Routes>
        </div>
      </ErrorBoundary>
    </Router>
  );
}

export default App