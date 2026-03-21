import { describe, it, expect } from 'vitest';
import { calculateGap, scorePathBySpeed } from '../src/lib/path-engine.js';

describe('Path Engine v2', () => {
  it('should calculate gap correctly', () => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 28); // 4 weeks
    const gap = calculateGap(0, 1000, deadline);
    
    expect(gap.target).toBe(1000);
    expect(gap.weeksRemaining).toBe(4);
    expect(gap.weeklyVelocityNeeded).toBe(250);
  });

  it('should score paths based on speed and confidence', () => {
    const gap = { weeksRemaining: 4 } as any;
    const path = { estimatedWeeks: 4, confidenceScore: 80 } as any;
    
    const score = scorePathBySpeed(path, gap);
    expect(score).toBe(94); // (100 * 0.7) + (80 * 0.3) = 70 + 24 = 94
  });
});
