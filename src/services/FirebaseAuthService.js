import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { auth, db } from '../firebaseConfig.js';
import { doc, setDoc, getDoc } from 'firebase/firestore';

/**
 * Firebase Authentication Service
 * Replaces localStorage-based SimpleAuth with Firebase Authentication
 */
class FirebaseAuthService {
  constructor() {
    this.auth = auth;
    this.currentUser = null;
    this.authListeners = [];
    
    // Listen for authentication state changes
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
      this.authListeners.forEach(callback => callback(user));
    });
    
    console.log('🔐 FirebaseAuthService initialized');
  }

  /**
   * Sign in with email and password
   */
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      
      console.log('✅ User signed in:', user.email);
      return {
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          authenticated: true,
          loginTime: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('❌ Sign in error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  /**
   * Create account and sign in
   */
  async signUp(email, password, displayName = null) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      
      // Update display name if provided
      if (displayName) {
        await updateProfile(user, { displayName });
      }
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: displayName || user.email.split('@')[0],
        createdAt: new Date().toISOString(),
        hr_count: 1 // Default HR count
      });
      
      console.log('✅ User account created:', user.email);
      return {
        user: {
          uid: user.uid,
          email: user.email,
          displayName: displayName || user.displayName,
          authenticated: true,
          loginTime: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('❌ Sign up error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  /**
   * Sign out current user
   */
  async signOut() {
    try {
      await signOut(this.auth);
      console.log('✅ User signed out');
      return true;
    } catch (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
  }

  /**
   * Get current user session
   */
  getCurrentUser() {
    return this.currentUser ? {
      user: {
        uid: this.currentUser.uid,
        email: this.currentUser.email,
        displayName: this.currentUser.displayName,
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
   * Get user data from Firestore
   */
  async getUserData(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting user data:', error);
      throw error;
    }
  }

  /**
   * Convert Firebase auth error codes to user-friendly messages
   */
  getAuthErrorMessage(errorCode) {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      default:
        return 'Authentication failed. Please try again.';
    }
  }

  /**
   * Backward compatibility: Simple authentication check
   * For compatibility with existing SimpleAuth usage
   */
  async authenticateUser(username, password) {
    // Convert username to email format if needed
    const email = username.includes('@') ? username : `${username}@viboothi.local`;
    
    try {
      return await this.signIn(email, password);
    } catch (error) {
      // For backward compatibility with hardcoded credentials
      if (username === 'gurukrpasharma' && password === 'Srimatha1@') {
        // Create default admin account if it doesn't exist
        try {
          return await this.signUp('admin@viboothi.local', password, 'Admin User');
        } catch (createError) {
          // If account exists, try to sign in
          return await this.signIn('admin@viboothi.local', password);
        }
      }
      throw error;
    }
  }
}

// Export singleton instance
export const firebaseAuthService = new FirebaseAuthService();
export default firebaseAuthService;
