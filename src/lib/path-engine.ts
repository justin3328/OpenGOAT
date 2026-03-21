import { Gap, Path, GoatState } from '../types/index.js';

export function calculateGap(current: number, target: number, deadline: Date): Gap {
  const now = new Date();
  const weeksRemaining = Math.max(1, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 7)));
  const totalGap = target - current;
  const weeklyVelocityNeeded = totalGap / weeksRemaining;

  return {
    category: 'income', // default, updated by caller
    current,
    target,
    unit: 'units',
    deadline,
    weeklyVelocityNeeded,
    currentVelocity: 0,
    weeksRemaining,
    percentClosed: Math.round((current / target) * 100)
  };
}

export function scorePathBySpeed(path: Path, gap: Gap): number {
  const speedScore = Math.max(0, 100 - (path.estimatedWeeks - gap.weeksRemaining) * 10);
  const composite = (speedScore * 0.7) + (path.confidenceScore * 0.3);
  return Math.round(composite);
}
