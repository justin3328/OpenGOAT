import chalk from 'chalk';
import boxen from 'boxen';
import { storage } from '../lib/storage.js';
import { calculateScore } from '../lib/score.js';
import { progressBar, formatCurrency } from '../lib/display.js';

export async function showScore() {
  const config = storage.getConfig();
  if (!config) {
    console.log(chalk.red('✗ Not initialised. Run: income-agent init "your goal"'));
    return;
  }

  const missions = storage.getMissions();
  const earnings = storage.getEarnings();

  const stats = calculateScore(config, missions, earnings);

  const scoreColor = stats.score >= 70 ? chalk.green : stats.score >= 40 ? chalk.yellow : chalk.red;
  
  const scoreCard = boxen(
    `${chalk.bold('  OPERATOR SCORE')}\n` +
    `${chalk.gray('─'.repeat(40))}\n` +
    `${chalk.gray('  SCORE')}          ${scoreColor.bold(`${stats.score} / 100`)}\n` +
    `${chalk.gray('  STREAK')}         ${chalk.white(`${stats.streak} days`)}\n` +
    `${chalk.gray('  MISSIONS')}       ${chalk.white(`${stats.completedMissions} / ${stats.totalMissions}  this week`)}\n` +
    `${chalk.gray('  CAPITAL')}        ${chalk.green(`${formatCurrency(stats.thisWeekEarnings)}  this week`)}\n` +
    `${chalk.gray('  ALL TIME')}       ${chalk.white(formatCurrency(stats.allTimeEarnings))}\n` +
    `${chalk.gray('─'.repeat(40))}\n` +
    `${chalk.gray('  EXECUTION')}      ${progressBar(stats.execution)}  ${stats.execution}%\n` +
    `${chalk.gray('  CONSISTENCY')}    ${progressBar(stats.consistency)}  ${stats.consistency}%\n` +
    `${chalk.gray('  CAPITAL VEL')}    ${progressBar(stats.capitalVelocity)}  ${stats.capitalVelocity}%\n` +
    `${chalk.gray('  REFLECTION')}     ${progressBar(stats.reflection)}  ${stats.reflection}%\n` +
    `${chalk.gray('─'.repeat(40))}\n` +
    `${chalk.gray('  GOAL')}           ${chalk.white(config.goal)}\n` +
    `${chalk.gray('  PROGRESS')}       ${chalk.green(`${formatCurrency(stats.allTimeEarnings)} / ${config.goal.match(/\d+/)?.[0] || '??'} (${Math.round((stats.allTimeEarnings / (parseInt(config.goal.match(/\d+/)?.[0] || 1))) * 100)}%)`)}\n`,
    {
      padding: 1,
      margin: 1,
      borderStyle: 'double',
      borderColor: stats.score >= 70 ? 'green' : stats.score >= 40 ? 'yellow' : 'red'
    }
  );

  console.log(scoreCard);
}
