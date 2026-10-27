import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Plus, Edit3, Trash2, Target, CheckCircle2, Clock } from 'lucide-react';
import api from '../api.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { Button } from '../components/ui/Button.jsx';
import { Card, CardBody } from '../components/ui/Card.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { Input, Select } from '../components/ui/Input.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { ProgressBar } from '../components/ui/ProgressBar.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';

const emptyForm = {
  title: '', metric: 'problems', target: 10, difficulty: '',
  topic: '', startDate: '', deadline: '', status: 'active',
};

const STATUS_COLORS = {
  active:    'bg-primary-100 text-primary-700',
  completed: 'bg-emerald-100 text-emerald-700',
  archived:  'bg-[var(--bg-input)] text-[var(--text-muted)]',
};

const METRIC_ICON = { problems: Target, streak: '🔥', projects: '🗂️' };

function GoalCard({ g, onEdit, onDelete, index }) {
  const pct = g.progress?.percent ?? 0;
  const isCompleted = g.status === 'completed';
  const Icon = Target;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="card card-hover p-4 sm:p-5 space-y-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isCompleted ? 'bg-emerald-100' : 'bg-primary-50'
          }`}>
            {isCompleted
              ? <CheckCircle2 size={20} className="text-emerald-500" />
              : <Target size={20} className="text-primary-500" />
            }
          </div>
          <div>
            <h3 className="font-bold text-[var(--text-primary)] leading-snug">{g.title}</h3>
            <div className="flex flex-wrap gap-1.5 mt-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[g.status]}`}>
                {g.status}
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                {g.metric} · target {g.target}
              </span>
              {g.filter?.difficulty && (
                <Badge variant={g.filter.difficulty} dot>{g.filter.difficulty}</Badge>
              )}
              {g.filter?.topic && (
                <span className="text-xs bg-[var(--bg-input)] text-[var(--text-secondary)] px-2 py-0.5 rounded-full">
                  #{g.filter.topic}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => onEdit(g)}
            aria-label={`Edit ${g.title}`}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-primary-500 transition-colors"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={() => onDelete(g)}
            aria-label={`Delete ${g.title}`}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-input)] hover:text-rose-500 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-secondary)] font-medium">
            {g.progress?.current ?? 0} / {g.target}
          </span>
          <span className="font-bold text-[var(--text-primary)]">{pct}%</span>
        </div>
        <ProgressBar
          value={pct}
          max={100}
          color={isCompleted ? 'emerald' : pct > 70 ? 'cyan' : 'primary'}
        />
      </div>

      {(g.deadline || g.startDate) && (
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <Clock size={12} />
          {g.startDate && <span>Started {new Date(g.startDate).toLocaleDateString()}</span>}
          {g.deadline && <span>· Due {new Date(g.deadline).toLocaleDateString()}</span>}
        </div>
      )}
    </motion.div>
  );
}

export default function Goals() {
  useDocumentTitle('Goals');
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/goals');
      setGoals(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGoals(); }, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };

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
    if (form.deadline)  p.deadline = new Date(form.deadline).toISOString();
    return p;
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/goals/${editing._id}`, toPayload());
        toast.success('Goal updated!');
      } else {
        await api.post('/goals', toPayload());
        toast.success('Goal created!');
      }
      setModalOpen(false);
      fetchGoals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/goals/${deleteTarget._id}`);
      toast.success('Goal deleted');
      setDeleteTarget(null);
      fetchGoals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const active = goals.filter((g) => g.status === 'active');
  const completed = goals.filter((g) => g.status === 'completed');
  const archived = goals.filter((g) => g.status === 'archived');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Goals</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{active.length} active · {completed.length} completed</p>
        </div>
        <Button onClick={openAdd} id="add-goal-btn" className="self-start sm:self-auto">
          <Plus size={16} /> Add Goal
        </Button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-5 space-y-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      ) : goals.length === 0 ? (
        <EmptyState
          title="No goals yet"
          description="Set a goal to track your progress and stay motivated!"
          action={{ label: 'Create your first goal', onClick: openAdd }}
        />
      ) : (
        <>
          {active.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">Active</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {active.map((g, i) => (
                  <GoalCard key={g._id} g={g} onEdit={openEdit} onDelete={setDeleteTarget} index={i} />
                ))}
              </div>
            </div>
          )}
          {completed.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">Completed</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {completed.map((g, i) => (
                  <GoalCard key={g._id} g={g} onEdit={openEdit} onDelete={setDeleteTarget} index={i} />
                ))}
              </div>
            </div>
          )}
          {archived.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">Archived</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {archived.map((g, i) => (
                  <GoalCard key={g._id} g={g} onEdit={openEdit} onDelete={setDeleteTarget} index={i} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Goal' : 'New Goal'}>
        <form onSubmit={save} className="space-y-4">
          <Input
            id="goal-title"
            label="Title"
            placeholder="Solve 50 medium problems"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              id="goal-metric"
              label="Metric"
              value={form.metric}
              onChange={(e) => setForm({ ...form, metric: e.target.value })}
            >
              <option value="problems">Problems</option>
              <option value="streak">Streak (days)</option>
              <option value="projects">Projects</option>
            </Select>
            <Input
              id="goal-target"
              label="Target"
              type="number"
              min="1"
              value={form.target}
              onChange={(e) => setForm({ ...form, target: e.target.value })}
              required
            />
            <Select
              id="goal-difficulty"
              label="Difficulty filter"
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            >
              <option value="">Any</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </Select>
            <Input
              id="goal-topic"
              label="Topic filter"
              placeholder="arrays"
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
            />
            <Input
              id="goal-start"
              label="Start date"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
            <Input
              id="goal-deadline"
              label="Deadline"
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </div>
          <Select
            id="goal-status"
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </Select>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? 'Update' : 'Create Goal'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Goal?" size="sm">
        <p className="text-sm text-[var(--text-secondary)] mb-5">
          Delete <strong>"{deleteTarget?.title}"</strong>? This cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
