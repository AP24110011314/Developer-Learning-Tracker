import * as service from '../services/stats.js';

export async function overview(req, res, next) {
  try {
    res.json(await service.getOverview(req.user.id));
  } catch (err) {
    next(err);
  }
}

export async function heatmap(req, res, next) {
  try {
    res.json(await service.getHeatmap(req.user.id, req.query.year ? Number(req.query.year) : undefined));
  } catch (err) {
    next(err);
  }
}

export async function topics(req, res, next) {
  try {
    res.json(await service.getTopics(req.user.id));
  } catch (err) {
    next(err);
  }
}

export async function weekly(req, res, next) {
  try {
    res.json(await service.getWeekly(req.user.id, req.query.weeks ? Number(req.query.weeks) : 12));
  } catch (err) {
    next(err);
  }
}

export async function difficulty(req, res, next) {
  try {
    res.json(await service.getDifficulty(req.user.id));
  } catch (err) {
    next(err);
  }
}
