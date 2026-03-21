import { storage } from '../lib/storage.js';
import chalk from 'chalk';
export async function showHistory() {
    const history = storage.get('history') || [];
    console.clear();
    console.log(`\n  ${chalk.bold('GOAT PERFORMANCE HISTORY')}\n`);
    if (history.length === 0) {
        console.log('  No historical records found.');
        return;
    }
    console.log(`  ${chalk.dim('WEEK'.padEnd(8))} ${chalk.dim('SCORE'.padEnd(8))} ${chalk.dim('MISSIONS'.padEnd(12))} ${chalk.dim('XP')}`);
    history.forEach(h => {
        console.log(`  ${h.week.toString().padEnd(8)} ${h.score.toString().padEnd(8)} ${h.completed}/${h.total}         ${h.xp}`);
    });
    console.log('');
}
