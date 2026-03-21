import { describe, it, expect } from 'vitest';
import { calculateScore } from '../src/lib/score-engine.js';

describe('Score Engine', () => {
  it('should rank as Recruit for zero progress', () => {
    const score = calculateScore([], 1);
    expect(score.rank).toBe('Recruit');
    expect(score.total).toBe(0);
  });

  it('should calculate higher score for completed missions', () => {
    const missions = [
      { status: 'complete', xp: 100 },
      { status: 'complete', xp: 100 }
    ] as any;
    const score = calculateScore(missions, 1);
    expect(score.execution).toBe(100);
    expect(score.total).toBeGreaterThan(0);
  });
});
