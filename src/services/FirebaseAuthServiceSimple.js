/**
 * Firebase Authentication Service - Simple Version
 * Placeholder for production Firebase integration
 */

class FirebaseAuthService {
  constructor() {
    console.log('🔥 Firebase Auth Service initialized');
  }

  async signIn(email, password) {
    throw new Error('Firebase not configured');
  }

  async signUp(email, password) {
    throw new Error('Firebase not configured');
  }

  async signOut() {
    return true;
  }

  getCurrentUser() {
    return null;
  }

  isAuthenticated() {
    return false;
  }

  onAuthStateChange(callback) {
    return () => {};
  }

  async authenticateUser(username, password) {
    throw new Error('Firebase not configured');
  }

  getAuthErrorMessage(errorMessage) {
    return errorMessage || 'Firebase error';
  }
}

export const firebaseAuthService = new FirebaseAuthService();
export default firebaseAuthService;
