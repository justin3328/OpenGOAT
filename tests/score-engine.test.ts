import { describe, it, expect } from 'vitest';
import { calculateScore } from '../src/lib/score-engine.js';

describe('Score Engine v2', () => {
  it('should rank as Recruit for zero progress', () => {
    const score = calculateScore([], 1);
    expect(score.rank).toBe('Recruit');
    expect(score.total).toBe(0);
  });

  it('should calculate correct metrics for completed missions', () => {
    const missions = [
      { status: 'complete', xp: 100 },
      { status: 'complete', xp: 100 }
    ] as any;
    const score = calculateScore(missions, 1);
    expect(score.execution).toBe(100);
    expect(score.rank).toBe('Apex'); // 100*0.4 + 100*0.3 + 100*0.2 + 10*0.1 = 40+30+20+1 = 91? Wait.
    // consistency = 100, capitalVelocity = 100, reflection = 10
    // composite = 40 + 30 + 20 + 1 = 91. Ah, 91 >= 90 is Apex.
  });
});
