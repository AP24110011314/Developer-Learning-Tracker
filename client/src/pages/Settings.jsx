import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { User, Globe, Lock, Loader2, RefreshCw, Shield, Link2 } from 'lucide-react';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input, Textarea } from '../components/ui/Input.jsx';
import { Card, CardBody } from '../components/ui/Card.jsx';

function Section({ title, icon: Icon, description, children, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
      className="card"
    >
      <div className="h-1 bg-gradient-to-r from-primary-500 to-violet-500 rounded-t-2xl" />
      <div className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
            <Icon size={18} className="text-primary-500" />
          </div>
          <div>
            <h2 className="font-bold text-[var(--text-primary)]">{title}</h2>
            {description && <p className="text-xs text-[var(--text-muted)] mt-0.5">{description}</p>}
          </div>
        </div>
        {children}
      </div>
    </motion.div>
  );
}

export default function Settings() {
  const { user, refreshMe } = useAuth();
  const [form, setForm] = useState({
    bio: '', timezone: '', leetcode: '', codeforces: '',
    profilePublic: false, showHeatmap: true, showProjects: true,
  });
  const [stats, setStats] = useState([]);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(null);

  useEffect(() => {
    if (user) {
      setForm({
        bio: user.bio || '',
        timezone: user.timezone || 'Asia/Kolkata',
        leetcode: user.handles?.leetcode || '',
        codeforces: user.handles?.codeforces || '',
        profilePublic: !!user.privacy?.profilePublic,
        showHeatmap: user.privacy?.showHeatmap !== false,
        showProjects: user.privacy?.showProjects !== false,
      });
    }
    api.get('/sync/status').then(({ data }) => setStats(data)).catch(() => {});
  }, [user]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/auth/me', {
        bio: form.bio,
        timezone: form.timezone,
        handles: { leetcode: form.leetcode.trim(), codeforces: form.codeforces.trim() },
        privacy: { profilePublic: form.profilePublic, showHeatmap: form.showHeatmap, showProjects: form.showProjects },
      });
      await refreshMe();
      toast.success('Profile saved!');
    } catch (e2) {
      toast.error(e2.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const syncNow = async (platform) => {
    setSyncing(platform);
    try {
      const { data } = await api.post(`/sync/${platform}`);
      toast.success(`${platform}: imported ${data.imported} solved, ${data.newProblems} new.`);
      const { data: s } = await api.get('/sync/status');
      setStats(s);
    } catch (e) {
      if (e.response?.status === 429) toast.error(e.response.data.message);
      else toast.error(e.response?.data?.message || `${platform} sync failed`);
    } finally {
      setSyncing(null);
    }
  };

  const statFor = (platform) => stats.find((s) => s.platform === platform);

  function Toggle({ checked, onChange, id, label, description }) {
    return (
      <label htmlFor={id} className="flex items-center justify-between gap-4 py-2 cursor-pointer group">
        <div>
          <div className="text-sm font-medium text-[var(--text-primary)] group-hover:text-primary-500 transition-colors">{label}</div>
          {description && <div className="text-xs text-[var(--text-muted)]">{description}</div>}
        </div>
        <div
          id={id}
          role="switch"
          aria-checked={checked}
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onChange(!checked); } }}
          onClick={() => onChange(!checked)}
          className={`relative w-10 h-5 rounded-full shrink-0 transition-colors ${checked ? 'bg-primary-500' : 'bg-[var(--border-strong)]'}`}
        >
          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </div>
      </label>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Settings</h1>

      <Section title="Profile" icon={User} description="Update your bio and display info" index={0}>
        <form onSubmit={save} className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-input)] mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white text-xl font-bold">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-[var(--text-primary)]">{user?.username}</div>
              <div className="text-xs text-[var(--text-muted)]">{user?.email}</div>
            </div>
          </div>
          <Textarea
            id="settings-bio"
            label="Bio"
            placeholder="Tell the world about yourself…"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={2}
          />
          <Input
            id="settings-timezone"
            label="Timezone"
            placeholder="Asia/Kolkata"
            value={form.timezone}
            onChange={(e) => setForm({ ...form, timezone: e.target.value })}
            hint="IANA timezone string, e.g. America/New_York"
          />
          <Button type="submit" loading={saving}>Save profile</Button>
        </form>
      </Section>

      <Section title="Platform sync" icon={Link2} description="Link your competitive programming handles to auto-import solved problems" index={1}>
        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="settings-leetcode"
              label="LeetCode handle"
              placeholder="username or profile URL"
              value={form.leetcode}
              onChange={(e) => setForm({ ...form, leetcode: e.target.value })}
            />
            <Input
              id="settings-codeforces"
              label="Codeforces handle"
              placeholder="username or profile URL"
              value={form.codeforces}
              onChange={(e) => setForm({ ...form, codeforces: e.target.value })}
            />
          </div>
          <Button type="button" variant="secondary" size="sm" loading={saving} onClick={save}>Save handles</Button>
        </div>

        <div className="space-y-2">
          {['leetcode', 'codeforces'].map((p) => {
            const s = statFor(p);
            return (
              <div key={p} className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-input)]">
                <div>
                  <div className="text-sm font-semibold text-[var(--text-primary)] capitalize">{p}</div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {s
                      ? `${s.totalSolved} solved · rating ${s.rating ?? '—'} · last synced ${s.lastSyncedAt ? new Date(s.lastSyncedAt).toLocaleString() : 'never'}`
                      : 'Never synced'}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  loading={syncing === p}
                  disabled={syncing !== null}
                  onClick={() => syncNow(p)}
                >
                  <RefreshCw size={14} />
                  Sync
                </Button>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Privacy" icon={Shield} description={`Your public profile is at /u/${user?.username}`} index={2}>
        <div className="space-y-1 divide-y divide-[var(--border)]">
          <Toggle
            id="toggle-public"
            checked={form.profilePublic}
            onChange={(v) => setForm({ ...form, profilePublic: v })}
            label="Public profile"
            description="Anyone with the link can see your profile"
          />
          <Toggle
            id="toggle-heatmap"
            checked={form.showHeatmap}
            onChange={(v) => setForm({ ...form, showHeatmap: v })}
            label="Show activity heatmap"
            description="Display your coding activity on your public profile"
          />
          <Toggle
            id="toggle-projects"
            checked={form.showProjects}
            onChange={(v) => setForm({ ...form, showProjects: v })}
            label="Show featured projects"
            description="Display your featured projects on your public profile"
          />
        </div>
        <div className="mt-4">
          <Button size="sm" loading={saving} onClick={save}>Save privacy settings</Button>
        </div>
      </Section>
    </div>
  );
}
