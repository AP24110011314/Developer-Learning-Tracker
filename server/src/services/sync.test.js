import { describe, test, expect } from '@jest/globals';
import { mapSubmissionToProblem } from './codeforces.js';
import { mapEntryToProblem } from './leetcode.js';

describe('codeforces mapSubmissionToProblem', () => {
  test('maps an accepted submission with contestId + index externalId', () => {
    const p = mapSubmissionToProblem({
      contestId: 1234,
      creationTimeSeconds: 1700000000,
      verdict: 'OK',
      problem: { index: 'A', name: 'Two Sum', rating: 800, tags: ['math'] },
    });
    expect(p).toMatchObject({
      platform: 'codeforces',
      externalId: '1234-A',
      source: 'sync',
      status: 'solved',
      difficulty: 'easy',
      url: 'https://codeforces.com/problemset/problem/1234/A',
    });
    expect(p.topics).toEqual(['math']);
  });

  test('rating maps to difficulty bands', () => {
    const sub = (rating) => ({
      contestId: 1,
      creationTimeSeconds: 1700000000,
      problem: { index: 'B', name: 'X', rating, tags: [] },
    });
    expect(mapSubmissionToProblem(sub(800)).difficulty).toBe('easy');
    expect(mapSubmissionToProblem(sub(1500)).difficulty).toBe('medium');
    expect(mapSubmissionToProblem(sub(2100)).difficulty).toBe('hard');
    expect(mapSubmissionToProblem(sub(undefined)).difficulty).toBe('medium');
  });
});

describe('leetcode mapEntryToProblem', () => {
  test('maps a recent submission with slug externalId', () => {
    const p = mapEntryToProblem(
      { title: 'Two Sum', titleSlug: 'two-sum', timestamp: '1700000000' },
      { difficulty: 'Easy', topicTags: [{ name: 'Array' }] }
    );
    expect(p).toMatchObject({
      platform: 'leetcode',
      externalId: 'two-sum',
      source: 'sync',
      difficulty: 'easy',
      url: 'https://leetcode.com/problems/two-sum/',
    });
    expect(p.topics).toEqual(['Array']);
  });

  test('missing detail falls back to medium', () => {
    const p = mapEntryToProblem({ title: 'X', titleSlug: 'x', timestamp: '1700000000' }, null);
    expect(p.difficulty).toBe('medium');
    expect(p.topics).toEqual([]);
  });
});
