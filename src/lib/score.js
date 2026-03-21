// src/lib/score.js

export function calculateScore(config, missions, earnings) {
  const currentWeekMissions = missions.filter(m => m.week === config.week);
  const completed = currentWeekMissions.filter(m => m.status === 'complete').length;
  const total = currentWeekMissions.length || 5;

  // Execution (30%) — missions completed this week
  const execution = total > 0 ? (completed / total) * 100 : 0;

  // Consistency (25%) — streak calculation
  // streak = consecutive days with at least one complete mission or log
  const streak = calculateStreak(missions, earnings);
  const consistency = Math.min((streak / 7) * 100, 100);

  // Capital Velocity (30%) — earnings this week vs last week
  const thisWeekEarnings = earnings
    .filter(e => e.week === config.week)
    .reduce((sum, e) => sum + e.amount, 0);
  const lastWeekEarnings = earnings
    .filter(e => e.week === config.week - 1)
    .reduce((sum, e) => sum + e.amount, 0);
  const capitalVelocity = lastWeekEarnings > 0
    ? Math.min((thisWeekEarnings / lastWeekEarnings) * 100, 100)
    : thisWeekEarnings > 0 ? 60 : 0;

  // Reflection (15%) — has plan been generated this week
  const reflection = currentWeekMissions.length > 0 ? 100 : 0;

  const score = Math.round(
    (execution * 0.30) +
    (consistency * 0.25) +
    (capitalVelocity * 0.30) +
    (reflection * 0.15)
  );

  return {
    score,
    execution: Math.round(execution),
    consistency: Math.round(consistency),
    capitalVelocity: Math.round(capitalVelocity),
    reflection: Math.round(reflection),
    streak,
    thisWeekEarnings,
    allTimeEarnings: earnings.reduce((sum, e) => sum + e.amount, 0),
    completedMissions: completed,
    totalMissions: total
  };
}

function calculateStreak(missions, earnings) {
  // Count consecutive days (from today backwards) where
  // at least one mission was completed OR an earning was logged
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    const dayStr = day.toISOString().split('T')[0];
    const hadActivity =
      missions.some(m => m.status === 'complete' && m.completedAt?.startsWith(dayStr)) ||
      earnings.some(e => e.date.startsWith(dayStr));
    if (hadActivity) streak++;
    else if (i > 0) break; // gap breaks streak (allow today to be zero)
  }
  return streak;
}
