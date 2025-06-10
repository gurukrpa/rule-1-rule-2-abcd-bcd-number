import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Auth({ onEnableHouseCounting }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [hr, setHr] = useState('');
  const [days, setDays] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('users')
        .select('*')
        .order('username');
      
      if (supabaseError) throw supabaseError;
      setUsers(data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message || 'Failed to fetch users');
      setUsers([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      setLoading(true);

      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{ 
          username: username.trim(),
          hr: parseInt(hr),
          days: parseInt(days)
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      setUsers([...users, newUser]);
      if (onEnableHouseCounting) {
        onEnableHouseCounting();
      }

      setUsername('');
      setHr('');
      setDays('');
      setSuccess('User added successfully!');
      setTimeout(() => setSuccess(null), 3000);

    } catch (error) {
      console.error('Error creating user:', error);
      setError('Error creating user: ' + (error.message || 'Unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? All associated data will be lost.')) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      setLoading(true);

      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (deleteError) throw deleteError;

      setUsers(users.filter(user => user.id !== userId));
      setSuccess('User deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);

    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Error deleting user: ' + (error.message || 'Unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome to House Count App
          </h1>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                onEnableHouseCounting();
                navigate('/test');
              }}
              className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
            >
              House Count Test
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md">
            {success}
          </div>
        )}

        <div className="space-y-6">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4">Add New User</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Enter username"
                  required
                />
              </div>

              <div>
                <label htmlFor="hr" className="block text-sm font-medium text-gray-700">
                  HR (1-10)
                </label>
                <input
                  id="hr"
                  type="number"
                  min="1"
                  max="10"
                  value={hr}
                  onChange={(e) => setHr(e.target.value)}
                  className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Enter HR (1-10)"
                  required
                />
              </div>

              <div>
                <label htmlFor="days" className="block text-sm font-medium text-gray-700">
                  Days (minimum 5)
                </label>
                <input
                  id="days"
                  type="number"
                  min="5"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className="mt-1 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Enter days (min 5)"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {loading ? 'Adding...' : 'Add User'}
              </button>
            </form>
          </div>

          <div className="rounded-lg bg-white shadow-md">
            <div className="p-6">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">Registered Users</h2>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between border-b border-gray-200 pb-4 last:border-b-0">
                    <div>
                      <span className="font-medium text-gray-900">{user.username}</span>
                      <span className="ml-4 text-sm text-gray-500">
                        HR: {user.hr} | Days: {user.days}
                      </span>
                    </div>
                    <div className="flex space-x-4">
                      <Link
                        to={`/user/${user.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={onEnableHouseCounting}
                      >
                        House Count
                      </Link>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {users.length === 0 && (
                  <p className="text-gray-500">No users registered yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}