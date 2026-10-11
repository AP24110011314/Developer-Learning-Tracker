import * as service from '../services/problems.js';

export async function list(req, res, next) {
  try {
    const result = await service.listProblems(req.user.id, {
      difficulty: req.query.difficulty,
      topic: req.query.topic,
      status: req.query.status,
      from: req.query.from,
      to: req.query.to,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const doc = await service.createProblem(req.user.id, req.body);
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const doc = await service.getProblem(req.user.id, req.params.id);
    res.json(doc);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const doc = await service.updateProblem(req.user.id, req.params.id, req.body);
    res.json(doc);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    await service.deleteProblem(req.user.id, req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
}
