import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Code2,
  Flame,
  Target,
  Sparkles,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Zap,
  Shield,
  Layers,
  Award,
  BookOpen,
} from 'lucide-react';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import Logo from '../components/Logo.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';

export default function Landing() {
  useDocumentTitle('');

  const features = [
    {
      icon: Code2,
      title: 'Problem Logging',
      description: 'Track LeetCode, Codeforces, HackerRank, and custom problems with status, topics, and difficulties.',
      gradient: 'from-primary-500 to-violet-500',
    },
    {
      icon: Flame,
      title: 'Streak & Heatmap',
      description: 'Build consistency with GitHub-style activity heatmaps and automatic daily streak calculation.',
      gradient: 'from-orange-500 to-rose-500',
    },
    {
      icon: BarChart3,
      title: 'Deep Analytics',
      description: 'Visualize your progress with topic radar charts, difficulty distributions, and weekly velocity.',
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      icon: Target,
      title: 'Goal Milestones',
      description: 'Set custom targets for problem counts, topics, or streak lengths with real-time progress tracking.',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Zap,
      title: 'Auto Profile Sync',
      description: 'Sync your solved statistics automatically from LeetCode and Codeforces profile handles.',
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      icon: Award,
      title: 'XP & Achievements',
      description: 'Earn badges, level up, and unlock rewards as you conquer algorithmic challenges.',
      gradient: 'from-pink-500 to-violet-500',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200">
      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-[var(--bg-card)]/80 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" aria-label="BigO home">
            <Logo size={40} withText />
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">
                Get Started
                <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-24 md:pb-28">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[600px] h-[340px] sm:h-[600px] bg-gradient-to-tr from-primary-500/20 to-pink-500/20 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-600 text-xs font-semibold mb-6">
              <Sparkles size={14} />
              The All-in-One Developer Growth Platform
            </div>

            <div className="flex justify-center mb-6">
              <Logo size={72} />
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] mb-4">
              Track your coding problems.{' '}
              <span className="bg-gradient-to-r from-primary-500 via-violet-500 to-pink-500 bg-clip-text text-transparent">
                Master your craft.
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg sm:text-xl font-semibold text-[var(--text-primary)] mb-2">
              Code daily. Track everything. Share your journey.
            </p>

            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-[var(--text-secondary)] font-normal mb-8">
              Organize algorithms, analyze difficulty breakdowns, monitor daily streaks, and stay accountable across LeetCode, Codeforces, and personal projects.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto text-base px-8 py-3.5 shadow-lg shadow-primary-500/30">
                  Start Tracking Free
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-3.5">
                  Sign In to Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* ── Mock Dashboard Preview ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-14 relative rounded-3xl p-2 sm:p-4 bg-gradient-to-b from-primary-500/20 via-pink-500/10 to-transparent border border-[var(--border)] shadow-2xl backdrop-blur-sm"
          >
            <div className="rounded-2xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border)] p-3.5 sm:p-6 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[var(--border)] pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="ml-2 text-xs font-semibold text-[var(--text-muted)]">
                    Dashboard Preview
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="emerald">Live Tracking</Badge>
                  <Badge variant="indigo">28-Day Streak 🔥</Badge>
                </div>
              </div>

              {/* Sample Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-5">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-500/10 to-violet-500/10 border border-primary-500/20">
                  <span className="text-xs text-[var(--text-muted)] font-medium">Total Solved</span>
                  <div className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">342</div>
                  <span className="text-xs text-emerald-500 font-semibold">+14 this week</span>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500/10 to-rose-500/10 border border-orange-500/20">
                  <span className="text-xs text-[var(--text-muted)] font-medium">Current Streak</span>
                  <div className="text-2xl font-extrabold text-orange-500 mt-1">28 days</div>
                  <span className="text-xs text-[var(--text-muted)]">🔥 Personal best!</span>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                  <span className="text-xs text-[var(--text-muted)] font-medium">Easy / Med / Hard</span>
                  <div className="text-2xl font-extrabold text-[var(--text-primary)] mt-1">112 / 184 / 46</div>
                  <span className="text-xs text-primary-500 font-semibold">Balanced focus</span>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                  <span className="text-xs text-[var(--text-muted)] font-medium">Weekly Goal</span>
                  <div className="text-2xl font-extrabold text-cyan-500 mt-1">92%</div>
                  <span className="text-xs text-[var(--text-muted)]">11 of 12 completed</span>
                </div>
              </div>

              {/* Activity Bar Preview */}
              <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                <div className="flex items-center justify-between text-xs font-semibold mb-3">
                  <span className="text-[var(--text-secondary)]">Recent Activity & Heatmap</span>
                  <span className="text-primary-500 font-medium">Continuous consistency</span>
                </div>
                <div className="flex gap-1.5 overflow-x-auto py-1">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-3.5 h-3.5 rounded-sm flex-shrink-0"
                      style={{
                        backgroundColor:
                          i % 5 === 0 ? '#10b981' : i % 3 === 0 ? '#34d399' : i % 2 === 0 ? '#6ee7b7' : 'var(--border)',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features Grid ──────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-[var(--bg-secondary)] border-y border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              Engineered for ambitious developers
            </h2>
            <p className="text-[var(--text-secondary)] text-base sm:text-lg">
              Everything you need to master interview prep, track your algorithmic breakthroughs, and stay disciplined every day.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="card p-6 relative overflow-hidden group hover:border-primary-500/40 transition-colors"
              >
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-white mb-5 shadow-md shadow-primary-500/20 group-hover:scale-110 transition-transform`}
                >
                  <f.icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {f.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Call To Action ─────────────────────────────────────────── */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-primary-500 via-violet-500 to-pink-500 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/10" />

            <h2 className="text-3xl sm:text-4xl font-black mb-4">
              Level up your problem solving today
            </h2>
            <p className="text-white/80 text-base sm:text-lg max-w-xl mx-auto mb-8">
              Join developers building consistency, staying motivated, and crushing their technical goals.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-white text-primary-600 hover:bg-white/90 font-bold px-8 py-3.5 shadow-lg shadow-black/20"
                >
                  Create Your Free Account
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-6 py-3 rounded-xl border border-white/30 text-white font-medium hover:bg-white/10 transition-colors text-sm">
                  Already have an account? Sign In
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--border)] py-8 text-center text-xs text-[var(--text-muted)]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo size={24} withText />
          </div>
          <div>© {new Date().getFullYear()} BigO. Built with React, Vite & Tailwind.</div>
        </div>
      </footer>
    </div>
  );
}
