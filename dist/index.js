#!/usr/bin/env node
import { Command } from 'commander';
import { init } from './commands/init.js';
import { showPath } from './commands/path.js';
import { planMissions } from './commands/plan.js';
import { trackMissions } from './commands/missions.js';
import { showScore } from './commands/score.js';
import { liveDashboard } from './commands/dashboard.js';
import { startServer } from './commands/serve.js';
import { weeklyRecap } from './commands/recap.js';
import { showHistory } from './commands/history.js';
import { exportMarkdown } from './commands/export.js';
import { resetData } from './commands/reset.js';
import { pluginCommands } from './commands/plugin.js';
const program = new Command();
program
    .name('opengoat')
    .description('The GOAT path to any goal.')
    .version('1.0.0');
program
    .command('init')
    .description('Interactive setup wizard')
    .action(init);
program
    .command('path')
    .description('See your displacement + best route')
    .action(showPath);
program
    .command('plan')
    .description('Generate this week\'s missions via AI')
    .action(planMissions);
program
    .command('missions')
    .description('Interactive mission tracker')
    .action(trackMissions);
program
    .command('score')
    .description('Your Pathfinder Score card')
    .action(showScore);
program
    .command('dashboard')
    .description('Live auto-refreshing terminal dashboard')
    .action(liveDashboard);
program
    .command('serve')
    .description('Start local HTTP server for the web UI')
    .action(startServer);
program
    .command('recap')
    .description('Weekly performance summary')
    .action(weeklyRecap);
program
    .command('history')
    .description('Show performance history')
    .action(showHistory);
program
    .command('export')
    .description('Export data to markdown')
    .action(exportMarkdown);
program
    .command('reset')
    .description('Clear all data')
    .action(resetData);
pluginCommands(program);
// Default action (init)
if (!process.argv.slice(2).length) {
    init();
}
else {
    program.parse(process.argv);
}
