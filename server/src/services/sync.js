import { Problem } from '../models/Problem.js';
import { PlatformStats } from '../models/PlatformStats.js';
import { User } from '../models/User.js';
import { fetchCodeforces } from './codeforces.js';
import { fetchLeetcode } from './leetcode.js';
import { normalizeHandle } from './handles.js';

/** Upsert synced problems so reruns never create duplicates. */
async function upsertProblems(userId, problems) {
  if (problems.length === 0) return { upserted: 0 };
  const ops = problems.map((p) => ({
    updateOne: {
      filter: { user: userId, platform: p.platform, externalId: p.externalId },
      update: { $setOnInsert: { ...p, user: userId } },
      upsert: true,
    },
  }));
  const res = await Problem.bulkWrite(ops, { ordered: false });
  return { upserted: res.upsertedCount };
}

async function saveStats(userId, platform, stats, problems) {
  const byDifficulty = { easy: 0, medium: 0, hard: 0 };
  for (const p of problems) {
    if (byDifficulty[p.difficulty] !== undefined) byDifficulty[p.difficulty] += 1;
  }
  return PlatformStats.findOneAndUpdate(
    { user: userId, platform },
    {
      $set: {
        rating: stats.rating,
        maxRating: stats.maxRating,
        totalSolved: stats.totalSolved ?? problems.length,
        // Prefer the platform's own totals when available (LeetCode),
        // which cover more than the recent-submission window we import.
        byDifficulty: stats.byDifficulty || byDifficulty,
        lastSyncedAt: new Date(),
      },
    },
    { new: true, upsert: true }
  ).lean();
}

async function handleOf(userId, key) {
  const user = await User.findById(userId).select('handles').lean();
  const handle = normalizeHandle(key, user?.handles?.[key]);
  if (!handle) {
    const err = new Error(`No ${key} handle saved. Add it in Settings first.`);
    err.statusCode = 400;
    throw err;
  }
  return handle;
}

export async function syncCodeforcesForUser(userId) {
  const handle = await handleOf(userId, 'codeforces');
  const { problems, stats } = await fetchCodeforces(handle);
  const { upserted } = await upsertProblems(userId, problems);
  const platformStats = await saveStats(userId, 'codeforces', stats, problems);
  return { platform: 'codeforces', handle, imported: problems.length, newProblems: upserted, stats: platformStats };
}

export async function syncLeetcodeForUser(userId) {
  const handle = await handleOf(userId, 'leetcode');
  const { problems, stats } = await fetchLeetcode(handle);
  const { upserted } = await upsertProblems(userId, problems);
  const platformStats = await saveStats(userId, 'leetcode', stats, problems);
  return { platform: 'leetcode', handle, imported: problems.length, newProblems: upserted, stats: platformStats };
}

export async function getSyncStatus(userId) {
  return PlatformStats.find({ user: userId }).lean();
}
