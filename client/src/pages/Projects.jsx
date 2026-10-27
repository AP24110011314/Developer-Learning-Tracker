import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Plus, Edit3, Trash2, GitBranch, Globe, Star, Code2, Layers } from 'lucide-react';
import api from '../api.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { Button } from '../components/ui/Button.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { Input, Select, Textarea } from '../components/ui/Input.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';

const emptyForm = {
  name: '', description: '', stack: '', repoUrl: '', liveUrl: '',
  status: 'in-progress', learnings: '', featured: false,
};

const STATUS_STYLES = {
  'planned':     'bg-sky-100 text-sky-700',
  'in-progress': 'bg-amber-100 text-amber-700',
  'completed':   'bg-emerald-100 text-emerald-700',
  'archived':    'bg-[var(--bg-input)] text-[var(--text-muted)]',
};

const CARD_GRADIENTS = [
  'from-primary-500/10 to-violet-500/10',
  'from-cyan-500/10 to-primary-500/10',
  'from-emerald-500/10 to-cyan-500/10',
  'from-amber-500/10 to-orange-500/10',
  'from-pink-500/10 to-rose-500/10',
];

function ProjectCard({ p, onEdit, onDelete, index }) {
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="card card-hover overflow-hidden"
    >
      {/* Gradient header */}
      <div className={`h-1.5 bg-gradient-to-r ${gradient.replace('/10', '')}`} />
      <div className="p-4 sm:p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {p.featured && <Star size={14} className="text-amber-500 fill-amber-500 shrink-0" />}
              <h3 className="font-bold text-[var(--text-primary)] leading-snug truncate">{p.name}</h3>
            </div>
            <span className={`mt-1 inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[p.status]}`}>
              {p.status.replace('-', ' ')}
            </span>
          </div>
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => onEdit(p)}
              aria-label={`Edit ${p.name}`}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-primary-500 transition-colors"
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={() => onDelete(p)}
              aria-label={`Delete ${p.name}`}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-rose-500 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {p.description && (
          <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{p.description}</p>
        )}

        {(p.stack || []).length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {p.stack.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 text-xs bg-[var(--bg-input)] text-[var(--text-secondary)] px-2 py-0.5 rounded-md font-medium">
                <Code2 size={10} />
                {s}
              </span>
            ))}
          </div>
        )}

        {p.learnings && (
          <p className="text-xs text-[var(--text-muted)] italic leading-relaxed border-l-2 border-primary-200 pl-2">
            {p.learnings}
          </p>
        )}

        {(p.repoUrl || p.liveUrl) && (
          <div className="flex gap-3 pt-1 border-t border-[var(--border)]">
            {p.repoUrl && (
              <a
                href={p.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-primary-500 transition-colors"
              >
                <GitBranch size={13} /> Repository
              </a>
            )}
            {p.liveUrl && (
              <a
                href={p.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-primary-500 transition-colors"
              >
                <Globe size={13} /> Live demo
              </a>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function Projects() {
  useDocumentTitle('Projects');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };

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
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/projects/${editing._id}`, toPayload());
        toast.success('Project updated!');
      } else {
        await api.post('/projects', toPayload());
        toast.success('Project added!');
      }
      setModalOpen(false);
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/projects/${deleteTarget._id}`);
      toast.success('Project deleted');
      setDeleteTarget(null);
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Projects</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{projects.length} projects · {featured.length} featured</p>
        </div>
        <Button onClick={openAdd} id="add-project-btn" className="self-start sm:self-auto">
          <Plus size={16} /> Add Project
        </Button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 space-y-3">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Document your projects to showcase your work!"
          action={{ label: 'Add your first project', onClick: openAdd }}
        />
      ) : (
        <>
          {featured.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3 flex items-center gap-2">
                <Star size={12} className="text-amber-500" /> Featured
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featured.map((p, i) => (
                  <ProjectCard key={p._id} p={p} onEdit={openEdit} onDelete={setDeleteTarget} index={i} />
                ))}
              </div>
            </div>
          )}
          {rest.length > 0 && (
            <div>
              {featured.length > 0 && (
                <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">All Projects</h2>
              )}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rest.map((p, i) => (
                  <ProjectCard key={p._id} p={p} onEdit={openEdit} onDelete={setDeleteTarget} index={i} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Project' : 'Add Project'}>
        <form onSubmit={save} className="space-y-4">
          <Input
            id="project-name"
            label="Name"
            placeholder="My Awesome App"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Textarea
            id="project-desc"
            label="Description"
            placeholder="What does this project do?"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
          />
          <Input
            id="project-stack"
            label="Tech stack"
            placeholder="React, Node.js, MongoDB"
            value={form.stack}
            onChange={(e) => setForm({ ...form, stack: e.target.value })}
            hint="Comma-separated"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              id="project-repo"
              label="Repo URL"
              placeholder="https://github.com/…"
              value={form.repoUrl}
              onChange={(e) => setForm({ ...form, repoUrl: e.target.value })}
            />
            <Input
              id="project-live"
              label="Live URL"
              placeholder="https://myapp.vercel.app"
              value={form.liveUrl}
              onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
            />
          </div>
          <Select
            id="project-status"
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="planned">Planned</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </Select>
          <Textarea
            id="project-learnings"
            label="Learnings"
            placeholder="What did you learn building this?"
            value={form.learnings}
            onChange={(e) => setForm({ ...form, learnings: e.target.value })}
            rows={2}
          />
          <label className="flex items-center gap-3 cursor-pointer group">
            <div
              onClick={() => setForm({ ...form, featured: !form.featured })}
              className={`w-10 h-5 rounded-full transition-colors relative ${form.featured ? 'bg-primary-500' : 'bg-[var(--border-strong)]'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.featured ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <div>
              <div className="text-sm font-medium text-[var(--text-primary)]">Feature this project</div>
              <div className="text-xs text-[var(--text-muted)]">Shown on your public profile</div>
            </div>
          </label>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? 'Update' : 'Add Project'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Project?" size="sm">
        <p className="text-sm text-[var(--text-secondary)] mb-5">
          Delete <strong>"{deleteTarget?.name}"</strong>? This cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
