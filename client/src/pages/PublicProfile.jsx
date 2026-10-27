import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, Flame, Trophy, GitBranch, Globe } from 'lucide-react';
import api from '../api.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import Logo from '../components/Logo.jsx';
import Heatmap from '../components/Heatmap.jsx';
import { TopicTag } from '../components/ui/Badge.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';

export default function PublicProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState('loading');

  useDocumentTitle(status === 'ok' && profile ? profile.username : 'Profile');

  useEffect(() => {
    setStatus('loading');
    api
      .get(`/public/${username}`)
      .then(({ data }) => { setProfile(data); setStatus('ok'); })
      .catch((err) => {
        setStatus(err.response?.status === 404 ? 'notfound' : 'error');
      });
  }, [username]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] p-6 max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (status === 'notfound') {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center p-6">
        <div className="card p-10 text-center space-y-4 max-w-sm">
          <div className="text-6xl">👤</div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Profile not found</h1>
          <p className="text-sm text-[var(--text-secondary)]">This profile is private or doesn't exist.</p>
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-primary-500 font-semibold hover:underline">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center p-6">
        <p className="text-[var(--text-secondary)]">Something went wrong. Try again later.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)]">
      {/* Top nav */}
      <header className="glass sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link to="/" aria-label="BigO home">
          <Logo size={28} withText />
        </Link>
        <Link to="/login" className="text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors">
          Sign in
        </Link>
      </header>

      <div className="max-w-3xl mx-auto p-3.5 sm:p-5 md:p-6 space-y-4 sm:space-y-5">
        {/* Profile hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card overflow-hidden"
        >
          {/* Cover gradient */}
          <div className="h-20 sm:h-24 bg-gradient-to-br from-primary-500 via-violet-500 to-pink-500" />
          <div className="px-4 sm:px-6 pb-5 sm:pb-6">
            {/* Avatar */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white text-xl sm:text-2xl font-extrabold -mt-7 sm:-mt-8 border-4 border-[var(--bg-card)] shadow-xs">
              {profile.username[0].toUpperCase()}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] mt-3">@{profile.username}</h1>
            {profile.bio && <p className="text-sm text-[var(--text-secondary)] mt-1">{profile.bio}</p>}

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4 sm:mt-5">
              {[
                { icon: Code2, label: 'Solved', value: profile.stats.totalSolved },
                { icon: Flame, label: 'Current streak', value: `${profile.stats.currentStreak}d` },
                { icon: Trophy, label: 'Longest streak', value: `${profile.stats.longestStreak}d` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-xl bg-[var(--bg-input)] p-2.5 sm:p-3 text-center">
                  <div className="text-lg sm:text-xl font-extrabold text-[var(--text-primary)]">{value}</div>
                  <div className="text-[11px] sm:text-xs text-[var(--text-muted)] mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Top topics */}
        {profile.topTopics?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-5"
          >
            <h2 className="font-bold text-[var(--text-primary)] mb-3">Top Topics</h2>
            <div className="flex flex-wrap gap-2">
              {profile.topTopics.map((t) => (
                <div key={t.topic} className="flex items-center gap-1.5">
                  <TopicTag topic={t.topic} />
                  <span className="text-xs text-[var(--text-muted)]">×{t.count}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Activity heatmap */}
        {profile.heatmap && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="card p-5"
          >
            <h2 className="font-bold text-[var(--text-primary)] mb-4">
              Activity {profile.heatmapYear ? `(${profile.heatmapYear})` : ''}
            </h2>
            <Heatmap counts={profile.heatmap} year={profile.heatmapYear} />
          </motion.div>
        )}

        {/* Featured projects */}
        {profile.featuredProjects?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-5"
          >
            <h2 className="font-bold text-[var(--text-primary)] mb-4">Featured Projects</h2>
            <div className="space-y-3">
              {profile.featuredProjects.map((p) => (
                <div key={p._id} className="rounded-xl border border-[var(--border)] p-4 space-y-2 hover:border-primary-300 transition-colors">
                  <div className="font-semibold text-[var(--text-primary)]">⭐ {p.name}</div>
                  {p.description && <p className="text-sm text-[var(--text-secondary)]">{p.description}</p>}
                  <div className="flex gap-3">
                    {p.repoUrl && (
                      <a href={p.repoUrl} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-primary-500 transition-colors">
                        <GitBranch size={13} /> Repo
                      </a>
                    )}
                    {p.liveUrl && (
                      <a href={p.liveUrl} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-primary-500 transition-colors">
                        <Globe size={13} /> Live
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
