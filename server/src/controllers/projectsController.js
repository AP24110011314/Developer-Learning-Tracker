import * as service from '../services/projects.js';

export async function list(req, res, next) {
  try {
    res.json(await service.listProjects(req.user.id));
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    res.status(201).json(await service.createProject(req.user.id, req.body));
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    res.json(await service.getProject(req.user.id, req.params.id));
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    res.json(await service.updateProject(req.user.id, req.params.id, req.body));
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    await service.deleteProject(req.user.id, req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
}
