#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';

const program = new Command();

program
  .name('income-agent')
  .description('Turn your income goal into weekly missions.')
  .version('1.0.0');

program
  .command('init')
  .argument('<goal>', 'income goal (e.g., "earn $500 this month")')
  .description('Initialize income-agent with your goal')
  .action(async (goal) => {
    const { init } = await import('./src/commands/init.js');
    await init(goal);
  });

program
  .command('plan')
  .description('Generate missions for the current week')
  .action(async () => {
    const { plan } = await import('./src/commands/plan.js');
    await plan();
  });

program
  .command('missions')
  .description('List and manage your missions')
  .action(async () => {
    const { missions } = await import('./src/commands/missions.js');
    await missions();
  });

program
  .command('done')
  .argument('<number>', 'mission number to mark as done')
  .description('Mark a mission as complete')
  .action(async (number) => {
    const { markDone } = await import('./src/commands/missions.js');
    await markDone(parseInt(number));
  });

program
  .command('missed')
  .argument('<number>', 'mission number to mark as missed')
  .description('Mark a mission as missed')
  .action(async (number) => {
    const { markMissed } = await import('./src/commands/missions.js');
    await markMissed(parseInt(number));
  });

program
  .command('log')
  .argument('<amount>', 'amount earned')
  .argument('<description>', 'description of the earning')
  .description('Log your earnings')
  .action(async (amount, description) => {
    const { logEarning } = await import('./src/commands/log.js');
    await logEarning(amount, description);
  });

program
  .command('recap')
  .description('Show weekly performance summary')
  .action(async () => {
    const { recap } = await import('./src/commands/recap.js');
    await recap();
  });

program
  .command('history')
  .description('Show earnings history across all weeks')
  .action(async () => {
    const { history } = await import('./src/commands/history.js');
    await history();
  });

program
  .command('export')
  .description('Export all data to a markdown file')
  .action(async () => {
    const { exportData } = await import('./src/commands/export.js');
    await exportData();
  });

program
  .command('reset')
  .description('Clear all data with confirmation')
  .action(async () => {
    const { reset } = await import('./src/commands/reset.js');
    await reset();
  });

program
  .command('dashboard')
  .description('Live auto-refreshing terminal dashboard')
  .action(async () => {
    const { dashboard } = await import('./src/commands/dashboard.js');
    await dashboard();
  });

program
  .command('serve')
  .description('Start local HTTP server for the web UI')
  .action(async () => {
    const { serve } = await import('./src/commands/serve.js');
    await serve();
  });

program.parse();
