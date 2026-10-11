import { Project } from '../models/Project.js';

function notFoundError() {
  const err = new Error('Project not found');
  err.statusCode = 404;
  return err;
}

export async function listProjects(userId) {
  return Project.find({ user: userId }).sort({ createdAt: -1 }).lean();
}

export async function createProject(userId, data) {
  const doc = await Project.create({ ...data, user: userId });
  return doc.toObject();
}

export async function getProject(userId, id) {
  const doc = await Project.findOne({ _id: id, user: userId }).lean();
  if (!doc) throw notFoundError();
  return doc;
}

export async function updateProject(userId, id, data) {
  const doc = await Project.findOneAndUpdate({ _id: id, user: userId }, data, {
    new: true,
    runValidators: true,
  }).lean();
  if (!doc) throw notFoundError();
  return doc;
}

export async function deleteProject(userId, id) {
  const doc = await Project.findOneAndDelete({ _id: id, user: userId }).lean();
  if (!doc) throw notFoundError();
  return doc;
}
