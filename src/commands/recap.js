import { storage } from '../lib/storage.js';
import { calculateScore } from '../lib/score.js';
import { C, bar, currency, delta, anchor } from '../lib/display.js';
import chalk from 'chalk';

export async function recap() {
  const config = storage.getConfig();
  if (!config) {
    console.log(C.negative('✗ Not initialised. Run: income-agent init "your goal"'));
    return;
  }

  const allMissions = storage.getMissions();
  const allEarnings = storage.getEarnings();
  
  const stats = calculateScore(config, allMissions, allEarnings);

  const lastWeekEarnings = allEarnings
    .filter(e => e.week === config.week - 1)
    .reduce((sum, e) => sum + e.amount, 0);
  
  const earningsDelta = lastWeekEarnings > 0 
    ? ((stats.thisWeekEarnings - lastWeekEarnings) / lastWeekEarnings) * 100 
    : 0;

  console.log(`\n  ${chalk.bold(`WEEK ${config.week} RECAP`)} ${C.ghost('—')} ${C.dim('March 15–21, 2026')}\n`);

  console.log(`  ${C.label('MISSIONS'.padEnd(12))} ${C.mono(`${stats.completedMissions}/${stats.totalMissions} complete`)}  ${bar(stats.execution)}  ${C.mono(stats.execution + '%')}`);
  console.log(`  ${C.label('EARNINGS'.padEnd(12))} ${currency(stats.thisWeekEarnings)}       ${lastWeekEarnings > 0 ? delta(earningsDelta) + ' vs last week' : ''}`);
  console.log(`  ${C.label('STREAK'.padEnd(12))} ${C.mono(stats.streak + ' days')}`);
  console.log(`  ${C.label('SCORE'.padEnd(12))} ${C.mono(stats.score + '/100')}\n`);

  console.log(`  ${anchor('CAPITAL LOG')}`);
  const recentEarnings = allEarnings
    .filter(e => e.week === config.week)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  if (recentEarnings.length === 0) {
    console.log(`  ${C.ghost('No earnings recorded this week.')}`);
  } else {
    recentEarnings.forEach(e => {
      const date = new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      console.log(`  ${C.dim(date.padEnd(8))} ${currency(e.amount).padEnd(10)} ${C.primary(e.description)}`);
    });
  }

  console.log(`\n  ${anchor('WEEK CHART (7 DAYS)')}`);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  const weekData = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dayStr = d.toISOString().split('T')[0];
    const dayName = days[d.getDay() === 0 ? 6 : d.getDay() - 1];
    const amount = allEarnings
      .filter(e => e.date.startsWith(dayStr))
      .reduce((sum, e) => sum + e.amount, 0);
    weekData.push({ dayName, amount });
  }

  const maxAmount = Math.max(...weekData.map(d => d.amount), 1);
  weekData.forEach(d => {
    const filled = Math.round((d.amount / maxAmount) * 10);
    console.log(`  ${C.dim(d.dayName.padEnd(5))} ${C.positive('█'.repeat(filled))}${C.ghost('░'.repeat(10 - filled))}  ${currency(d.amount)}`);
  });
  console.log('');
}
