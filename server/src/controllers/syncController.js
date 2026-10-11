import rateLimit from 'express-rate-limit';
import * as service from '../services/sync.js';

const syncLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many sync requests, please try again later.' },
});

export function withSyncLimiter() {
  return syncLimiter;
}

export async function syncNow(req, res, next) {
  try {
    const { platform } = req.params;
    const result =
      platform === 'codeforces'
        ? await service.syncCodeforcesForUser(req.user.id)
        : await service.syncLeetcodeForUser(req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function status(req, res, next) {
  try {
    res.json(await service.getSyncStatus(req.user.id));
  } catch (err) {
    next(err);
  }
}
