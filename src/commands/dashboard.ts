import { storage } from '../lib/storage.js';
import { calculateScore } from '../lib/score-engine.js';
import { banner, gapMeter, missionCard, scoreCard } from '../lib/display.js';
import cliCursor from 'cli-cursor';
import { emitKeypressEvents } from 'node:readline';

export async function liveDashboard() {
  const goal = storage.get<string>('goal');
  const gap = storage.get<any>('gap');

  if (!goal || !gap) {
    console.log('  Not initialised. Run opengoat init first.');
    return;
  }

  cliCursor.hide();
  emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) process.stdin.setRawMode(true);

  const render = () => {
    const missions = storage.get<any[]>('missions') || [];
    const weekNumber = storage.get<number>('weekNumber') || 1;
    const score = calculateScore(missions, weekNumber);

    process.stdout.write('\x1B[2J\x1B[3J\x1B[H'); // Clear screen and home
    banner();
    console.log(`  GOAL: ${goal}`);
    gapMeter(gap);
    console.log('');
    missionCard(missions);
    console.log('');
    scoreCard(score);
    console.log(`\n  ${chalk.dim('Auto-refreshing every 5s. Press [q] to exit.')}`);
  };

  render();
  const timer = setInterval(render, 5000);

  process.stdin.on('keypress', (str, key) => {
    if (key.name === 'q' || (key.ctrl && key.name === 'c')) {
      clearInterval(timer);
      cliCursor.show();
      process.stdin.setRawMode(false);
      process.exit();
    }
  });
}

import chalk from 'chalk';
