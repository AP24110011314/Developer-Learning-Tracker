import axios from 'axios';

const LC_GRAPHQL = 'https://leetcode.com/graphql';
const TIMEOUT_MS = 10000;

const lc = axios.create({
  baseURL: LC_GRAPHQL,
  timeout: TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json', Referer: 'https://leetcode.com' },
});

const PROFILE_QUERY = `
  query($username: String!) {
    matchedUser(username: $username) {
      username
      submitStatsGlobal {
        acSubmissionNum { difficulty count }
      }
    }
    recentAcSubmissionList(username: $username, limit: 20) {
      id
      title
      titleSlug
      timestamp
    }
  }
`;

const QUESTION_QUERY = `
  query($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      difficulty
      topicTags { name }
    }
  }
`;

function lcError(err, handle) {
  const e = new Error(
    `LeetCode sync is temporarily unavailable for "${handle}". Your manually logged problems are unaffected — please try again later.`
  );
  e.statusCode = 502;
  e.cause = err;
  return e;
}

async function questionDetail(slug) {
  try {
    const { data } = await lc.post('', { query: QUESTION_QUERY, variables: { titleSlug: slug } });
    return data?.data?.question || null;
  } catch {
    return null;
  }
}

/** Pure mapper — exported for unit tests. */
export function mapEntryToProblem(entry, detail) {
  const diff = (detail?.difficulty || 'Medium').toLowerCase();
  return {
    platform: 'leetcode',
    externalId: entry.titleSlug,
    title: entry.title,
    url: `https://leetcode.com/problems/${entry.titleSlug}/`,
    difficulty: diff === 'easy' ? 'easy' : diff === 'hard' ? 'hard' : 'medium',
    topics: (detail?.topicTags || []).map((t) => t.name).filter(Boolean),
    status: 'solved',
    solvedAt: new Date(Number(entry.timestamp) * 1000),
    source: 'sync',
  };
}

export async function fetchLeetcode(handle) {
  let payload;
  try {
    const { data } = await lc.post('', { query: PROFILE_QUERY, variables: { username: handle } });
    payload = data?.data;
    if (!payload?.matchedUser) throw new Error('user not found');
  } catch (err) {
    throw lcError(err, handle);
  }

  const entries = payload.recentAcSubmissionList || [];
  // Detail lookups are best-effort and bounded — a failure just falls back
  // to medium difficulty, and never fails the whole sync.
  const details = await Promise.all(entries.slice(0, 15).map((e) => questionDetail(e.titleSlug)));
  const problems = entries.slice(0, 15).map((e, i) => mapEntryToProblem(e, details[i]));

  const byDifficulty = { easy: 0, medium: 0, hard: 0 };
  for (const n of payload.matchedUser.submitStatsGlobal?.acSubmissionNum || []) {
    const k = String(n.difficulty || '').toLowerCase();
    // LeetCode uses "All" plus Easy/Medium/Hard rows.
    if (k === 'easy') byDifficulty.easy = n.count;
    else if (k === 'medium') byDifficulty.medium = n.count;
    else if (k === 'hard') byDifficulty.hard = n.count;
  }
  const totalSolved =
    byDifficulty.easy + byDifficulty.medium + byDifficulty.hard ||
    problems.length;

  return { problems, stats: { totalSolved, byDifficulty } };
}
