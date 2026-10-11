// Timezone-aware streak computation.
// Streaks are NEVER stored — always derived from Problem.solvedAt,
// grouped by calendar day in the user's timezone.

const DAY_MS = 24 * 60 * 60 * 1000;

export function toDayKey(date, timeZone) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));
}

export function weekdayOf(dayKey, timeZone) {
  // 'Mon'..'Sun' short names in the given zone (noon UTC avoids date-edge issues)
  return new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short' }).format(
    new Date(`${dayKey}T12:00:00Z`)
  );
}

export function shiftDay(dayKey, deltaDays) {
  const ms = Date.parse(`${dayKey}T00:00:00Z`) + deltaDays * DAY_MS;
  return new Date(ms).toISOString().slice(0, 10);
}

function dayDiff(aKey, bKey) {
  return Math.round((Date.parse(`${bKey}T00:00:00Z`) - Date.parse(`${aKey}T00:00:00Z`)) / DAY_MS);
}

/**
 * @param {Array<Date|string>} dates - solve timestamps (Problem.solvedAt values)
 * @param {string} timeZone - IANA zone, e.g. "Asia/Kolkata"
 * @param {Date|string} [now] - reference point for "current" streak (defaults to now)
 * @returns {{currentStreak:number, longestStreak:number, totalActiveDays:number}}
 */
export function computeStreaks(dates, timeZone = 'Asia/Kolkata', now = new Date()) {
  const days = new Set();
  for (const d of dates || []) {
    if (d == null) continue;
    days.add(toDayKey(d, timeZone));
  }
  if (days.size === 0) return { currentStreak: 0, longestStreak: 0, totalActiveDays: 0 };

  const sorted = [...days].sort();
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    run = dayDiff(sorted[i - 1], sorted[i]) === 1 ? run + 1 : 1;
    if (run > longest) longest = run;
  }

  // Current streak: consecutive days ending today. If today is empty but
  // yesterday has activity, the streak is still alive (counts from yesterday).
  const todayKey = toDayKey(now, timeZone);
  let cursor = days.has(todayKey) ? todayKey : shiftDay(todayKey, -1);
  let current = 0;
  while (days.has(cursor)) {
    current += 1;
    cursor = shiftDay(cursor, -1);
  }

  return { currentStreak: current, longestStreak: longest, totalActiveDays: days.size };
}

/** Group solve timestamps into per-local-day counts: { "YYYY-MM-DD": n } */
export function countByDay(dates, timeZone = 'Asia/Kolkata') {
  const counts = {};
  for (const d of dates || []) {
    if (d == null) continue;
    const key = toDayKey(d, timeZone);
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}
