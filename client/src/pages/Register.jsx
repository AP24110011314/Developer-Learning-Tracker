import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AtSign, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import Logo from '../components/Logo.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Button } from '../components/ui/Button.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { Sun, Moon } from 'lucide-react';

const FEATURES = [
  'Track problems across platforms',
  'Streak tracking & analytics',
  'Goal setting & progress rings',
  'Public developer profile',
];

export default function Register() {
  useDocumentTitle('Create account');
  const { register } = useAuth();
  const { theme, toggle } = useTheme();
  const nav = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      nav('/', { replace: true });
    } catch (err) {
      const data = err.response?.data;
      const details = data?.errors
        ? Object.values(data.errors).flat().filter((m) => typeof m === 'string').join('; ')
        : '';
      setError(details || data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg-page)]">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-violet-600 via-primary-600 to-cyan-500 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-16 right-16 w-64 h-64 rounded-full bg-white/20" />
          <div className="absolute bottom-16 left-16 w-96 h-96 rounded-full bg-white/10" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-12">
            <Logo size={40} />
            <span className="text-2xl font-extrabold">Big<span className="gradient-text">O</span></span>
          </div>
          <h2 className="text-4xl font-extrabold leading-tight mb-4">
            Start your<br />coding journey
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Join thousands of developers who track their coding journey with BigO.
          </p>
          <ul className="space-y-3">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-white/90 shrink-0" />
                <span className="text-white/90">{f}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative text-sm text-white/60">
          Free forever · No credit card required
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <div className="absolute top-4 right-4">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="p-2.5 rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-input)] transition-colors"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-sm space-y-6"
        >
          <div className="lg:hidden flex items-center gap-2 justify-center mb-2">
            <Logo size={36} withText />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Create an account</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">Start tracking your progress today</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            <Input
              id="reg-username"
              label="Username"
              required
              placeholder="devhero"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              icon={AtSign}
              hint="Letters, numbers, _ only. 3–30 characters."
            />

            <Input
              id="reg-email"
              label="Email"
              type="email"
              required
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              icon={Mail}
            />

            <Input
              id="reg-password"
              label="Password"
              type={showPw ? 'text' : 'password'}
              required
              minLength={8}
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              icon={Lock}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <Button type="submit" size="lg" loading={loading} className="w-full justify-center">
              Create account <ArrowRight size={16} />
            </Button>
          </form>

          <p className="text-center text-sm text-[var(--text-muted)]">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-500 hover:text-primary-600 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
