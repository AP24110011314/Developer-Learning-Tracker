import { describe, test, expect } from '@jest/globals';
import { computeStreaks, toDayKey, countByDay } from './streak.js';

describe('toDayKey groups by local day, not UTC', () => {
  test('a solve at 11:50 PM in New York belongs to the local day', () => {
    // 2026-03-09 23:50 in America/New_York (EDT, UTC-4) == 2026-03-10 03:50 UTC
    const solvedAt = new Date('2026-03-10T03:50:00Z');
    expect(toDayKey(solvedAt, 'America/New_York')).toBe('2026-03-09');
    // A naive UTC grouping would say 2026-03-10 — must not do that.
    expect(solvedAt.toISOString().slice(0, 10)).toBe('2026-03-10');
  });

  test('11:50 PM IST solve stays on the same local day', () => {
    // 2026-01-05 23:50 IST (UTC+5:30) == 2026-01-05 18:20 UTC
    const solvedAt = new Date('2026-01-05T18:20:00Z');
    expect(toDayKey(solvedAt, 'Asia/Kolkata')).toBe('2026-01-05');
  });
});

describe('computeStreaks', () => {
  const TZ = 'Asia/Kolkata';

  test('consecutive days across a late-night local solve form one streak', () => {
    const dates = [
      new Date('2026-01-04T18:20:00Z'), // Jan 4 23:50 IST
      new Date('2026-01-05T18:20:00Z'), // Jan 5 23:50 IST
      new Date('2026-01-06T10:00:00Z'), // Jan 6 15:30 IST
    ];
    const r = computeStreaks(dates, TZ, new Date('2026-01-06T16:00:00Z'));
    expect(r.longestStreak).toBe(3);
    expect(r.currentStreak).toBe(3);
    expect(r.totalActiveDays).toBe(3);
  });

  test('a gap day breaks the streak', () => {
    const dates = [
      new Date('2026-02-02T10:00:00Z'), // Mon
      new Date('2026-02-03T10:00:00Z'), // Tue
      // Wed skipped
      new Date('2026-02-05T10:00:00Z'), // Thu
    ];
    const r = computeStreaks(dates, TZ, new Date('2026-02-05T15:00:00Z'));
    expect(r.longestStreak).toBe(2);
    expect(r.currentStreak).toBe(1);
    expect(r.totalActiveDays).toBe(3);
  });

  test('current streak stays alive when today is empty but yesterday has a solve', () => {
    const dates = [new Date('2026-04-09T10:00:00Z')]; // one solve (Thu IST)
    const r = computeStreaks(dates, TZ, new Date('2026-04-10T10:00:00Z')); // Fri, no solve
    expect(r.currentStreak).toBe(1);
    expect(r.longestStreak).toBe(1);
  });

  test('current streak is 0 after two idle days', () => {
    const dates = [new Date('2026-04-09T10:00:00Z')];
    const r = computeStreaks(dates, TZ, new Date('2026-04-11T10:00:00Z')); // Sat, gap Fri+Sat
    expect(r.currentStreak).toBe(0);
    expect(r.longestStreak).toBe(1);
  });

  test('empty input gives zero streaks', () => {
    expect(computeStreaks([], TZ)).toEqual({ currentStreak: 0, longestStreak: 0, totalActiveDays: 0 });
  });

  test('multiple solves on the same local day count once', () => {
    const dates = [
      new Date('2026-05-01T02:00:00Z'),
      new Date('2026-05-01T08:00:00Z'),
      new Date('2026-05-01T14:00:00Z'),
    ];
    const r = computeStreaks(dates, TZ, new Date('2026-05-01T20:00:00Z'));
    expect(r).toEqual({ currentStreak: 1, longestStreak: 1, totalActiveDays: 1 });
  });
});

describe('countByDay', () => {
  test('aggregates solves per local day', () => {
    const dates = [new Date('2026-01-05T12:00:00Z'), new Date('2026-01-05T18:20:00Z')];
    expect(countByDay(dates, 'Asia/Kolkata')).toEqual({ '2026-01-05': 2 });
  });
});
