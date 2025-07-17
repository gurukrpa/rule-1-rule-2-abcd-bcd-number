/**
 * Firebase Authentication Service
 * Handles user authentication using Firebase Auth
 */
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebaseClient.js';

class FirebaseAuthService {
  constructor() {
    this.user = null;
    this.initialized = false;
    this.authStateListeners = [];
    
    // Initialize auth state listener
    this.initAuthStateListener();
  }

  /**
   * Initialize authentication state listener
   */
  initAuthStateListener() {
    if (!auth) {
      console.warn('⚠️ Firebase Auth not available');
      return;
    }

    onAuthStateChanged(auth, (user) => {
      this.user = user;
      this.initialized = true;
      
      // Notify all listeners
      this.authStateListeners.forEach(listener => {
        try {
          listener(user);
        } catch (error) {
          console.error('Error in auth state listener:', error);
        }
      });
      
      if (user) {
        console.log('🔥 Firebase user signed in:', user.email);
      } else {
        console.log('🔥 Firebase user signed out');
      }
    });
  }

  /**
   * Sign in with email and password
   */
  async signIn(email, password) {
    try {
      if (!auth) {
        throw new Error('Firebase Auth not initialized');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      return {
        user: {
          id: user.uid,
          email: user.email,
          displayName: user.displayName,
          authenticated: true
        }
      };
    } catch (error) {
      console.error('❌ Firebase sign in error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  /**
   * Sign up with email and password
   */
  async signUp(email, password, displayName) {
    try {
      if (!auth) {
        throw new Error('Firebase Auth not initialized');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with display name
      if (displayName) {
        await updateProfile(user, { displayName });
      }
      
      return {
        user: {
          id: user.uid,
          email: user.email,
          displayName: displayName || user.displayName,
          authenticated: true
        }
      };
    } catch (error) {
      console.error('❌ Firebase sign up error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  /**
   * Sign out current user
   */
  async signOut() {
    try {
      if (!auth) {
        throw new Error('Firebase Auth not initialized');
      }

      await signOut(auth);
      this.user = null;
      
      console.log('🔥 Firebase user signed out successfully');
    } catch (error) {
      console.error('❌ Firebase sign out error:', error);
      throw new Error('Failed to sign out');
    }
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    if (!this.initialized) {
      return null;
    }
    
    return this.user ? {
      id: this.user.uid,
      email: this.user.email,
      displayName: this.user.displayName,
      authenticated: true
    } : null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return this.user !== null;
  }

  /**
   * Add auth state change listener
   */
  onAuthStateChange(callback) {
    this.authStateListeners.push(callback);
    
    // If already initialized, call immediately
    if (this.initialized) {
      callback(this.user);
    }
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  /**
   * Get user-friendly error message
   */
  getAuthErrorMessage(errorCode) {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No user found with this email address';
      case 'auth/wrong-password':
        return 'Invalid password';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/too-many-requests':
        return 'Too many failed login attempts. Please try again later';
      default:
        return 'Authentication failed. Please try again';
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates) {
    try {
      if (!this.user) {
        throw new Error('No user signed in');
      }

      await updateProfile(this.user, updates);
      console.log('🔥 Firebase profile updated successfully');
      return true;
    } catch (error) {
      console.error('❌ Firebase profile update error:', error);
      throw new Error('Failed to update profile');
    }
  }
}

// Export singleton instance
export const firebaseAuthService = new FirebaseAuthService();
export default firebaseAuthService;
