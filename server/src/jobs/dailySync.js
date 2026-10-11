import cron from 'node-cron';
import { User } from '../models/User.js';
import { syncCodeforcesForUser, syncLeetcodeForUser } from '../services/sync.js';

/** Sync every user that has a handle saved. Failures are per-user and never throw. */
export async function runDailySync() {
  const users = await User.find({
    $or: [
      { 'handles.codeforces': { $exists: true, $ne: '' } },
      { 'handles.leetcode': { $exists: true, $ne: '' } },
    ],
  })
    .select('_id handles')
    .lean();

  let ok = 0;
  let failed = 0;
  for (const u of users) {
    if (u.handles?.codeforces) {
      try {
        await syncCodeforcesForUser(String(u._id));
        ok += 1;
      } catch (err) {
        failed += 1;
        console.error(`Daily sync (codeforces, user ${u._id}): ${err.message}`);
      }
    }
    if (u.handles?.leetcode) {
      try {
        await syncLeetcodeForUser(String(u._id));
        ok += 1;
      } catch (err) {
        failed += 1;
        console.error(`Daily sync (leetcode, user ${u._id}): ${err.message}`);
      }
    }
  }
  console.log(`Daily sync finished: ${ok} succeeded, ${failed} failed (${users.length} users).`);
  return { ok, failed, users: users.length };
}

export function startDailySync() {
  // Every day at 02:00 server time.
  cron.schedule('0 2 * * *', () => {
    runDailySync().catch((err) => console.error(`Daily sync crashed: ${err.message}`));
  });
  console.log('Daily sync job scheduled (02:00).');
}
