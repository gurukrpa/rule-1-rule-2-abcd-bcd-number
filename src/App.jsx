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
import SimpleUserList from './components/SimpleUserList';
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

function App() {
  const [session, setSession] = useState(null);
  // TEMPORARY: Disable authentication for development
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isHouseCountEnabled, setIsHouseCountEnabled] = useState(true);
  const [appError, setAppError] = useState(null);

  useEffect(() => {
    try {
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
      
      console.log('App initialized successfully');
    } catch (error) {
      console.error('Error initializing app:', error);
      setAppError(error.message);
    }

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
          {appError ? (
            <div className="p-8 text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Application Error</h1>
              <p className="text-gray-700 mb-4">{appError}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Reload Page
              </button>
            </div>
          ) : (
            <Routes>
              {/* TEMPORARY: Authentication routes commented out for development */}
              {/* <Route path="/auth" element={<SimpleAuth />} /> */}
              {/* <Route path="/legacy-auth" element={<Auth onEnableHouseCounting={enableHouseCounting} />} /> */}
              
              {/* Default route - redirect directly to users for development */}
              <Route path="/" element={<UserList />} />
              
              {/* User List - main landing page (no auth required during development) */}
              <Route path="/users" element={<UserList />} />
            
              {/* Dashboard route */}
              <Route path="/dashboard" element={<Navigate to="/abcd-number/1" replace />} />
              
              {/* All routes accessible without authentication during development */}
              <Route path="/user/:userId" element={<UserData />} />
              
              <Route path="/user-data/:userId" element={<UserData />} />
              
              <Route path="/day-details/:userId" element={
                <ErrorBoundary>
                  <DayDetails />
                </ErrorBoundary>
              } />
              
              <Route path="/number-gen" element={
                <ErrorBoundary>
                  <NumberGen />
                </ErrorBoundary>
              } />
              
              <Route path="/abcd-number/:userId" element={
                <ErrorBoundary>
                  <ABCDBCDNumber />
                </ErrorBoundary>
              } />
              
              <Route path="/planets-analysis" element={
                <ErrorBoundary>
                  <PlanetsAnalysisPage />
                </ErrorBoundary>
              } />
              
              <Route path="/planets-analysis/:userId" element={
                <ErrorBoundary>
                  <PlanetsAnalysisPage />
                </ErrorBoundary>
              } />

              {/* Dual-Service Demo */}
              <Route path="/dual-service-demo" element={
                <ErrorBoundary>
                  <DualServiceDemo />
                </ErrorBoundary>
              } />
              
              {/* Catch all route - redirect to users */}
              <Route path="*" element={<Navigate to="/users" replace />} />
            </Routes>
          )}
        </div>
      </ErrorBoundary>
    </Router>
  );
}

export default App