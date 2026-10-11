import { useEffect, useState } from 'react';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';

export default function Settings() {
  const { user, refreshMe } = useAuth();
  const [form, setForm] = useState({ bio: '', timezone: '', leetcode: '', codeforces: '', profilePublic: false, showHeatmap: true, showProjects: true });
  const [stats, setStats] = useState([]);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [syncing, setSyncing] = useState(null);

  useEffect(() => {
    if (user) {
      setForm({
        bio: user.bio || '',
        timezone: user.timezone || 'Asia/Kolkata',
        leetcode: user.handles?.leetcode || '',
        codeforces: user.handles?.codeforces || '',
        profilePublic: !!user.privacy?.profilePublic,
        showHeatmap: user.privacy?.showHeatmap !== false,
        showProjects: user.privacy?.showProjects !== false,
      });
    }
    api.get('/sync/status').then(({ data }) => setStats(data)).catch(() => {});
  }, [user]);

  const save = async (e) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    try {
      await api.patch('/auth/me', {
        bio: form.bio,
        timezone: form.timezone,
        handles: { leetcode: form.leetcode.trim(), codeforces: form.codeforces.trim() },
        privacy: { profilePublic: form.profilePublic, showHeatmap: form.showHeatmap, showProjects: form.showProjects },
      });
      await refreshMe();
      setMsg('Profile saved.');
    } catch (e2) {
      setErr(e2.response?.data?.message || 'Save failed');
    }
  };

  const syncNow = async (platform) => {
    setSyncing(platform);
    setMsg('');
    setErr('');
    try {
      const { data } = await api.post(`/sync/${platform}`);
      setMsg(`${platform}: imported ${data.imported} solved, ${data.newProblems} new.`);
      const { data: s } = await api.get('/sync/status');
      setStats(s);
    } catch (e) {
      if (e.response?.status === 429) setErr(e.response.data.message);
      else setErr(e.response?.data?.message || `${platform} sync failed`);
    } finally {
      setSyncing(null);
    }
  };

  const statFor = (platform) => stats.find((s) => s.platform === platform);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-bold">Settings</h1>
        {msg && <p className="text-green-700 text-sm">{msg}</p>}
        {err && <p className="text-red-600 text-sm">{err}</p>}

        <form onSubmit={save} className="bg-white p-4 rounded shadow space-y-3">
          <h2 className="font-bold">Profile & handles</h2>
          <div className="text-sm text-gray-500">{user?.username} · {user?.email}</div>
          <textarea placeholder="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="w-full border p-2 rounded" rows={2} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input placeholder="Timezone (e.g. Asia/Kolkata)" value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} className="border p-2 rounded" />
            <input placeholder="LeetCode handle or profile URL" value={form.leetcode} onChange={(e) => setForm({ ...form, leetcode: e.target.value })} className="border p-2 rounded" />
            <input placeholder="Codeforces handle or profile URL" value={form.codeforces} onChange={(e) => setForm({ ...form, codeforces: e.target.value })} className="border p-2 rounded" />
          </div>
          <button className="bg-black text-white px-4 py-2 rounded" type="submit">Save</button>
        </form>

        <div className="bg-white p-4 rounded shadow space-y-3">
          <h2 className="font-bold">Platform sync</h2>
          <p className="text-sm text-gray-500">Save your handles above first, then sync. Manual logging always works, even if a sync fails.</p>
          {['leetcode', 'codeforces'].map((p) => {
            const s = statFor(p);
            return (
              <div key={p} className="flex items-center justify-between border p-3 rounded gap-2">
                <div className="text-sm">
                  <div className="font-bold capitalize">{p}</div>
                  <div className="text-gray-500">
                    {s
                      ? `${s.totalSolved} solved · rating ${s.rating ?? '—'} · last synced ${s.lastSyncedAt ? new Date(s.lastSyncedAt).toLocaleString() : 'never'}`
                      : 'Never synced'}
                  </div>
                </div>
                <button
                  onClick={() => syncNow(p)}
                  disabled={syncing !== null}
                  className="border px-4 py-2 rounded disabled:opacity-50 text-sm shrink-0"
                >
                  {syncing === p ? 'Syncing…' : 'Sync now'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="bg-white p-4 rounded shadow space-y-2">
          <h2 className="font-bold">Privacy</h2>
          <p className="text-sm text-gray-500">
            Public profile: <code>/u/{user?.username}</code>
          </p>
          {[
            ['profilePublic', 'Make my profile public'],
            ['showHeatmap', 'Show activity heatmap on public profile'],
            ['showProjects', 'Show featured projects on public profile'],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
              />
              {label}
            </label>
          ))}
          <button onClick={save} className="bg-black text-white px-4 py-2 rounded" type="button">Save privacy</button>
        </div>
      </div>
    </div>
  );
}
