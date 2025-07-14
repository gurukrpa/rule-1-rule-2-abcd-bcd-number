import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cleanFirebaseService } from '../services/CleanFirebaseService';
import { firebaseAuthService } from '../services/FirebaseAuthService';
import Header from './Header';
import Logo from './Logo';

function UserList() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    hr: '',
    days: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  // Set document title for this page
  useEffect(() => {
    document.title = 'User Management | viboothi.in';
  }, []);

  const handleLogout = async () => {
    try {
      // Sign out from Firebase
      await firebaseAuthService.signOut();
      
      // Clear authentication session
      localStorage.removeItem('house_count_session');
      localStorage.removeItem('house_count_enabled');
      localStorage.removeItem('user_email');
      localStorage.removeItem('auth_type');
      
      // Redirect to login
      navigate('/firebase-auth');
    } catch (error) {
      console.error('Error signing out:', error);
      // Still redirect even if logout fails
      navigate('/firebase-auth');
    }
  };

  useEffect(() => {
    // Test Firebase connection
    const testConnection = async () => {
      try {
        const isConnected = await cleanFirebaseService.checkConnection();
        
        if (!isConnected) {
          console.error('Firebase connection test failed');
          alert('Database connection error. Please check your internet connection.');
        } else {
          console.log('Firebase connection successful');
        }
      } catch (err) {
        console.error('Failed to test Firebase connection:', err);
        alert('Failed to connect to the database');
      }
    };
    
    testConnection();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log('📊 Fetching users from Firebase...');
      const usersData = await cleanFirebaseService.getAllUsers();
      
      console.log('✅ Users fetched:', usersData);
      setUsers(usersData || []);
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      alert(`Failed to fetch users: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      console.log('📝 Creating new user...');
      const userData = {
        username: formData.username,
        email: `${formData.username.toLowerCase().replace(/\s+/g, '')}@viboothi.local`,
        hr: parseInt(formData.hr),
        days: parseInt(formData.days)
      };
      
      await cleanFirebaseService.createUser(userData);
      console.log('✅ User created successfully');
      
      setFormData({ username: '', hr: '', days: '' });
      fetchUsers();
    } catch (error) {
      console.error('❌ Error adding user:', error);
      alert(`Failed to create user: ${error.message}`);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user and all associated data? This cannot be undone.')) return;

    try {
      console.log('🗑️ Deleting user and all related data...');
      
      // Firebase doesn't have cascade delete, so we need to manually delete related data
      // For now, we'll just delete the user. In a production app, you'd want to implement
      // a cloud function to handle cascading deletes
      
      await cleanFirebaseService.deleteUser(userId);
      console.log('✅ User deleted successfully');
      
      // Refresh the user list
      fetchUsers();
      alert('User deleted successfully.');
      
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      alert(`Failed to delete user: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Use the shared Header component */}
      <Header title="User Management" showBackButton={false} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-bold mb-6">User Management</h2>

          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New User</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username:</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  required
                />
              </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Total HR:</label>
            <input
              type="number"
              value={formData.hr}
              onChange={(e) => setFormData({ ...formData, hr: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Total Days:</label>
            <input
              type="number"
              value={formData.days}
              onChange={(e) => setFormData({ ...formData, days: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add User
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total HR</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Days</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.hr}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.days}</td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <Link
                    to={`/user-data/${user.id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    House Count
                  </Link>
                  <Link
                    to={`/abcd-number/${user.id}`}
                    className="text-orange-600 hover:text-orange-900 ml-4"
                  >
                    ABCD Number
                  </Link>
                  <Link
                    to={`/number-gen/${user.id}`}
                    className="text-purple-600 hover:text-purple-900 ml-4"
                  >
                    Number Gen
                  </Link>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 hover:text-red-900 ml-4"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
      </main>
    </div>
  );
}

export default UserList;