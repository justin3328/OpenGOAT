import chalk from 'chalk';
import boxen from 'boxen';
import { storage } from '../lib/storage.js';

export async function logEarning(amountStr, description) {
  const amount = parseFloat(amountStr);

  if (isNaN(amount)) {
    console.log(chalk.red('✗ Invalid amount. Use: income-agent log 47.20 "description"'));
    return;
  }

  const config = storage.getConfig();
  if (!config) {
    console.log(chalk.red('✗ Not initialised. Run: income-agent init "your goal"'));
    return;
  }

  const earning = {
    amount,
    description,
    date: new Date().toISOString(),
    week: config.week
  };

  storage.addEarning(earning);

  const allEarnings = storage.getEarnings();
  const weekEarnings = allEarnings
    .filter(e => e.week === config.week)
    .reduce((sum, e) => sum + e.amount, 0);
  const totalEarnings = allEarnings.reduce((sum, e) => sum + e.amount, 0);

  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const logBox = boxen(
    `${chalk.bold('CAPITAL SIGNAL RECORDED')}\n\n` +
    `${chalk.green(`+$${amount.toFixed(2)}`)}  ${description}\n` +
    ` ${chalk.gray('DATE')}    ${chalk.dim(dateStr)}\n\n` +
    `${chalk.gray('WEEK TOTAL')}    ${chalk.green(`$${weekEarnings.toFixed(2)}`)}\n` +
    `${chalk.gray('ALL TIME')}      ${chalk.green(`$${totalEarnings.toFixed(2)}`)}`,
    {
      padding: 1,
      margin: 1,
      borderStyle: 'single',
      borderColor: 'green'
    }
  );

  console.log(logBox);
}
