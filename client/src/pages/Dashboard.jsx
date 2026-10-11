import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, CartesianGrid, ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import { motion } from 'framer-motion';
import { Flame, Trophy, TrendingUp, Calendar, Plus, ArrowRight, Code2, BookOpen } from 'lucide-react';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Heatmap from '../components/Heatmap.jsx';
import { StatCard } from '../components/ui/Card.jsx';
import { Skeleton, SkeletonStatCards } from '../components/ui/Skeleton.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { ProgressRing } from '../components/ui/ProgressBar.jsx';

// Semantic chart colors
const DIFF_COLORS = {
  easy:   '#10b981',
  medium: '#f59e0b',
  hard:   '#ef4444',
};

const CHART_GRADIENT_ID = 'weeklyGrad';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}

const MOTIVATIONS = [
  'Every problem solved makes you sharper. 🚀',
  'Consistency compounds. Keep going! 💪',
  'Small steps, big leaps. 🌟',
  'Hard problems today, easy interviews tomorrow. 🎯',
  'Your future self will thank you. ✨',
];
const motivation = MOTIVATIONS[new Date().getDay() % MOTIVATIONS.length];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card px-3 py-2 text-sm shadow-lg border border-[var(--border)]">
      <div className="font-semibold text-[var(--text-primary)]">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-[var(--text-secondary)]">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          {p.name}: <span className="font-bold text-[var(--text-primary)]">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [topics, setTopics] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [heatmap, setHeatmap] = useState({});
  const [loading, setLoading] = useState(true);
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
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const donut = difficulty
    ? [
        { name: 'Easy',   value: difficulty.easy },
        { name: 'Medium', value: difficulty.medium },
        { name: 'Hard',   value: difficulty.hard },
      ].filter((s) => s.value > 0)
    : [];

  const totalSolved = donut.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-6">
      {/* ── Hero greeting ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 via-violet-500 to-pink-500 p-6 md:p-8 text-white"
      >
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute top-8 right-24 w-16 h-16 rounded-full bg-white/10" />

        <div className="relative z-10">
          <p className="text-white/70 text-sm font-medium mb-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            {getGreeting()}, {user?.username}!
          </h1>
          <p className="mt-2 text-white/80 text-sm md:text-base">{motivation}</p>
          <Link
            to="/problems"
            className="mt-5 inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors text-white font-semibold px-5 py-2.5 rounded-xl text-sm"
          >
            <Plus size={16} />
            Log a problem
            <ArrowRight size={14} />
          </Link>
        </div>
      </motion.div>

      {/* ── Stat cards ───────────────────────────────────────────── */}
      {loading ? (
        <SkeletonStatCards count={4} />
      ) : overview ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            index={0}
            label="Total Solved"
            value={overview.totalSolved}
            icon={Code2}
            gradient="from-primary-500 to-violet-500"
          />
          <StatCard
            index={1}
            label="Current Streak"
            value={`${overview.currentStreak}d`}
            icon={Flame}
            gradient="from-orange-400 to-rose-500"
            subtitle={overview.currentStreak > 0 ? '🔥 Keep it up!' : 'Start today!'}
          />
          <StatCard
            index={2}
            label="Longest Streak"
            value={`${overview.longestStreak}d`}
            icon={Trophy}
            gradient="from-amber-400 to-orange-500"
          />
          <StatCard
            index={3}
            label="This Week"
            value={overview.thisWeek}
            icon={TrendingUp}
            gradient="from-emerald-400 to-cyan-500"
          />
        </div>
      ) : null}

      {error && (
        <p className="text-rose-500 text-sm font-medium">{error}</p>
      )}

      {/* ── Charts row ────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Donut chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="card p-5"
        >
          <h2 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-primary-500 to-violet-500" />
            By Difficulty
          </h2>
          {donut.length === 0 ? (
            <EmptyState icon="empty" title="No solved problems yet" description="Start logging problems to see your breakdown." />
          ) : (
            <div className="relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <defs>
                    {donut.map((s) => (
                      <radialGradient key={s.name} id={`grad-${s.name}`} cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={DIFF_COLORS[s.name.toLowerCase()]} stopOpacity={1} />
                        <stop offset="100%" stopColor={DIFF_COLORS[s.name.toLowerCase()]} stopOpacity={0.7} />
                      </radialGradient>
                    ))}
                  </defs>
                  <Pie
                    data={donut}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {donut.map((s) => (
                      <Cell key={s.name} fill={DIFF_COLORS[s.name.toLowerCase()]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-3xl font-extrabold text-[var(--text-primary)]">{totalSolved}</div>
                <div className="text-xs text-[var(--text-muted)] font-medium">solved</div>
              </div>
            </div>
          )}
          {/* Legend */}
          {donut.length > 0 && (
            <div className="flex justify-center gap-4 mt-2">
              {donut.map((s) => (
                <div key={s.name} className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)]">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: DIFF_COLORS[s.name.toLowerCase()] }} />
                  {s.name} ({s.value})
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Top topics bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="card p-5"
        >
          <h2 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-cyan-400 to-primary-500" />
            Top Topics
          </h2>
          {topics.length === 0 ? (
            <EmptyState icon="empty" title="No topic data yet" description="Tag your problems with topics to see insights." />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topics.slice(0, 8)} layout="vertical" margin={{ left: 4, right: 8 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="topic" width={80} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Solved" fill="url(#barGrad)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* ── Weekly area chart ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="card p-5"
      >
        <h2 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-emerald-400 to-cyan-500" />
          Solved per Week (last 12 weeks)
        </h2>
        {weekly.length === 0 ? (
          <EmptyState icon="empty" title="No weekly data yet" description="Solve problems to see your progress over time." />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weekly} margin={{ left: 0, right: 4, top: 4 }}>
              <defs>
                <linearGradient id={CHART_GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="weekStart"
                tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                interval={Math.ceil(weekly.length / 6) - 1}
                axisLine={false}
                tickLine={false}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                name="Solved"
                stroke="#6366f1"
                strokeWidth={2.5}
                fill={`url(#${CHART_GRADIENT_ID})`}
                dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#8b5cf6' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* ── Activity heatmap ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="card p-5"
      >
        <h2 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-violet-400 to-pink-500" />
          Activity Heatmap {new Date().getFullYear()}
        </h2>
        <Heatmap counts={heatmap} />
        <div className="flex items-center gap-1.5 mt-3 text-xs text-[var(--text-muted)]">
          <span>Less</span>
          {['heatmap-0', 'heatmap-1', 'heatmap-2', 'heatmap-3', 'heatmap-4'].map((c) => (
            <span key={c} className={`w-3 h-3 rounded-sm ${c}`} />
          ))}
          <span>More</span>
        </div>
      </motion.div>
    </div>
  );
}
