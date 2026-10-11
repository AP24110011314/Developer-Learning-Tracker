import * as service from '../services/goals.js';

export async function list(req, res, next) {
  try {
    res.json(await service.listGoals(req.user.id));
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    res.status(201).json(await service.createGoal(req.user.id, req.body));
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    res.json(await service.getGoal(req.user.id, req.params.id));
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    res.json(await service.updateGoal(req.user.id, req.params.id, req.body));
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    await service.deleteGoal(req.user.id, req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
}
