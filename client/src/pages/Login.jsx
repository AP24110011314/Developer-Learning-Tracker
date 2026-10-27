import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import Logo from '../components/Logo.jsx';
import { Button } from '../components/ui/Button.jsx';

export default function Login() {
  useDocumentTitle('Sign in');
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      nav('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg-page)]">
      {/* Left panel — gradient */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-primary-600 via-violet-600 to-pink-500 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-16 left-16 w-64 h-64 rounded-full bg-white/20" />
          <div className="absolute bottom-16 right-16 w-96 h-96 rounded-full bg-white/10" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-white/15" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-12">
            <Logo size={40} />
            <span className="text-2xl font-extrabold">Big<span className="gradient-text">O</span></span>
          </div>
          <h2 className="text-4xl font-extrabold leading-tight mb-4">
            Track your<br />learning journey
          </h2>
          <p className="text-white/80 text-lg leading-relaxed">
            Log problems, set goals, track streaks,<br />
            and grow as a developer every day.
          </p>
        </div>
        <div className="relative text-sm text-white/60">
          BigO · Built for coders
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-sm space-y-6"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 justify-center mb-2">
            <Logo size={36} withText />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Welcome back</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">Sign in to continue your streak</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="login-email" className="block text-sm font-medium text-[var(--text-primary)]">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  id="login-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input pl-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="login-password" className="block text-sm font-medium text-[var(--text-primary)]">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button type="submit" size="lg" loading={loading} className="w-full justify-center">
              Sign in <ArrowRight size={16} />
            </Button>
          </form>

          <p className="text-center text-sm text-[var(--text-muted)]">
            No account?{' '}
            <Link to="/register" className="text-primary-500 hover:text-primary-600 font-semibold transition-colors">
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
