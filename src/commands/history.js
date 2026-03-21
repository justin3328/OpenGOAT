import { storage } from '../lib/storage.js';
import { C, bar, currency, anchor } from '../lib/display.js';
import chalk from 'chalk';

export async function history() {
  const config = storage.getConfig();
  if (!config) {
    console.log(C.negative('✗ Not initialised. Run: income-agent init "your goal"'));
    return;
  }

  const allMissions = storage.getMissions();
  const allEarnings = storage.getEarnings();
  const currentWeek = config.week;

  console.log(`\n  ${chalk.bold('EARNINGS HISTORY')}\n`);

  const maxWeeklyEarnings = Math.max(
    ...Array.from({ length: currentWeek }, (_, i) => i + 1).map(w => 
      allEarnings.filter(e => e.week === w).reduce((sum, e) => sum + e.amount, 0)
    ), 
    1
  );

  for (let w = 1; w <= currentWeek; w++) {
    const weekEarnings = allEarnings
      .filter(e => e.week === w)
      .reduce((sum, e) => sum + e.amount, 0);
    
    const weekMissions = allMissions.filter(m => m.week === w);
    const completedMissions = weekMissions.filter(m => m.status === 'complete').length;
    const totalMissions = weekMissions.length || 5;
    
    const isCurrent = w === currentWeek;
    const label = `WEEK ${w}`.padEnd(8);
    const earningsStr = currency(weekEarnings).padEnd(12);
    
    const filled = Math.round((weekEarnings / maxWeeklyEarnings) * 10);
    const barStr = C.positive('█'.repeat(filled)) + C.ghost('░'.repeat(10 - filled));
    
    const missionStats = `${completedMissions}/${totalMissions} missions`;
    const currentIndicator = isCurrent ? C.neutral(' ← current') : '';

    console.log(`  ${C.label(label)}  ${earningsStr}  ${barStr}  ${C.dim(missionStats)}${currentIndicator}`);
  }

  const totalAllTime = allEarnings.reduce((sum, e) => sum + e.amount, 0);
  console.log(`\n  ${C.label('ALL TIME')}  ${currency(totalAllTime)}\n`);
}
