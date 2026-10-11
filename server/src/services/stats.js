import mongoose from 'mongoose';
import { Problem } from '../models/Problem.js';
import { User } from '../models/User.js';
import { computeStreaks, countByDay, toDayKey, shiftDay, weekdayOf } from './streak.js';

async function getTimezone(userId) {
  const user = await User.findById(userId).select('timezone').lean();
  return user?.timezone || 'Asia/Kolkata';
}

async function solvedDates(userId) {
  const docs = await Problem.find({ user: userId, status: 'solved' }).select('solvedAt').lean();
  return docs.map((d) => d.solvedAt);
}

export async function getOverview(userId, now = new Date()) {
  const tz = await getTimezone(userId);
  const dates = await solvedDates(userId);
  const { currentStreak, longestStreak } = computeStreaks(dates, tz, now);

  // This-week count: Monday 00:00 (user tz) through now.
  const todayKey = toDayKey(now, tz);
  let monday = todayKey;
  while (weekdayOf(monday, tz) !== 'Mon') monday = shiftDay(monday, -1);
  const counts = countByDay(dates, tz);
  let thisWeek = 0;
  for (let d = monday; d <= todayKey; d = shiftDay(d, 1)) {
    thisWeek += counts[d] || 0;
  }

  return {
    totalSolved: dates.length,
    currentStreak,
    longestStreak,
    thisWeek,
    timezone: tz,
  };
}

export async function getHeatmap(userId, year) {
  const tz = await getTimezone(userId);
  const y = year || Number(toDayKey(new Date(), tz).slice(0, 4));
  const from = new Date(Date.UTC(y, 0, 1));
  const to = new Date(Date.UTC(y + 1, 0, 1));
  const docs = await Problem.find({
    user: userId,
    status: 'solved',
    solvedAt: { $gte: from, $lt: to },
  })
    .select('solvedAt')
    .lean();
  return { year: y, timezone: tz, counts: countByDay(docs.map((d) => d.solvedAt), tz) };
}

export async function getTopics(userId, limit = 20) {
  const rows = await Problem.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId), status: 'solved' } },
    { $unwind: '$topics' },
    { $group: { _id: '$topics', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);
  return rows.map((r) => ({ topic: r._id, count: r.count }));
}

export async function getDifficulty(userId) {
  const rows = await Problem.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId), status: 'solved' } },
    { $group: { _id: '$difficulty', count: { $sum: 1 } } },
  ]);
  const out = { easy: 0, medium: 0, hard: 0 };
  for (const r of rows) out[r._id] = r.count;
  return out;
}

export async function getWeekly(userId, weeks = 12, now = new Date()) {
  const tz = await getTimezone(userId);
  const dates = await solvedDates(userId);
  const counts = countByDay(dates, tz);

  const todayKey = toDayKey(now, tz);
  let monday = todayKey;
  while (weekdayOf(monday, tz) !== 'Mon') monday = shiftDay(monday, -1);

  const result = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const start = shiftDay(monday, -7 * w);
    let count = 0;
    for (let i = 0; i < 7; i++) count += counts[shiftDay(start, i)] || 0;
    result.push({ weekStart: start, count });
  }
  return { weeks: result, timezone: tz };
}
