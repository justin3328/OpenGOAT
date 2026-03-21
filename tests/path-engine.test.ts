import { describe, it, expect } from 'vitest';
import { calculateGap, scorePathBySpeed } from '../src/lib/path-engine.js';

describe('Path Engine', () => {
  it('should calculate gap correctly', () => {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 28); // 4 weeks
    const gap = calculateGap(0, 1000, deadline);
    
    expect(gap.target).toBe(1000);
    expect(gap.velocity).toBe(250); // 1000 / 4
  });

  it('should score paths based on speed and confidence', () => {
    const gap = { current: 0, target: 1000, velocity: 250 } as any;
    const path = { estimatedWeeks: 4, confidenceScore: 80 } as any;
    
    const score = scorePathBySpeed(path, gap);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
