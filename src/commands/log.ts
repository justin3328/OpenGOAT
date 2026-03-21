import { GoalsRepo } from '../data/repos/goals.repo.js';
import { GapsRepo } from '../data/repos/gaps.repo.js';
import { storage } from '../lib/storage.js';
import { GapWatcher } from '../brain/gap-watcher.js';
import { InterventionsRepo } from '../data/repos/interventions.repo.js';
import chalk from 'chalk';

export async function logNumber(value: number) {
  const goalId = await storage.get<string>('active_goal_id');
  if (!goalId) {
    console.log(chalk.red('No active goal. Run `opengoat init` first.'));
    return;
  }

  const goal = GoalsRepo.getById(goalId);
  if (!goal) return;

  // 1. Log the new number natively via GapsRepo
  GapsRepo.log(goalId, value);
  GoalsRepo.updateCurrentValue(goalId, value);

  // 2. Retrieve history and calculate velocity
  const history = GapsRepo.getSeries(goalId);
  
  const gapRemaining = goal.targetVal - value;
  const closedPercent = ((value / goal.targetVal) * 100).toFixed(1);
  
  // REAL velocity: entries from the last 7 calendar days (not just last 7 records)
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const recentHistory = history.filter(h => h.loggedAt.getTime() > sevenDaysAgo);
  let velocity7d = 0;
  let velocityLabel = '0 (not enough data)';
  if (recentHistory.length >= 2) {
    const oldest = recentHistory[0];
    const daysDiff = Math.max(1, (now - oldest.loggedAt.getTime()) / (1000 * 60 * 60 * 24));
    velocity7d = (value - oldest.value) / daysDiff * 7;
    velocityLabel = `${velocity7d.toFixed(1)}/week (7-day average)`;
  } else if (history.length >= 2) {
    const oldest = history[0];
    const daysDiff = Math.max(1, (now - oldest.loggedAt.getTime()) / (1000 * 60 * 60 * 24));
    velocity7d = (value - oldest.value) / daysDiff * 7;
    velocityLabel = `${velocity7d.toFixed(1)}/week (all-time avg)`;
  }

  // Target velocity based on weeks remaining
  const msRemaining = new Date(goal.deadline).getTime() - now;
  const weeksRemaining = Math.max(1, msRemaining / (1000 * 60 * 60 * 24 * 7));
  const targetVelocity = gapRemaining / weeksRemaining;
  
  // Projected completion date
  const weeklyVelocity = velocity7d;
  const projectedWeeks = weeklyVelocity > 0 ? gapRemaining / weeklyVelocity : Infinity;
  const projectedDate = weeklyVelocity > 0
    ? new Date(now + projectedWeeks * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'No projection (log more data)';

  console.log(`\nGap updated → ${value} ${goal.unit}`);
  console.log(`Gap remaining: ${gapRemaining} ${goal.unit}`);
  console.log(`Closed: ${closedPercent}%`);
  console.log(`Velocity: ${velocityLabel} (need ${Math.round(targetVelocity)}/week)`);
  console.log(`Projected completion: ${projectedDate}`);

  const mockStatus = {
    current: value, target: goal.targetVal, unit: goal.unit,
    percentClosed: Number(closedPercent), gap: gapRemaining,
    velocity7d, velocity30d: velocity7d * 4, targetVelocity,
    projectedWeeks: velocity7d > 0 ? (gapRemaining / velocity7d) : 999,
    status: (velocity7d >= targetVelocity) ? 'on-track' : 'behind' as any,
    daysSinceMovement: history.length > 1 ? (now - history[history.length - 2].loggedAt.getTime()) / 86400000 : 0,
    projectedCompletionDate: projectedDate,
    isBehindSchedule: velocity7d < targetVelocity
  };

  // 3. GoatBrain Watcher Evaluation
  const decision = GapWatcher.evaluateGap(mockStatus);

  if (decision === 'silent') {
    // Zero footprint output, execution phase pure.
  } else if (decision === 'watching') {
    const question = GapWatcher.generateWatchingQuestion(mockStatus);
    console.log(chalk.yellow(`\n[GoatBrain] -> ${question}`));
    console.log(chalk.dim(`(Type 'opengoat why' to answer and trigger a constraint block resolution)`));
    
    // Stash intervention state
    InterventionsRepo.create({
      goalId,
      triggeredBy: 'stalled-48h',
      question,
      userResponse: '',
      constraintType: 'clarity',
      unlockAction: ''
    });
  } else if (decision === 'intervening') {
    console.log(chalk.red(`\n[CRISIS MODE] Your gap has stalled critically. The protocol must be reset.`));
    console.log(chalk.dim(`(Run 'opengoat gap' to view full intervention options.)`));
  }
}
