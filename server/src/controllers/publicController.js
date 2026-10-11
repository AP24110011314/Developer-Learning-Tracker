import * as service from '../services/public.js';

export async function show(req, res, next) {
  try {
    res.json(await service.getPublicProfile(req.params.username, req.query.year ? Number(req.query.year) : undefined));
  } catch (err) {
    next(err);
  }
}
