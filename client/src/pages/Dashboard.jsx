import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';
import { motion } from 'framer-motion';
import {
  Flame, Trophy, TrendingUp, Plus, ArrowRight, Code2,
  ExternalLink, Target, Play, BarChart3, Radio
} from 'lucide-react';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import Heatmap from '../components/Heatmap.jsx';
import { StatCard } from '../components/ui/Card.jsx';
import { SkeletonStatCards } from '../components/ui/Skeleton.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { ProgressRing } from '../components/ui/ProgressBar.jsx';
import Badge, { DifficultyBadge, StatusBadge } from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';

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
          <span className="w-2 h-2 rounded-full" style={{ background: p.color || p.stroke || p.fill }} />
          {p.name}: <span className="font-bold text-[var(--text-primary)]">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [topics, setTopics] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [heatmap, setHeatmap] = useState({});
  const [recentProblem, setRecentProblem] = useState(null);
  const [weeklyGoal, setWeeklyGoal] = useState(null);
  const [topicChartType, setTopicChartType] = useState('bar'); // 'bar' | 'radar'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [o, d, t, w, h, pRes, gRes] = await Promise.all([
          api.get('/stats/overview'),
          api.get('/stats/difficulty'),
          api.get('/stats/topics'),
          api.get('/stats/weekly'),
          api.get('/stats/heatmap'),
          api.get('/problems', { params: { limit: 1 } }).catch(() => ({ data: { items: [] } })),
          api.get('/goals').catch(() => ({ data: [] })),
        ]);
        setOverview(o.data);
        setDifficulty(d.data);
        setTopics(t.data);
        setWeekly(w.data.weeks);
        setHeatmap(h.data.counts);
        if (pRes.data?.items?.length) {
          setRecentProblem(pRes.data.items[0]);
        }
        if (gRes.data?.length) {
          const goal = gRes.data.find((g) => g.metric === 'problems') || gRes.data[0];
          setWeeklyGoal(goal);
        }
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

  // Radar data format from top 6 topics
  const radarData = topics.slice(0, 6).map((t) => ({
    topic: t.topic,
    count: t.count,
  }));

  // Weekly goal target & current
  const goalTarget = weeklyGoal ? weeklyGoal.target : 7;
  const goalCurrent = weeklyGoal ? weeklyGoal.progress.current : (overview?.thisWeek || 0);
  const goalPercent = Math.min(100, Math.round((goalCurrent / goalTarget) * 100));

  return (
    <div className="space-y-6">
      {/* ── Hero greeting ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary-500 via-violet-500 to-pink-500 p-5 sm:p-6 md:p-8 text-white shadow-lg shadow-primary-500/15"
      >
        {/* Decorative background glow */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute top-8 right-24 w-16 h-16 rounded-full bg-white/10" />

        <div className="relative z-10">
          <p className="text-white/70 text-xs sm:text-sm font-medium mb-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
            {getGreeting()}, {user?.username}!
          </h1>
          <p className="mt-1.5 text-white/80 text-xs sm:text-sm md:text-base">{motivation}</p>
          <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            <Link
              to="/problems"
              className="inline-flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 active:scale-95 transition-all text-white font-semibold px-4 sm:px-5 py-2.5 rounded-xl text-sm"
            >
              <Plus size={16} />
              Log a problem
              <ArrowRight size={14} />
            </Link>
            <Link
              to="/goals"
              className="inline-flex items-center justify-center gap-2 bg-black/20 hover:bg-black/30 active:scale-95 transition-all text-white/90 font-medium px-4 py-2.5 rounded-xl text-sm"
            >
              <Target size={16} />
              View Goals
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── Stat cards ───────────────────────────────────────────── */}
      {loading ? (
        <SkeletonStatCards count={4} />
      ) : overview ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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

      {/* ── Weekly Goal Ring & Continue Where You Left Off ──────────── */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Weekly Goal Ring */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="card p-5 flex items-center justify-between"
        >
          <div className="space-y-2 max-w-[65%]">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-indigo-500 to-pink-500" />
              <h2 className="font-bold text-[var(--text-primary)]">
                {weeklyGoal ? weeklyGoal.title : 'Weekly Target'}
              </h2>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              {weeklyGoal
                ? `${goalCurrent} of ${goalTarget} completed towards goal`
                : `${goalCurrent} problems solved this week (Target: ${goalTarget})`}
            </p>
            <div className="pt-2">
              <Link to="/goals" className="inline-flex items-center gap-1 text-xs font-semibold text-primary-500 hover:underline">
                Manage weekly goals <ArrowRight size={12} />
              </Link>
            </div>
          </div>
          <div className="flex-shrink-0">
            <ProgressRing
              value={goalCurrent}
              max={goalTarget}
              size={90}
              strokeWidth={9}
              color="#8b5cf6"
            >
              <div className="flex flex-col items-center">
                <span className="text-sm font-extrabold text-[var(--text-primary)]">{goalPercent}%</span>
                <span className="text-[10px] text-[var(--text-muted)] font-medium">completed</span>
              </div>
            </ProgressRing>
          </div>
        </motion.div>

        {/* Continue where you left off */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18 }}
          className="card p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-amber-400 to-rose-500" />
              <h2 className="font-bold text-[var(--text-primary)]">Continue Where You Left Off</h2>
            </div>
            <span className="text-xs text-[var(--text-muted)] font-medium">Recent Problem</span>
          </div>

          {recentProblem ? (
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-[var(--text-primary)] text-sm line-clamp-1">
                  {recentProblem.title}
                </h3>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <DifficultyBadge difficulty={recentProblem.difficulty} />
                  <StatusBadge status={recentProblem.status} />
                  {recentProblem.platform && (
                    <Badge variant="cyan">{recentProblem.platform}</Badge>
                  )}
                  {recentProblem.topics?.slice(0, 2).map((t) => (
                    <Badge key={t} topic={t} variant="topic">{t}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                <span className="text-xs text-[var(--text-muted)]">
                  {new Date(recentProblem.createdAt).toLocaleDateString()}
                </span>
                <Link to="/problems">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs py-1.5">
                    <Play size={12} className="fill-current" />
                    Resume in Problems
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="py-2 text-center">
              <p className="text-xs text-[var(--text-secondary)] mb-3">
                No recent problem yet. Start your journey with your first solved problem!
              </p>
              <Link to="/problems">
                <Button variant="primary" size="sm" className="gap-1 text-xs">
                  <Plus size={14} /> Add First Problem
                </Button>
              </Link>
            </div>
          )}
        </motion.div>
      </div>

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

        {/* Top topics & Radar strength chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-cyan-400 to-primary-500" />
              {topicChartType === 'bar' ? 'Top Topics' : 'Topic Strength Radar'}
            </h2>
            <div className="flex rounded-xl bg-[var(--bg-secondary)] p-1 border border-[var(--border)]">
              <button
                onClick={() => setTopicChartType('bar')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  topicChartType === 'bar'
                    ? 'bg-[var(--bg-card)] text-primary-500 shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                Bar
              </button>
              <button
                onClick={() => setTopicChartType('radar')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  topicChartType === 'radar'
                    ? 'bg-[var(--bg-card)] text-primary-500 shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                Radar
              </button>
            </div>
          </div>

          {topics.length === 0 ? (
            <EmptyState icon="empty" title="No topic data yet" description="Tag your problems with topics to see insights." />
          ) : topicChartType === 'bar' ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topics.slice(0, 8)} layout="vertical" margin={{ left: -10, right: 10, top: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="topic" width={72} tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Solved" fill="url(#barGrad)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="topic" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} tick={{ fill: 'var(--text-muted)', fontSize: 9 }} />
                <Radar name="Strength" dataKey="count" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* ── Weekly area chart ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="card p-4 sm:p-5"
      >
        <h2 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-gradient-to-b from-emerald-400 to-cyan-500" />
          Solved per Week (last 12 weeks)
        </h2>
        {weekly.length === 0 ? (
          <EmptyState icon="empty" title="No weekly data yet" description="Solve problems to see your progress over time." />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weekly} margin={{ left: -20, right: 6, top: 4, bottom: 0 }}>
              <defs>
                <linearGradient id={CHART_GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="weekStart"
                tick={{ fontSize: 9, fill: 'var(--text-muted)' }}
                interval={Math.ceil(weekly.length / 6) - 1}
                axisLine={false}
                tickLine={false}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
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
        className="card p-4 sm:p-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
          <h2 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-violet-400 to-pink-500" />
            Activity Heatmap {new Date().getFullYear()}
          </h2>
          <span className="sm:hidden text-[11px] text-[var(--text-muted)] italic">
            Swipe sideways to view year →
          </span>
        </div>
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
