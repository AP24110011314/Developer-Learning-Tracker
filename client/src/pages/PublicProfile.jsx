import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api.js';
import Heatmap from '../components/Heatmap.jsx';

export default function PublicProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    setStatus('loading');
    // Public endpoint — works with or without a login token.
    api
      .get(`/public/${username}`)
      .then(({ data }) => {
        setProfile(data);
        setStatus('ok');
      })
      .catch((err) => {
        setStatus(err.response?.status === 404 ? 'notfound' : 'error');
      });
  }, [username]);

  if (status === 'loading') return <div className="p-8">Loading…</div>;
  if (status === 'notfound')
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded shadow text-center space-y-3">
          <h1 className="text-xl font-bold">Profile not found</h1>
          <p className="text-sm text-gray-500">This profile is private or doesn’t exist.</p>
          <Link to="/" className="underline text-sm">Go home</Link>
        </div>
      </div>
    );
  if (status === 'error') return <div className="p-8">Something went wrong. Try again later.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-bold">DLT</Link>
        <Link to="/login" className="text-sm underline">Log in</Link>
      </header>
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <div className="bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold">@{profile.username}</h1>
          {profile.bio && <p className="text-sm text-gray-600 mt-1">{profile.bio}</p>}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              ['Solved', profile.stats.totalSolved],
              ['Current streak', `${profile.stats.currentStreak}d`],
              ['Longest streak', `${profile.stats.longestStreak}d`],
            ].map(([label, value]) => (
              <div key={label} className="bg-gray-50 p-3 rounded text-center">
                <div className="text-xl font-bold">{value}</div>
                <div className="text-xs text-gray-500">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold mb-2">Top topics</h2>
          {profile.topTopics?.length ? (
            <div className="flex flex-wrap gap-2">
              {profile.topTopics.map((t) => (
                <span key={t.topic} className="text-sm bg-gray-100 px-3 py-1 rounded">
                  {t.topic} × {t.count}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No topic data.</p>
          )}
        </div>

        {profile.heatmap && (
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-bold mb-2">Activity {profile.heatmapYear ? `(${profile.heatmapYear})` : ''}</h2>
            <Heatmap counts={profile.heatmap} year={profile.heatmapYear} />
          </div>
        )}

        {profile.featuredProjects && (
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-bold mb-2">Featured projects</h2>
            {profile.featuredProjects.length === 0 ? (
              <p className="text-sm text-gray-500">No featured projects.</p>
            ) : (
              <div className="space-y-3">
                {profile.featuredProjects.map((p) => (
                  <div key={p._id} className="border p-3 rounded">
                    <div className="font-bold">⭐ {p.name}</div>
                    {p.description && <p className="text-sm text-gray-600">{p.description}</p>}
                    <div className="flex gap-3 text-sm mt-1">
                      {p.repoUrl && <a className="underline" href={p.repoUrl} target="_blank" rel="noreferrer">Repo</a>}
                      {p.liveUrl && <a className="underline" href={p.liveUrl} target="_blank" rel="noreferrer">Live</a>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
