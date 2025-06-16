import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: '', total_hours: 1, day_count: 1 });

  const fetchUsers = async () => {
    const { data } = await supabase.from('users').select();
    setUsers(data || []);
  };

  useEffect(() => { fetchUsers(); }, []);

  const addUser = async (e) => {
    e.preventDefault();
    await supabase.from('users').insert({
      username: form.username,
      total_hours: form.total_hours,
      day_count: form.day_count
    });
    setForm({ username: '', total_hours: 1, day_count: 1 });
    fetchUsers();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <form onSubmit={addUser} className="space-y-2 mb-6">
        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="border px-2 py-1 rounded w-60"
        />
        <input
          type="number"
          min="1"
          max="10"
          placeholder="Total Hours"
          value={form.total_hours}
          onChange={(e) => setForm({ ...form, total_hours: Number(e.target.value) })}
          className="border px-2 py-1 rounded w-32"
        />
        <input
          type="number"
          placeholder="Day Count"
          value={form.day_count}
          onChange={(e) => setForm({ ...form, day_count: Number(e.target.value) })}
          className="border px-2 py-1 rounded w-32"
        />
        <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded">
          Add User
        </button>
      </form>

      <table className="min-w-full text-left text-sm">
        <thead>
          <tr>
            <th className="px-2 py-1">Username</th>
            <th className="px-2 py-1">Hours</th>
            <th className="px-2 py-1">Days</th>
            <th className="px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="px-2 py-1">{u.username}</td>
              <td className="px-2 py-1">{u.total_hours}</td>
              <td className="px-2 py-1">{u.day_count}</td>
              <td className="px-2 py-1">
                <Link to={`/admin/user/${u.id}`} className="text-blue-600 hover:underline">
                  ABCD
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
