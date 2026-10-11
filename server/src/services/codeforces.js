import axios from 'axios';

const CF_API = 'https://codeforces.com/api';
const TIMEOUT_MS = 10000;

const cf = axios.create({ baseURL: CF_API, timeout: TIMEOUT_MS });

function cfError(err, handle) {
  const comment = err.response?.data?.comment || err.message;
  const e = new Error(`Codeforces sync failed for "${handle}": ${comment}`);
  // Handle-not-found and bad responses are client errors, not server crashes.
  e.statusCode = err.response?.status === 400 || /not found|no such handle/i.test(comment) ? 400 : 502;
  return e;
}

/** Pure mapper — exported for unit tests. */
export function mapSubmissionToProblem(sub) {
  const contestId = sub.contestId ?? 'unknown';
  const index = sub.problem?.index ?? '?';
  const rating = sub.problem?.rating;
  const difficulty = rating == null ? 'medium' : rating < 1200 ? 'easy' : rating < 1800 ? 'medium' : 'hard';
  return {
    platform: 'codeforces',
    externalId: `${contestId}-${index}`,
    title: `${contestId}${index} ${sub.problem?.name || 'Unknown'}`,
    url: sub.contestId ? `https://codeforces.com/problemset/problem/${contestId}/${index}` : '',
    difficulty,
    topics: sub.problem?.tags || [],
    status: 'solved',
    solvedAt: new Date(sub.creationTimeSeconds * 1000),
    source: 'sync',
  };
}

export async function fetchCodeforces(handle) {
  let info;
  let status;
  try {
    const [infoRes, statusRes] = await Promise.all([
      cf.get('/user.info', { params: { handles: handle } }),
      cf.get('/user.status', { params: { handle, from: 1, count: 100 } }),
    ]);
    if (infoRes.data?.status !== 'OK') throw new Error(infoRes.data?.comment || 'user.info failed');
    if (statusRes.data?.status !== 'OK') throw new Error(statusRes.data?.comment || 'user.status failed');
    info = infoRes.data.result[0];
    status = statusRes.data.result;
  } catch (err) {
    throw cfError(err, handle);
  }

  // Rating history is best-effort only — never fail the sync over it.
  let ratingHistory = [];
  try {
    const r = await cf.get('/user.rating', { params: { handle } });
    if (r.data?.status === 'OK') ratingHistory = r.data.result;
  } catch {
    ratingHistory = [];
  }

  // Dedupe accepted submissions per problem, keeping the earliest solve.
  const byProblem = new Map();
  for (const sub of status) {
    if (sub.verdict !== 'OK' || !sub.problem) continue;
    const key = `${sub.contestId}-${sub.problem.index}`;
    const prev = byProblem.get(key);
    if (!prev || sub.creationTimeSeconds < prev.creationTimeSeconds) byProblem.set(key, sub);
  }
  const problems = [...byProblem.values()].map(mapSubmissionToProblem);

  return {
    problems,
    stats: {
      rating: info.rating,
      maxRating: info.maxRating ?? (ratingHistory.length ? Math.max(...ratingHistory.map((x) => x.newRating)) : undefined),
      totalSolved: problems.length,
      contests: ratingHistory.length,
    },
  };
}
