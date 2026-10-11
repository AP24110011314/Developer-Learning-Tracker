import { useEffect, useState } from 'react';
import api from '../api.js';
import Navbar from '../components/Navbar.jsx';

const emptyForm = { name: '', description: '', stack: '', repoUrl: '', liveUrl: '', status: 'in-progress', learnings: '', featured: false };

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load projects');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name || '',
      description: p.description || '',
      stack: (p.stack || []).join(', '),
      repoUrl: p.repoUrl || '',
      liveUrl: p.liveUrl || '',
      status: p.status || 'in-progress',
      learnings: p.learnings || '',
      featured: !!p.featured,
    });
    setModalOpen(true);
  };

  const toPayload = () => ({
    name: form.name.trim(),
    description: form.description,
    stack: form.stack.split(',').map((s) => s.trim()).filter(Boolean),
    repoUrl: form.repoUrl,
    liveUrl: form.liveUrl,
    status: form.status,
    learnings: form.learnings,
    featured: !!form.featured,
  });

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`/projects/${editing._id}`, toPayload());
      else await api.post('/projects', toPayload());
      setModalOpen(false);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/projects/${deleteTarget._id}`);
      setDeleteTarget(null);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Projects</h1>
          <button onClick={openAdd} className="bg-black text-white px-4 py-2 rounded">Add project</button>
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="grid md:grid-cols-2 gap-4">
          {projects.map((p) => (
            <div key={p._id} className="bg-white p-4 rounded shadow space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-bold">
                  {p.featured && <span title="Featured">⭐ </span>}{p.name}
                </h2>
                <div className="flex gap-2 text-sm shrink-0">
                  <button onClick={() => openEdit(p)} className="underline">Edit</button>
                  <button onClick={() => setDeleteTarget(p)} className="underline text-red-600">Delete</button>
                </div>
              </div>
              <p className="text-xs text-gray-500">{p.status}</p>
              {p.description && <p className="text-sm">{p.description}</p>}
              {(p.stack || []).length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {p.stack.map((s) => (
                    <span key={s} className="text-xs bg-gray-100 px-2 py-1 rounded">{s}</span>
                  ))}
                </div>
              )}
              <div className="flex gap-3 text-sm">
                {p.repoUrl && <a className="underline" href={p.repoUrl} target="_blank" rel="noreferrer">Repo</a>}
                {p.liveUrl && <a className="underline" href={p.liveUrl} target="_blank" rel="noreferrer">Live</a>}
              </div>
              {p.learnings && <p className="text-sm text-gray-600">Learned: {p.learnings}</p>}
            </div>
          ))}
          {projects.length === 0 && <p className="text-sm text-gray-500">No projects yet.</p>}
        </div>

        {modalOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
            <form onSubmit={save} className="bg-white p-6 rounded w-full max-w-md space-y-3 max-h-[90vh] overflow-y-auto">
              <h2 className="font-bold text-lg">{editing ? 'Edit project' : 'Add project'}</h2>
              <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border p-2 rounded" />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border p-2 rounded" rows={2} />
              <input placeholder="Stack (comma separated)" value={form.stack} onChange={(e) => setForm({ ...form, stack: e.target.value })} className="w-full border p-2 rounded" />
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Repo URL" value={form.repoUrl} onChange={(e) => setForm({ ...form, repoUrl: e.target.value })} className="border p-2 rounded" />
                <input placeholder="Live URL" value={form.liveUrl} onChange={(e) => setForm({ ...form, liveUrl: e.target.value })} className="border p-2 rounded" />
              </div>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border p-2 rounded">
                <option value="planned">Planned</option>
                <option value="in-progress">In progress</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
              <textarea placeholder="Learnings" value={form.learnings} onChange={(e) => setForm({ ...form, learnings: e.target.value })} className="w-full border p-2 rounded" rows={2} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                Featured
              </label>
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
              <h2 className="font-bold">Delete “{deleteTarget.name}”?</h2>
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
