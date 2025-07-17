/**
 * Supabase Authentication Service
 * Replaces Firebase Authentication with Supabase Auth
 */

import { supabase } from '../supabaseClient.js';

class SupabaseAuthService {
  constructor() {
    this.currentUser = null;
    this.authListeners = [];
    
    // Listen for authentication state changes
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Supabase auth state change:', event);
      this.currentUser = session?.user || null;
      this.authListeners.forEach(callback => callback(this.currentUser));
    });
    
    console.log('🟢 SupabaseAuthService initialized');
  }

  /**
   * Sign in with email and password
   */
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      const user = data.user;
      console.log('✅ User signed in with Supabase:', user.email);
      
      return {
        user: {
          uid: user.id,
          email: user.email,
          displayName: user.user_metadata?.display_name || user.email.split('@')[0],
          authenticated: true,
          loginTime: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('❌ Supabase sign in error:', error);
      throw new Error(this.getAuthErrorMessage(error.message));
    }
  }

  /**
   * Create account and sign in
   */
  async signUp(email, password, displayName = null) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || email.split('@')[0]
          }
        }
      });

      if (error) throw error;

      const user = data.user;
      console.log('✅ User account created with Supabase:', user.email);
      
      return {
        user: {
          uid: user.id,
          email: user.email,
          displayName: displayName || user.user_metadata?.display_name,
          authenticated: true,
          loginTime: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('❌ Supabase sign up error:', error);
      throw new Error(this.getAuthErrorMessage(error.message));
    }
  }

  /**
   * Sign out current user
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      this.currentUser = null;
      console.log('✅ User signed out from Supabase');
      return true;
    } catch (error) {
      console.error('❌ Supabase sign out error:', error);
      throw error;
    }
  }

  /**
   * Get current user session
   */
  getCurrentUser() {
    if (!this.currentUser) {
      // Try to get current session
      const session = supabase.auth.getSession();
      if (session?.data?.session?.user) {
        this.currentUser = session.data.session.user;
      }
    }

    return this.currentUser ? {
      user: {
        uid: this.currentUser.id,
        email: this.currentUser.email,
        displayName: this.currentUser.user_metadata?.display_name || this.currentUser.email.split('@')[0],
        authenticated: true
      }
    } : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return this.currentUser !== null;
  }

  /**
   * Listen for authentication state changes
   */
  onAuthStateChange(callback) {
    this.authListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.authListeners = this.authListeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Get user data from Supabase
   */
  async getUserData(uid) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', uid)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found is okay
        throw error;
      }
      
      return data || null;
    } catch (error) {
      console.error('❌ Error getting user data from Supabase:', error);
      throw error;
    }
  }

  /**
   * Convert Supabase auth error messages to user-friendly messages
   */
  getAuthErrorMessage(errorMessage) {
    if (errorMessage.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please check your credentials.';
    }
    if (errorMessage.includes('User already registered')) {
      return 'An account with this email already exists.';
    }
    if (errorMessage.includes('Password should be at least')) {
      return 'Password should be at least 6 characters.';
    }
    if (errorMessage.includes('Unable to validate email address')) {
      return 'Invalid email address format.';
    }
    if (errorMessage.includes('Email rate limit exceeded')) {
      return 'Too many attempts. Please try again later.';
    }
    if (errorMessage.includes('Network request failed')) {
      return 'Network error. Please check your connection.';
    }
    
    // Default fallback
    return errorMessage || 'Authentication failed. Please try again.';
  }

  /**
   * Backward compatibility: Simple authentication check
   * For compatibility with existing SimpleAuth usage
   */
  async authenticateUser(username, password) {
    // Convert username to email format if needed - use valid domain
    const email = username.includes('@') ? username : `${username}@viboothi.in`;
    
    try {
      return await this.signIn(email, password);
    } catch (error) {
      // For backward compatibility with hardcoded credentials
      if (username === 'gurukrpasharma' && password === 'Srimatha1@') {
        // Create default admin account if it doesn't exist
        try {
          return await this.signUp('admin@viboothi.in', password, 'Admin User');
        } catch (createError) {
          // If account exists, try to sign in
          return await this.signIn('admin@viboothi.in', password);
        }
      }
      throw error;
    }
  }

  /**
   * Reset password (Supabase feature)
   */
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
      
      console.log('✅ Password reset email sent');
      return true;
    } catch (error) {
      console.error('❌ Password reset error:', error);
      throw new Error(this.getAuthErrorMessage(error.message));
    }
  }

  /**
   * Update password
   */
  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      
      console.log('✅ Password updated successfully');
      return true;
    } catch (error) {
      console.error('❌ Password update error:', error);
      throw new Error(this.getAuthErrorMessage(error.message));
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates) {
    try {
      const { error } = await supabase.auth.updateUser({
        data: updates
      });

      if (error) throw error;
      
      console.log('✅ Profile updated successfully');
      return true;
    } catch (error) {
      console.error('❌ Profile update error:', error);
      throw new Error(this.getAuthErrorMessage(error.message));
    }
  }
}

// Export singleton instance
export const supabaseAuthService = new SupabaseAuthService();
export default supabaseAuthService;
