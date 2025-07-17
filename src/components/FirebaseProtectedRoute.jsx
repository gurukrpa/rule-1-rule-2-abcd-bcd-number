import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { firebaseAuthService } from '../services/FirebaseAuthService';

export default function FirebaseProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Set up auth state listener
    const unsubscribe = firebaseAuthService.onAuthStateChange((user) => {
      setUser(user);
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-orange-700 font-medium">Loading...</p>
          <p className="text-sm text-orange-600 mt-2">Checking Firebase authentication</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/firebase-auth" replace />;
  }

  return children;
}
