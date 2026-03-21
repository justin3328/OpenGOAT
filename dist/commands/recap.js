import { storage } from '../lib/storage.js';
import { calculateScore } from '../lib/score-engine.js';
import { banner, scoreCard } from '../lib/display.js';
import chalk from 'chalk';
export async function weeklyRecap() {
    const missions = storage.get('missions') || [];
    const weekNumber = storage.get('weekNumber') || 1;
    const score = calculateScore(missions, weekNumber);
    console.clear();
    banner();
    console.log(`  ${chalk.bold('WEEK ' + weekNumber + ' RECAP')}\n`);
    const completed = missions.filter(m => m.status === 'complete');
    const missed = missions.filter(m => m.status === 'missed');
    console.log(`  ${chalk.green('✓ COMPLETED')}: ${completed.length}`);
    completed.forEach(m => console.log(`    - ${m.title}`));
    console.log(`\n  ${chalk.red('✗ MISSED')}: ${missed.length}`);
    missed.forEach(m => console.log(`    - ${m.title}`));
    console.log('');
    scoreCard(score);
    console.log(`\n  ${chalk.dim('Recap complete. Weekly XP added.')}\n`);
}
