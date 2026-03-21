import inquirer from 'inquirer';
import { storage } from '../lib/storage.js';
import chalk from 'chalk';

export async function resetData() {
  const { confirm } = await inquirer.prompt([{
    type: 'confirm',
    name: 'confirm',
    message: chalk.red('Are you sure you want to wipe all OpenGOAT data?'),
    default: false
  }]);

  if (confirm) {
    storage.clear();
    console.log(`\n  ${chalk.green('✓')} All data cleared. Engine reset.\n`);
  } else {
    console.log('  Reset cancelled.');
  }
}
