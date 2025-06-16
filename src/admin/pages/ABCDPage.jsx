import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

export default function ABCDPage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [totalHours, setTotalHours] = useState(1);
  const [dates, setDates] = useState([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('users').select().eq('id', id).single();
      setUser(data);
      setTotalHours(data?.total_hours || 1);
      const { data: d } = await supabase.from('day_entries').select().eq('user_id', id);
      setDates(d || []);
    };
    load();
  }, [id]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{user?.username}</h1>
      <div>
        <label className="mr-2">Total Hours:</label>
        <input
          type="number"
          min="1"
          max="10"
          value={totalHours}
          onChange={(e) => setTotalHours(Number(e.target.value))}
          className="border px-2 py-1 rounded w-20"
        />
      </div>
      <div>
        <h2 className="font-semibold">Dates</h2>
        <ul className="list-disc ml-6">
          {dates.map((d) => (
            <li key={d.id} className="flex items-center space-x-2">
              <span>{d.entry_date}</span>
              <Link to={`/admin/user/${id}/index?date=${d.entry_date}`} className="text-blue-600">Index Page</Link>
              <Link to={`/admin/user/${id}/rule1?date=${d.entry_date}`} className="text-blue-600">Rule-1</Link>
              <Link to={`/admin/user/${id}/rule2?date=${d.entry_date}`} className="text-blue-600">Rule-2</Link>
            </li>
          ))}
        </ul>
      </div>
      <Link to="/admin/dashboard" className="text-gray-700 underline">
        Back to dashboard
      </Link>
    </div>
  );
}
