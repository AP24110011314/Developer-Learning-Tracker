// Per-user sync cooldown: one sync per platform every few minutes.
// (In-memory; a restart simply resets the cooldowns.)
const lastSync = new Map();
export const SYNC_COOLDOWN_MS = 3 * 60 * 1000;

export function syncCooldown(req, res, next) {
  const key = `${req.user.id}:${req.params.platform}`;
  const prev = lastSync.get(key);
  const now = Date.now();
  if (prev && now - prev < SYNC_COOLDOWN_MS) {
    const waitSec = Math.ceil((SYNC_COOLDOWN_MS - (now - prev)) / 1000);
    return res.status(429).json({ message: `Sync cooldown: try again in ${waitSec}s.` });
  }
  lastSync.set(key, now);
  next();
}

export function clearSyncCooldown() {
  lastSync.clear();
}
