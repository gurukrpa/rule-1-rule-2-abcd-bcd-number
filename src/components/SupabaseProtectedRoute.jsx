import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabaseAuthService } from '../services/SupabaseAuthService';

export default function SupabaseProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Set up auth state listener
    const unsubscribe = supabaseAuthService.onAuthStateChange((user) => {
      setUser(user);
      setIsAuthenticated(!!user);
      setIsLoading(false);
    });

    // Check current authentication state
    const currentUser = supabaseAuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setIsAuthenticated(true);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-teal-700 font-medium">Loading...</p>
          <p className="text-sm text-teal-600 mt-2">Checking Supabase authentication</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/supabase-auth" replace />;
  }

  return children;
}
