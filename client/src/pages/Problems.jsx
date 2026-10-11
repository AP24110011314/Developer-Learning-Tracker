import { useEffect, useState } from 'react';
import api from '../api.js';
import Navbar from '../components/Navbar.jsx';

const emptyForm = {
  title: '',
  platform: 'other',
  url: '',
  difficulty: 'medium',
  topics: '',
  status: 'solved',
  timeMinutes: '',
  notes: '',
  solvedAt: '',
};

export default function Problems() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ difficulty: '', status: '', topic: '', from: '', to: '', page: 1, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchProblems = async (f = filters) => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      for (const [k, v] of Object.entries(f)) if (v !== '' && v != null) params[k] = v;
      const { data } = await api.get('/problems', { params });
      setItems(data.items);
      setMeta({ page: data.page, totalPages: data.totalPages, total: data.total });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load problems');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = (e) => {
    e?.preventDefault();
    const f = { ...filters, page: 1 };
    setFilters(f);
    fetchProblems(f);
  };

  const changePage = (delta) => {
    const next = Math.min(Math.max(1, filters.page + delta), Math.max(1, meta.totalPages));
    const f = { ...filters, page: next };
    setFilters(f);
    fetchProblems(f);
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      title: p.title || '',
      platform: p.platform || 'other',
      url: p.url || '',
      difficulty: p.difficulty || 'medium',
      topics: (p.topics || []).join(', '),
      status: p.status || 'solved',
      timeMinutes: p.timeMinutes ?? '',
      notes: p.notes || '',
      solvedAt: p.solvedAt ? new Date(p.solvedAt).toISOString().slice(0, 16) : '',
    });
    setModalOpen(true);
  };

  const toPayload = () => {
    const payload = {
      title: form.title.trim(),
      platform: form.platform || 'other',
      difficulty: form.difficulty,
      status: form.status,
    };
    if (form.url) payload.url = form.url;
    if (form.topics) payload.topics = form.topics.split(',').map((t) => t.trim()).filter(Boolean);
    if (form.timeMinutes !== '') payload.timeMinutes = Number(form.timeMinutes);
    if (form.notes) payload.notes = form.notes;
    if (form.solvedAt) payload.solvedAt = new Date(form.solvedAt).toISOString();
    return payload;
  };

  const save = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) await api.put(`/problems/${editing._id}`, toPayload());
      else await api.post('/problems', toPayload());
      setModalOpen(false);
      fetchProblems();
    } catch (err) {
      const d = err.response?.data;
      setError(d?.message || 'Save failed');
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/problems/${deleteTarget._id}`);
      setDeleteTarget(null);
      fetchProblems();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Problems</h1>
          <button onClick={openAdd} className="bg-black text-white px-4 py-2 rounded">Add problem</button>
        </div>

        <form onSubmit={applyFilters} className="bg-white p-4 rounded shadow grid grid-cols-2 md:grid-cols-6 gap-2">
          <select value={filters.difficulty} onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })} className="border p-2 rounded">
            <option value="">All difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="border p-2 rounded">
            <option value="">All statuses</option>
            <option value="solved">Solved</option>
            <option value="revisit">Revisit</option>
            <option value="stuck">Stuck</option>
          </select>
          <input placeholder="Topic" value={filters.topic} onChange={(e) => setFilters({ ...filters, topic: e.target.value })} className="border p-2 rounded" />
          <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} className="border p-2 rounded" />
          <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} className="border p-2 rounded" />
          <button className="border p-2 rounded" type="submit">Filter</button>
        </form>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="bg-white rounded shadow overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="p-2">Title</th>
                    <th className="p-2">Difficulty</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Topics</th>
                    <th className="p-2">Solved</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((p) => (
                    <tr key={p._id} className="border-t">
                      <td className="p-2">{p.url ? <a className="underline" href={p.url} target="_blank" rel="noreferrer">{p.title}</a> : p.title}</td>
                      <td className="p-2">{p.difficulty}</td>
                      <td className="p-2">{p.status}</td>
                      <td className="p-2">{(p.topics || []).join(', ')}</td>
                      <td className="p-2">{p.solvedAt ? new Date(p.solvedAt).toLocaleDateString() : '-'}</td>
                      <td className="p-2 flex gap-2">
                        <button onClick={() => openEdit(p)} className="underline">Edit</button>
                        <button onClick={() => setDeleteTarget(p)} className="underline text-red-600">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && <tr><td className="p-4 text-gray-500" colSpan={6}>No problems yet.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <button onClick={() => changePage(-1)} disabled={filters.page <= 1} className="border px-3 py-1 rounded disabled:opacity-50">Prev</button>
              <span>Page {meta.page} of {Math.max(1, meta.totalPages)} ({meta.total} total)</span>
              <button onClick={() => changePage(1)} disabled={filters.page >= meta.totalPages} className="border px-3 py-1 rounded disabled:opacity-50">Next</button>
            </div>
          </>
        )}

        {modalOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
            <form onSubmit={save} className="bg-white p-6 rounded w-full max-w-md space-y-3 max-h-[90vh] overflow-y-auto">
              <h2 className="font-bold text-lg">{editing ? 'Edit problem' : 'Add problem'}</h2>
              <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border p-2 rounded" />
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Platform" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className="border p-2 rounded" />
                <input placeholder="URL" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="border p-2 rounded" />
                <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="border p-2 rounded">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="border p-2 rounded">
                  <option value="solved">Solved</option>
                  <option value="revisit">Revisit</option>
                  <option value="stuck">Stuck</option>
                </select>
                <input placeholder="Topics (comma separated)" value={form.topics} onChange={(e) => setForm({ ...form, topics: e.target.value })} className="border p-2 rounded" />
                <input type="number" min="0" placeholder="Minutes" value={form.timeMinutes} onChange={(e) => setForm({ ...form, timeMinutes: e.target.value })} className="border p-2 rounded" />
              </div>
              <input type="datetime-local" value={form.solvedAt} onChange={(e) => setForm({ ...form, solvedAt: e.target.value })} className="w-full border p-2 rounded" />
              <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full border p-2 rounded" rows={3} />
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
              <p className="text-sm text-gray-600">This cannot be undone.</p>
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
