import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { firebaseAuthService } from '../services/FirebaseAuthService.js';

export default function FirebaseProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication state
    const unsubscribe = firebaseAuthService.onAuthStateChange((user) => {
      setIsAuthenticated(!!user);
      setLoading(false);
    });

    // Initial check
    const currentUser = firebaseAuthService.getCurrentUser();
    if (currentUser) {
      setIsAuthenticated(true);
      setLoading(false);
    } else {
      setLoading(false);
    }

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/firebase-auth" replace />;
  }

  return children;
}
