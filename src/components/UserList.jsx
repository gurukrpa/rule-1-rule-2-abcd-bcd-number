import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

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

  const handleLogout = () => {
    // Clear authentication session
    localStorage.removeItem('house_count_session');
    localStorage.removeItem('house_count_enabled');
    localStorage.removeItem('user_email');
    localStorage.removeItem('auth_type');
    
    // Redirect to login
    navigate('/auth');
  };

  useEffect(() => {
    // Test Supabase connection
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.from('users').select('count');
        
        if (error) {
          console.error('Supabase connection test failed:', error);
          alert(`Database connection error: ${error.message}`);
        } else {
          console.log('Supabase connection successful');
        }
      } catch (err) {
        console.error('Failed to test Supabase connection:', err);
        alert('Failed to connect to the database');
      }
    };
    
    testConnection();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');
      
      if (error) {
        console.error('Error fetching users:', error);
        alert(`Could not fetch users: ${error.message}`);
        return;
      }
      
      setUsers(data || []);
    } catch (error) {
      console.error('Unexpected error in fetchUsers:', error);
      alert('Failed to load user list. See console for details.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { data, error } = await supabase
      .from('users')
      .insert([{
        username: formData.username,
        hr: parseInt(formData.hr),
        days: parseInt(formData.days)
      }])
      .select();

    if (error) {
      console.error('Error adding user:', error);
      return;
    }

    setFormData({ username: '', hr: '', days: '' });
    fetchUsers();
  };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user and all associated data? This cannot be undone.')) return;

    try {
      // 1. Delete related records from 'house' table first (if it exists and has user_id)
      //    Assuming 'house' table has a 'user_id' column. Adjust if schema is different.
      const { error: houseDeleteError } = await supabase
        .from('house') // Replace 'house' with your actual table name if different
        .delete()
        .eq('user_id', userId);

      if (houseDeleteError) {
        console.error('Error deleting related house data:', houseDeleteError);
        // Optionally, show a more specific error to the user
        alert(`Failed to delete related house data: ${houseDeleteError.message}`);
        return; // Stop if we can't delete related data
      }

      // 2. Delete related records from 'hr_data' table
      const { error: hrDataDeleteError } = await supabase
        .from('hr_data')
        .delete()
        .eq('user_id', userId);

      if (hrDataDeleteError) {
        console.error('Error deleting related hr_data:', hrDataDeleteError);
        // Optionally, show a more specific error to the user
        alert(`Failed to delete related HR data: ${hrDataDeleteError.message}`);
        return; // Stop if we can't delete related data
      }

      // 3. Now delete the user from the 'users' table
      const { error: userDeleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (userDeleteError) {
        // This is the original error location (approx line 62)
        console.error('Error deleting user:', userDeleteError);
        alert(`Failed to delete user: ${userDeleteError.message}`);
        return;
      }

      // 4. Refresh the user list if everything was successful
      fetchUsers();
      alert('User and all associated data deleted successfully.'); // Optional success message

    } catch (error) {
      // Catch any unexpected errors during the process
      console.error('An unexpected error occurred during deletion:', error);
      alert('An unexpected error occurred. Please check the console.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Navigation */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold text-gray-900">viboothi.in</h1>
              <nav className="flex space-x-6">
                <Link to="/users" className="text-indigo-600 hover:text-indigo-900 font-medium">
                  Users
                </Link>
                <Link to="/planets-analysis" className="text-teal-600 hover:text-teal-900">
                  Planets Analysis
                </Link>
                <Link to="/number-gen" className="text-gray-700 hover:text-gray-900">
                  Number Generator
                </Link>
                <Link to="/test" className="text-gray-700 hover:text-gray-900">
                  Test
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome, gurukrpasharma</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

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
                    to={`/planets-analysis/${user.id}`}
                    className="text-teal-600 hover:text-teal-900 ml-4"
                  >
                    Planets Analysis
                  </Link>
                  <Link
                    to="/number-gen"
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