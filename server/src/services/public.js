import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { getOverview, getHeatmap, getTopics, getDifficulty } from './stats.js';

function hidden() {
  const err = new Error('Profile not found');
  err.statusCode = 404;
  return err;
}

/** Public profile — never leaks email, passwordHash, or timezone. */
export async function getPublicProfile(username, year) {
  const user = await User.findOne({ username }).lean();
  if (!user || !user.privacy?.profilePublic) throw hidden();

  const userId = String(user._id);
  const [overview, topics, difficulty] = await Promise.all([
    getOverview(userId),
    getTopics(userId, 10),
    getDifficulty(userId),
  ]);

  const profile = {
    username: user.username,
    bio: user.bio || '',
    avatar: user.avatar || '',
    handles: user.handles || {},
    stats: {
      totalSolved: overview.totalSolved,
      currentStreak: overview.currentStreak,
      longestStreak: overview.longestStreak,
    },
    topTopics: topics,
    byDifficulty: difficulty,
  };

  if (user.privacy?.showHeatmap) {
    const heatmap = await getHeatmap(userId, year);
    profile.heatmap = heatmap.counts;
    profile.heatmapYear = heatmap.year;
  }

  if (user.privacy?.showProjects) {
    profile.featuredProjects = await Project.find({ user: user._id, featured: true })
      .select('name description stack repoUrl liveUrl status learnings')
      .sort({ createdAt: -1 })
      .lean();
  }

  return profile;
}
