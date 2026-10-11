import { Problem } from '../models/Problem.js';

function notFoundError() {
  const err = new Error('Problem not found');
  err.statusCode = 404;
  return err;
}

export async function listProblems(userId, { difficulty, topic, status, from, to, page, limit }) {
  const filter = { user: userId };
  if (difficulty) filter.difficulty = difficulty;
  if (status) filter.status = status;
  if (topic) filter.topics = topic;
  if (from || to) {
    filter.solvedAt = {};
    if (from) filter.solvedAt.$gte = new Date(from);
    if (to) filter.solvedAt.$lte = new Date(to);
  }
  const pg = Math.max(1, page || 1);
  const lim = Math.min(100, Math.max(1, limit || 20));
  const skip = (pg - 1) * lim;

  const [items, total] = await Promise.all([
    Problem.find(filter).sort({ solvedAt: -1, createdAt: -1 }).skip(skip).limit(lim).lean(),
    Problem.countDocuments(filter),
  ]);

  return { items, page: pg, limit: lim, total, totalPages: Math.ceil(total / lim) };
}

export async function createProblem(userId, data) {
  const doc = await Problem.create({ ...data, user: userId });
  return doc.toObject();
}

export async function getProblem(userId, id) {
  const doc = await Problem.findOne({ _id: id, user: userId }).lean();
  if (!doc) throw notFoundError();
  return doc;
}

export async function updateProblem(userId, id, data) {
  const doc = await Problem.findOneAndUpdate({ _id: id, user: userId }, data, {
    new: true,
    runValidators: true,
  }).lean();
  if (!doc) throw notFoundError();
  return doc;
}

export async function deleteProblem(userId, id) {
  const doc = await Problem.findOneAndDelete({ _id: id, user: userId }).lean();
  if (!doc) throw notFoundError();
  return doc;
}
