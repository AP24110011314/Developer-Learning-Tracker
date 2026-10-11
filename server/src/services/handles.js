const CF_PROFILE_RE = /codeforces\.com\/profile\/([^/?#]+)/i;
const LC_PROFILE_RE = /leetcode\.com\/(?:u\/)?([^/?#]+)/i;
const LC_HAS_U_PREFIX = /leetcode\.com\/u\//i;

// First path segments that are LeetCode site sections, never usernames.
const LC_RESERVED = new Set([
  'problems', 'problemset', 'contest', 'contests', 'discuss', 'explore',
  'study', 'interview', 'assessment', 'submissions', 'articles',
  'playground', 'certificates', 'u',
]);

/**
 * Accept either a bare handle or a pasted profile URL and return the handle.
 * Pure function — safe to use on save and at sync time.
 */
export function normalizeHandle(platform, raw) {
  let h = String(raw ?? '').trim().replace(/^@+/, '');
  if (!h) return '';
  if (platform === 'codeforces') {
    const m = h.match(CF_PROFILE_RE);
    return m ? m[1] : h;
  }
  if (platform === 'leetcode') {
    const m = h.match(LC_PROFILE_RE);
    if (m && (LC_HAS_U_PREFIX.test(h) || !LC_RESERVED.has(m[1].toLowerCase()))) {
      return m[1];
    }
    return h;
  }
  return h;
}
