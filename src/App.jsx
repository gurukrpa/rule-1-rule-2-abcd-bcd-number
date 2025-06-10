import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route,
  Navigate
} from 'react-router-dom';
import { supabase } from './supabaseClient';
import UserData from './components/UserData';
import Auth from './components/Auth';
import HouseCountTest from './components/HouseCountTest';
import ProtectedRoute from './components/ProtectedRoute';
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

    // Check if there's a valid session in localStorage
    const savedSession = localStorage.getItem('house_count_session');
    if (savedSession) {
      setIsAuthenticated(true);
      setSession(JSON.parse(savedSession));
    }

    // Get initial session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthenticated(!!session);
      if (session) {
        localStorage.setItem('house_count_session', JSON.stringify(session));
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsAuthenticated(!!session);
      if (session) {
        localStorage.setItem('house_count_session', JSON.stringify(session));
      } else {
        localStorage.removeItem('house_count_session');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Function to enable house counting
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
            {/* Public route - Login/Welcome page */}
            <Route path="/" element={<Auth onEnableHouseCounting={enableHouseCounting} />} />
            
            {/* Protected routes */}
            <Route path="/user/:userId" element={
              <ProtectedRoute isAuthenticated={isHouseCountEnabled}>
                <UserData />
              </ProtectedRoute>
            } />
            
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
            
            <Route path="/test" element={
              <ProtectedRoute isAuthenticated={isHouseCountEnabled}>
                <HouseCountTest />
              </ProtectedRoute>
            } />

            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </ErrorBoundary>
    </Router>
  );
}

export default App