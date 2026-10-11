import { Goal } from '../models/Goal.js';
import { Problem } from '../models/Problem.js';
import { Project } from '../models/Project.js';
import { User } from '../models/User.js';
import { computeStreaks } from './streak.js';

function notFoundError(what) {
  const err = new Error(`${what} not found`);
  err.statusCode = 404;
  return err;
}

/** Progress is always computed on read from live data — never stored. */
export async function computeProgress(userId, goal) {
  let current = 0;
  if (goal.metric === 'problems') {
    const match = { user: goal.user, status: 'solved' };
    if (goal.filter?.difficulty) match.difficulty = goal.filter.difficulty;
    if (goal.filter?.topic) match.topics = goal.filter.topic;
    if (goal.startDate) match.solvedAt = { ...(match.solvedAt || {}), $gte: new Date(goal.startDate) };
    if (goal.deadline) match.solvedAt = { ...(match.solvedAt || {}), $lte: new Date(goal.deadline) };
    current = await Problem.countDocuments(match);
  } else if (goal.metric === 'streak') {
    const docs = await Problem.find({ user: goal.user, status: 'solved' }).select('solvedAt').lean();
    const user = await User.findById(userId).select('timezone').lean();
    current = computeStreaks(
      docs.map((d) => d.solvedAt),
      user?.timezone || 'Asia/Kolkata'
    ).currentStreak;
  } else if (goal.metric === 'projects') {
    current = await Project.countDocuments({ user: goal.user });
  }
  const percent = goal.target > 0 ? Math.min(100, Math.round((current / goal.target) * 100)) : 0;
  return { current, target: goal.target, percent };
}

export function withProgress(userId, goalDoc) {
  return computeProgress(userId, goalDoc).then((progress) => ({
    ...goalDoc,
    progress,
  }));
}

export async function listGoals(userId) {
  const goals = await Goal.find({ user: userId }).sort({ createdAt: -1 }).lean();
  return Promise.all(goals.map((g) => withProgress(userId, g)));
}

export async function createGoal(userId, data) {
  const doc = await Goal.create({ ...data, user: userId });
  return withProgress(userId, doc.toObject());
}

export async function getGoal(userId, id) {
  const doc = await Goal.findOne({ _id: id, user: userId }).lean();
  if (!doc) throw notFoundError('Goal');
  return withProgress(userId, doc);
}

export async function updateGoal(userId, id, data) {
  const doc = await Goal.findOneAndUpdate({ _id: id, user: userId }, data, {
    new: true,
    runValidators: true,
  }).lean();
  if (!doc) throw notFoundError('Goal');
  return withProgress(userId, doc);
}

export async function deleteGoal(userId, id) {
  const doc = await Goal.findOneAndDelete({ _id: id, user: userId }).lean();
  if (!doc) throw notFoundError('Goal');
  return doc;
}
