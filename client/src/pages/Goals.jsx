import { useEffect, useState } from 'react';
import api from '../api.js';
import Navbar from '../components/Navbar.jsx';

const emptyForm = { title: '', metric: 'problems', target: 10, difficulty: '', topic: '', startDate: '', deadline: '', status: 'active' };

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchGoals = async () => {
    try {
      const { data } = await api.get('/goals');
      setGoals(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load goals');
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (g) => {
    setEditing(g);
    setForm({
      title: g.title || '',
      metric: g.metric || 'problems',
      target: g.target || 10,
      difficulty: g.filter?.difficulty || '',
      topic: g.filter?.topic || '',
      startDate: g.startDate ? g.startDate.slice(0, 10) : '',
      deadline: g.deadline ? g.deadline.slice(0, 10) : '',
      status: g.status || 'active',
    });
    setModalOpen(true);
  };

  const toPayload = () => {
    const p = { title: form.title.trim(), metric: form.metric, target: Number(form.target), status: form.status };
    const filter = {};
    if (form.difficulty) filter.difficulty = form.difficulty;
    if (form.topic.trim()) filter.topic = form.topic.trim();
    if (Object.keys(filter).length) p.filter = filter;
    if (form.startDate) p.startDate = new Date(form.startDate).toISOString();
    if (form.deadline) p.deadline = new Date(form.deadline).toISOString();
    return p;
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/goals/${editing._id}`, toPayload());
      else await api.post('/goals', toPayload());
      setModalOpen(false);
      fetchGoals();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/goals/${deleteTarget._id}`);
      setDeleteTarget(null);
      fetchGoals();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Goals</h1>
          <button onClick={openAdd} className="bg-black text-white px-4 py-2 rounded">Add goal</button>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="grid md:grid-cols-2 gap-4">
          {goals.map((g) => (
            <div key={g._id} className="bg-white p-4 rounded shadow space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-bold">{g.title}</h2>
                  <p className="text-xs text-gray-500">
                    {g.metric} · target {g.target} · {g.status}
                    {g.filter?.difficulty ? ` · ${g.filter.difficulty}` : ''}
                    {g.filter?.topic ? ` · ${g.filter.topic}` : ''}
                  </p>
                </div>
                <div className="flex gap-2 text-sm shrink-0">
                  <button onClick={() => openEdit(g)} className="underline">Edit</button>
                  <button onClick={() => setDeleteTarget(g)} className="underline text-red-600">Delete</button>
                </div>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-600" style={{ width: `${g.progress?.percent || 0}%` }} />
              </div>
              <p className="text-sm text-gray-600">
                {g.progress?.current ?? 0} / {g.target} ({g.progress?.percent ?? 0}%)
              </p>
            </div>
          ))}
          {goals.length === 0 && <p className="text-sm text-gray-500">No goals yet.</p>}
        </div>

        {modalOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
            <form onSubmit={save} className="bg-white p-6 rounded w-full max-w-md space-y-3 max-h-[90vh] overflow-y-auto">
              <h2 className="font-bold text-lg">{editing ? 'Edit goal' : 'Add goal'}</h2>
              <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border p-2 rounded" />
              <div className="grid grid-cols-2 gap-2">
                <select value={form.metric} onChange={(e) => setForm({ ...form, metric: e.target.value })} className="border p-2 rounded">
                  <option value="problems">Problems</option>
                  <option value="streak">Streak</option>
                  <option value="projects">Projects</option>
                </select>
                <input type="number" min="1" placeholder="Target" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} className="border p-2 rounded" />
                <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="border p-2 rounded">
                  <option value="">Any difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <input placeholder="Topic filter" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} className="border p-2 rounded" />
                <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="border p-2 rounded" />
                <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="border p-2 rounded" />
              </div>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border p-2 rounded">
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setModalOpen(false)} className="border px-4 py-2 rounded">Cancel</button>
                <button type="submit" className="bg-black text-white px-4 py-2 rounded">Save</button>
              </div>
            </form>
          </div>
        )}

        {deleteTarget && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded w-full max-w-sm space-y-4">
              <h2 className="font-bold">Delete “{deleteTarget.title}”?</h2>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setDeleteTarget(null)} className="border px-4 py-2 rounded">Cancel</button>
                <button onClick={confirmDelete} className="bg-red-600 text-white px-4 py-2 rounded">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
