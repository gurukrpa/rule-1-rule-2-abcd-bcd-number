// 
// TEMPORARY DEVELOPMENT MODE: Authentication is disabled
// All routes are accessible without login for development purposes
// To re-enable authentication, search for "TEMPORARY" comments and restore original logic
//
import { useEffect, useState } from 'react';
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes
} from 'react-router-dom';
import ABCDBCDNumber from './components/ABCDBCDNumber';
import Auth from './components/Auth';
import DayDetails from './components/DayDetails';
import DualServiceDemo from './components/DualServiceDemo';
import ErrorBoundary from './components/ErrorBoundary';
import NumberGen from './components/NumberGen';
import PlanetsAnalysisPage from './components/PlanetsAnalysisPage';
import Rule1OptimizedPage from './components/Rule1OptimizedPage';
import Rule1PerformanceDemo from './components/Rule1PerformanceDemo';
import SimpleAuth from './components/SimpleAuth';
import UserData from './components/UserData';
import UserList from './components/UserList';
import { VedicSandboxPage } from './sandbox-vedic/VedicSandboxPage';

function App() {
  const [session, setSession] = useState(null);
  
  // Check if we're in production (Firebase) or development (localhost)
  const isProduction = window.location.hostname.includes('web.app') || 
                      window.location.hostname.includes('firebaseapp.com') ||
                      window.location.hostname === 'viboothi.in';
  
  // Disable authentication for development, enable for Firebase/production
  const [isAuthenticated, setIsAuthenticated] = useState(!isProduction);
  const [isHouseCountEnabled, setIsHouseCountEnabled] = useState(!isProduction);

  useEffect(() => {
    if (!isProduction) {
      // DEVELOPMENT: Auto-enable house counting and authentication
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
    } else {
      // PRODUCTION: Use real authentication
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
    }
  }, [isProduction, setIsAuthenticated, setIsHouseCountEnabled]);

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
            {/* Conditional routing based on environment */}
            {!isProduction ? (
              // DEVELOPMENT ROUTES - No authentication required
              <>
                <Route path="/" element={<Navigate to="/users" replace />} />
                <Route path="/auth" element={<Navigate to="/users" replace />} />
              </>
            ) : (
              // PRODUCTION ROUTES - Authentication required
              <>
                <Route path="/auth" element={<SimpleAuth />} />
                <Route path="/legacy-auth" element={<Auth onEnableHouseCounting={enableHouseCounting} />} />
                <Route path="/" element={
                  isAuthenticated ? <Navigate to="/users" replace /> : <Navigate to="/auth" replace />
                } />
              </>
            )}
            
            {/* User List - main landing page */}
            <Route path="/users" element={
              isProduction && !isAuthenticated ? 
                <Navigate to="/auth" replace /> : 
                <UserList />
            } />
            
            {/* Dashboard route */}
            <Route path="/dashboard" element={<Navigate to="/abcd-number/1" replace />} />
            
            {/* Protected routes - conditional protection based on environment */}
            <Route path="/user/:userId" element={
              isProduction && !isAuthenticated ? 
                <Navigate to="/auth" replace /> : 
                <UserData />
            } />
            
            <Route path="/user-data/:userId" element={
              isProduction && !isAuthenticated ? 
                <Navigate to="/auth" replace /> : 
                <UserData />
            } />
            
            <Route path="/day-details/:userId" element={
              isProduction && !isAuthenticated ? 
                <Navigate to="/auth" replace /> : 
                <ErrorBoundary>
                  <DayDetails />
                </ErrorBoundary>
            } />
            
            <Route path="/number-gen" element={
              isProduction && !isAuthenticated ? 
                <Navigate to="/auth" replace /> : 
                <ErrorBoundary>
                  <NumberGen />
                </ErrorBoundary>
            } />
            
            <Route path="/abcd-number/:userId" element={
              isProduction && !isAuthenticated ? 
                <Navigate to="/auth" replace /> : 
                <ErrorBoundary>
                  <ABCDBCDNumber />
                </ErrorBoundary>
            } />
            
            <Route path="/planets-analysis" element={
              isProduction && !isAuthenticated ? 
                <Navigate to="/auth" replace /> : 
                <ErrorBoundary>
                  <PlanetsAnalysisPage />
                </ErrorBoundary>
            } />
            
            <Route path="/planets-analysis/:userId" element={
              isProduction && !isAuthenticated ? 
                <Navigate to="/auth" replace /> : 
                <ErrorBoundary>
                  <PlanetsAnalysisPage />
                </ErrorBoundary>
            } />

            {/* Optimized Rule1 Page */}
            <Route path="/rule1-optimized/:userId" element={
              isProduction && !isAuthenticated ? 
                <Navigate to="/auth" replace /> : 
                <ErrorBoundary>
                  <Rule1OptimizedPage />
                </ErrorBoundary>
            } />

            {/* Performance Demo */}
            <Route path="/performance-demo" element={
              isProduction && !isAuthenticated ? 
                <Navigate to="/auth" replace /> : 
                <ErrorBoundary>
                  <Rule1PerformanceDemo />
                </ErrorBoundary>
            } />

            {/* Dual-Service Demo */}
            <Route path="/dual-service-demo" element={
              isProduction && !isAuthenticated ? 
                <Navigate to="/auth" replace /> : 
                <ErrorBoundary>
                  <DualServiceDemo />
                </ErrorBoundary>
            } />

            {/* Vedic Computation Sandbox */}
            <Route path="/sandbox-vedic" element={
              isProduction && !isAuthenticated ? 
                <Navigate to="/auth" replace /> : 
                <ErrorBoundary>
                  <VedicSandboxPage />
                </ErrorBoundary>
            } />
            
            {/* Catch all route */}
            <Route path="*" element={
              isProduction && !isAuthenticated ? 
                <Navigate to="/auth" replace /> : 
                <Navigate to="/users" replace />
            } />
          </Routes>
        </div>
      </ErrorBoundary>
    </Router>
  );
}

export default App