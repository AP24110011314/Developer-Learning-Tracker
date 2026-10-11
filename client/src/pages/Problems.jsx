import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Plus, LayoutGrid, LayoutList, Filter, Search, ExternalLink,
  Edit3, Trash2, ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import api from '../api.js';
import { Button } from '../components/ui/Button.jsx';
import { Badge, TopicTag } from '../components/ui/Badge.jsx';
import { Card, CardBody } from '../components/ui/Card.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { Input, Select, Textarea } from '../components/ui/Input.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { Tabs } from '../components/ui/Tabs.jsx';

const emptyForm = {
  title: '', platform: 'other', url: '', difficulty: 'medium',
  topics: '', status: 'solved', timeMinutes: '', notes: '', solvedAt: '',
};

const DIFF_LABEL = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
const STATUS_LABEL = { solved: 'Solved', revisit: 'Revisit', stuck: 'Stuck' };

const VIEW_TABS = [
  { id: 'table', label: 'Table', icon: LayoutList },
  { id: 'card',  label: 'Cards', icon: LayoutGrid },
];

function ProblemCard({ p, onEdit, onDelete, onStatusChange }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="card card-hover p-4 space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {p.url ? (
            <a
              href={p.url}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[var(--text-primary)] hover:text-primary-500 transition-colors flex items-start gap-1 group"
            >
              <span className="leading-snug">{p.title}</span>
              <ExternalLink size={12} className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </a>
          ) : (
            <span className="font-semibold text-[var(--text-primary)] leading-snug">{p.title}</span>
          )}
          {p.platform && p.platform !== 'other' && (
            <div className="text-xs text-[var(--text-muted)] mt-0.5 capitalize">{p.platform}</div>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onEdit(p)}
            aria-label={`Edit ${p.title}`}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-primary-500 transition-colors"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={() => onDelete(p)}
            aria-label={`Delete ${p.title}`}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-rose-500 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant={p.difficulty} dot>{DIFF_LABEL[p.difficulty]}</Badge>
        <Badge variant={p.status} dot>{STATUS_LABEL[p.status]}</Badge>
      </div>

      {(p.topics || []).length > 0 && (
        <div className="flex flex-wrap gap-1">
          {p.topics.map((t) => <TopicTag key={t} topic={t} />)}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span>{p.solvedAt ? new Date(p.solvedAt).toLocaleDateString() : '—'}</span>
        {p.timeMinutes > 0 && <span>{p.timeMinutes}m</span>}
      </div>

      {/* Quick status toggle */}
      <div className="flex gap-1.5 pt-1 border-t border-[var(--border)]">
        {['solved', 'revisit', 'stuck'].map((s) => (
          <button
            key={s}
            onClick={() => onStatusChange(p, s)}
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors ${
              p.status === s
                ? s === 'solved' ? 'bg-emerald-500 text-white' : s === 'revisit' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'
                : 'bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {STATUS_LABEL[s]}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function TableRow({ p, onEdit, onDelete, onStatusChange }) {
  return (
    <motion.tr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="border-t border-[var(--border)] hover:bg-[var(--bg-card-hover)] transition-colors group"
    >
      <td className="px-4 py-3 text-sm max-w-xs">
        {p.url ? (
          <a
            href={p.url}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--text-primary)] hover:text-primary-500 transition-colors flex items-center gap-1 group/link"
          >
            <span className="truncate">{p.title}</span>
            <ExternalLink size={11} className="opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0" />
          </a>
        ) : (
          <span className="font-medium text-[var(--text-primary)] truncate">{p.title}</span>
        )}
      </td>
      <td className="px-4 py-3">
        <Badge variant={p.difficulty} dot>{DIFF_LABEL[p.difficulty]}</Badge>
      </td>
      <td className="px-4 py-3">
        <select
          value={p.status}
          onChange={(e) => onStatusChange(p, e.target.value)}
          className="text-xs font-semibold rounded-full px-2 py-1 border-0 cursor-pointer focus:ring-2 focus:ring-primary-500"
          style={{
            background: p.status === 'solved' ? 'var(--color-solved-bg)' : p.status === 'revisit' ? 'var(--color-revisit-bg)' : 'var(--color-stuck-bg)',
            color: p.status === 'solved' ? 'var(--color-solved)' : p.status === 'revisit' ? 'var(--color-revisit)' : 'var(--color-stuck)',
          }}
        >
          <option value="solved">Solved</option>
          <option value="revisit">Revisit</option>
          <option value="stuck">Stuck</option>
        </select>
      </td>
      <td className="px-4 py-3 max-w-[180px]">
        <div className="flex flex-wrap gap-1">
          {(p.topics || []).slice(0, 3).map((t) => <TopicTag key={t} topic={t} />)}
          {(p.topics || []).length > 3 && (
            <span className="text-xs text-[var(--text-muted)]">+{p.topics.length - 3}</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
        {p.solvedAt ? new Date(p.solvedAt).toLocaleDateString() : '—'}
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(p)}
            aria-label={`Edit ${p.title}`}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-primary-500 transition-colors"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={() => onDelete(p)}
            aria-label={`Delete ${p.title}`}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-rose-500 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

export default function Problems() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ difficulty: '', status: '', q: '', from: '', to: '', page: 1, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState('table');
  const [searchInput, setSearchInput] = useState('');
  const searchRef = useRef(null);
  const debounceTimer = useRef(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      if (e.key === 'n' || e.key === 'N') openAdd();
      if (e.key === '/') { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === 'Escape') { setModalOpen(false); setDeleteTarget(null); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const fetchProblems = useCallback(async (f = filters) => {
    setLoading(true);
    try {
      const params = {};
      for (const [k, v] of Object.entries(f)) if (v !== '' && v != null) params[k] = v;
      const { data } = await api.get('/problems', { params });
      setItems(data.items);
      setMeta({ page: data.page, totalPages: data.totalPages, total: data.total });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load problems');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProblems(); }, []);

  const applyFilters = (patch = {}) => {
    const f = { ...filters, ...patch, page: 1 };
    setFilters(f);
    fetchProblems(f);
  };

  const handleSearchChange = (val) => {
    setSearchInput(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      applyFilters({ q: val.trim() });
    }, 300);
  };

  const clearSearch = () => {
    setSearchInput('');
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    applyFilters({ q: '' });
    searchRef.current?.focus();
  };

  const changePage = (delta) => {
    const next = Math.min(Math.max(1, filters.page + delta), Math.max(1, meta.totalPages));
    const f = { ...filters, page: next };
    setFilters(f);
    fetchProblems(f);
  };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };

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
    if (form.url)       payload.url = form.url;
    if (form.topics)    payload.topics = form.topics.split(',').map((t) => t.trim()).filter(Boolean);
    if (form.timeMinutes !== '') payload.timeMinutes = Number(form.timeMinutes);
    if (form.notes)     payload.notes = form.notes;
    if (form.solvedAt)  payload.solvedAt = new Date(form.solvedAt).toISOString();
    return payload;
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/problems/${editing._id}`, toPayload());
        toast.success('Problem updated!');
      } else {
        await api.post('/problems', toPayload());
        toast.success('Problem added!');
      }
      setModalOpen(false);
      fetchProblems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/problems/${deleteTarget._id}`);
      toast.success('Problem deleted');
      setDeleteTarget(null);
      fetchProblems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const onStatusChange = async (p, newStatus) => {
    try {
      await api.put(`/problems/${p._id}`, { ...p, topics: p.topics, status: newStatus });
      toast.success(`Marked as ${newStatus}`);
      fetchProblems();
    } catch {
      toast.error('Failed to update status');
    }
  };

  // Active filter chips
  const activeFilters = Object.entries({
    difficulty: filters.difficulty,
    status: filters.status,
    q: filters.q,
  })
    .filter(([, v]) => v)
    .map(([k, v]) => ({ key: k, value: v }));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Problems</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {meta.total} {meta.total === 1 ? 'problem' : 'problems'} logged
          </p>
        </div>
        <Button onClick={openAdd} id="add-problem-btn" className="shadow-md shadow-primary-500/20">
          <Plus size={16} />
          <span>Add Problem</span>
          <span className="hidden sm:inline bg-white/20 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-md ml-1">N</span>
        </Button>
      </div>

      {/* Quick-add search + filters */}
      <div className="card p-4 space-y-3.5 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
          <div className="relative flex-1 group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-primary-500 transition-colors pointer-events-none">
              <Search size={18} />
            </div>
            <input
              ref={searchRef}
              placeholder="Search by title, topic, or platform…"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full h-11 pl-11 pr-20 bg-[var(--bg-input)] hover:bg-[var(--bg-card)] focus:bg-[var(--bg-card)] border border-[var(--border)] focus:border-primary-500 rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              id="problems-search"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors"
                  title="Clear search"
                >
                  <X size={15} />
                </button>
              )}
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[11px] font-medium text-[var(--text-muted)] bg-[var(--bg-card)] border border-[var(--border)] rounded-md shadow-2xs pointer-events-none">
                /
              </kbd>
            </div>
          </div>
          <div className="flex-shrink-0 self-end sm:self-auto">
            <Tabs tabs={VIEW_TABS} active={view} onChange={setView} />
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 items-center pt-1 border-t border-[var(--border)]">
          <span className="text-xs font-medium text-[var(--text-muted)] mr-1 flex items-center gap-1">
            <Filter size={12} /> Filters:
          </span>
          {['easy', 'medium', 'hard'].map((d) => (
            <button
              key={d}
              onClick={() => applyFilters({ difficulty: filters.difficulty === d ? '' : d })}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                filters.difficulty === d
                  ? d === 'easy' ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                  : d === 'medium' ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                  : 'bg-rose-500 text-white border-rose-500 shadow-xs'
                  : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
              }`}
            >
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
          <div className="w-px h-4 bg-[var(--border)] mx-1" />
          {['solved', 'revisit', 'stuck'].map((s) => (
            <button
              key={s}
              onClick={() => applyFilters({ status: filters.status === s ? '' : s })}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                filters.status === s
                  ? s === 'solved' ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                  : s === 'revisit' ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                  : 'bg-rose-500 text-white border-rose-500 shadow-xs'
                  : 'bg-[var(--bg-input)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'
              }`}
            >
              {STATUS_LABEL[s]}
            </button>
          ))}

          {/* Clear chips */}
          {activeFilters.length > 0 && (
            <button
              onClick={() => {
                setSearchInput('');
                applyFilters({ difficulty: '', status: '', q: '' });
              }}
              className="text-xs text-[var(--text-muted)] hover:text-rose-500 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-500/10 transition-colors ml-auto font-medium"
            >
              <X size={13} /> Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={activeFilters.length > 0 ? 'search' : 'empty'}
          title={activeFilters.length > 0 ? 'No problems match your filters' : 'No problems logged yet'}
          description={activeFilters.length > 0 ? 'Try adjusting your filters.' : 'Start logging problems to track your progress!'}
          action={activeFilters.length === 0 ? { label: 'Add your first problem', onClick: openAdd } : undefined}
        />
      ) : view === 'card' ? (
        <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {items.map((p) => (
              <ProblemCard key={p._id} p={p} onEdit={openEdit} onDelete={setDeleteTarget} onStatusChange={onStatusChange} />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--bg-input)] text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Title</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Difficulty</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Topics</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Date</th>
                  <th className="px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide sr-only">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {items.map((p) => (
                    <TableRow key={p._id} p={p} onEdit={openEdit} onDelete={setDeleteTarget} onStatusChange={onStatusChange} />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--text-muted)]">
            Page {meta.page} of {meta.totalPages}
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => changePage(-1)} disabled={filters.page <= 1}>
              <ChevronLeft size={16} /> Prev
            </Button>
            <Button variant="secondary" size="sm" onClick={() => changePage(1)} disabled={filters.page >= meta.totalPages}>
              Next <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Problem' : 'Add Problem'}>
        <form onSubmit={save} className="space-y-4">
          <Input
            id="problem-title"
            label="Title"
            placeholder="Two Sum"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              id="problem-platform"
              label="Platform"
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value })}
            >
              <option value="leetcode">LeetCode</option>
              <option value="codeforces">Codeforces</option>
              <option value="hackerrank">HackerRank</option>
              <option value="other">Other</option>
            </Select>
            <Select
              id="problem-difficulty"
              label="Difficulty"
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </Select>
            <Select
              id="problem-status"
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="solved">Solved</option>
              <option value="revisit">Revisit</option>
              <option value="stuck">Stuck</option>
            </Select>
            <Input
              id="problem-time"
              label="Time (minutes)"
              type="number"
              min="0"
              placeholder="30"
              value={form.timeMinutes}
              onChange={(e) => setForm({ ...form, timeMinutes: e.target.value })}
            />
          </div>
          <Input
            id="problem-url"
            label="URL"
            placeholder="https://leetcode.com/problems/…"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
          />
          <Input
            id="problem-topics"
            label="Topics"
            placeholder="arrays, binary search, dp"
            value={form.topics}
            onChange={(e) => setForm({ ...form, topics: e.target.value })}
            hint="Comma-separated"
          />
          <Input
            id="problem-solvedat"
            label="Solved At"
            type="datetime-local"
            value={form.solvedAt}
            onChange={(e) => setForm({ ...form, solvedAt: e.target.value })}
          />
          <Textarea
            id="problem-notes"
            label="Notes"
            placeholder="Approach, complexity, lessons…"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>
              {editing ? 'Update' : 'Add Problem'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Problem?" size="sm">
        <p className="text-sm text-[var(--text-secondary)] mb-5">
          Are you sure you want to delete <strong className="text-[var(--text-primary)]">"{deleteTarget?.title}"</strong>? This cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
