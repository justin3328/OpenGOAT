import { Command } from 'commander';
import chalk from 'chalk';

export function pluginCommands(program: Command) {
  const plugin = program.command('plugin').description('Manage OpenGOAT plugins');

  plugin
    .command('add <package>')
    .description('Add a new plugin package')
    .action((pkg) => {
      console.log(`  Adding plugin: ${pkg}...`);
      console.log(chalk.dim('  (Simulated) Plugin registry updated.'));
    });

  plugin
    .command('list')
    .description('List all registered plugins')
    .action(() => {
      console.log('\n  REGISTERED PLUGINS:');
      console.log(`  - ${chalk.bold('DefaultConf')} (storage, v1.0.0)`);
      console.log(`  - ${chalk.bold('BloombergTerminal')} (renderer, v1.0.0)`);
      console.log('');
    });
}
