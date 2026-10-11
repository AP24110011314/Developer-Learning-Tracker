import { normalizeHandle } from './handles.js';

describe('normalizeHandle', () => {
  test('bare handles pass through untouched', () => {
    expect(normalizeHandle('codeforces', 'tourist')).toBe('tourist');
    expect(normalizeHandle('leetcode', 'aman_28')).toBe('aman_28');
  });

  test('codeforces profile URL is reduced to the handle', () => {
    expect(normalizeHandle('codeforces', 'https://codeforces.com/profile/AP24110011314')).toBe('AP24110011314');
    expect(normalizeHandle('codeforces', 'http://codeforces.com/profile/tourist/')).toBe('tourist');
    expect(normalizeHandle('codeforces', '  codeforces.com/profile/tourist  ')).toBe('tourist');
  });

  test('leetcode profile URLs are reduced to the handle', () => {
    expect(normalizeHandle('leetcode', 'https://leetcode.com/u/aman_28/')).toBe('aman_28');
    expect(normalizeHandle('leetcode', 'https://leetcode.com/aman_28/')).toBe('aman_28');
  });

  test('leetcode section URLs are left alone so the API can reject them clearly', () => {
    expect(normalizeHandle('leetcode', 'https://leetcode.com/problems/two-sum/')).toBe(
      'https://leetcode.com/problems/two-sum/'
    );
  });

  test('strips @ prefix and handles empty input', () => {
    expect(normalizeHandle('leetcode', '@aman_28')).toBe('aman_28');
    expect(normalizeHandle('codeforces', '')).toBe('');
    expect(normalizeHandle('codeforces', null)).toBe('');
  });
});
