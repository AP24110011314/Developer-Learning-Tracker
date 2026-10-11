import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, ResponsiveContainer } from 'recharts';
import api from '../api.js';
import Navbar from '../components/Navbar.jsx';
import Heatmap from '../components/Heatmap.jsx';

const COLORS = { easy: '#22c55e', medium: '#eab308', hard: '#ef4444' };

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [topics, setTopics] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [heatmap, setHeatmap] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [o, d, t, w, h] = await Promise.all([
          api.get('/stats/overview'),
          api.get('/stats/difficulty'),
          api.get('/stats/topics'),
          api.get('/stats/weekly'),
          api.get('/stats/heatmap'),
        ]);
        setOverview(o.data);
        setDifficulty(d.data);
        setTopics(t.data);
        setWeekly(w.data.weeks);
        setHeatmap(h.data.counts);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load stats');
      }
    })();
  }, []);

  const donut = difficulty
    ? [
        { name: 'Easy', value: difficulty.easy },
        { name: 'Medium', value: difficulty.medium },
        { name: 'Hard', value: difficulty.hard },
      ].filter((s) => s.value > 0)
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Link to="/problems" className="bg-black text-white px-4 py-2 rounded text-sm">Problems</Link>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}

        {overview && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              ['Total solved', overview.totalSolved],
              ['Current streak', `${overview.currentStreak} day${overview.currentStreak === 1 ? '' : 's'}`],
              ['Longest streak', `${overview.longestStreak} day${overview.longestStreak === 1 ? '' : 's'}`],
              ['This week', overview.thisWeek],
            ].map(([label, value]) => (
              <div key={label} className="bg-white p-4 rounded shadow">
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-sm text-gray-500">{label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-bold mb-2">By difficulty</h2>
            {donut.length === 0 ? (
              <p className="text-sm text-gray-500">No solved problems yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={donut} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} label>
                    {donut.map((s) => (
                      <Cell key={s.name} fill={COLORS[s.name.toLowerCase()]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-bold mb-2">Top topics</h2>
            {topics.length === 0 ? (
              <p className="text-sm text-gray-500">No topic data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topics.slice(0, 8)} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="topic" width={90} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#111827" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold mb-2">Solved per week</h2>
          {weekly.length === 0 ? (
            <p className="text-sm text-gray-500">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="weekStart" tick={{ fontSize: 10 }} interval={Math.ceil(weekly.length / 6) - 1} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#111827" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold mb-2">Activity</h2>
          <Heatmap counts={heatmap} />
        </div>
      </div>
    </div>
  );
}
