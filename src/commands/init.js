import chalk from 'chalk';
import boxen from 'boxen';
import { storage } from '../lib/storage.js';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

export async function init(goal) {
  const rl = readline.createInterface({ input, output });

  try {
    const existingConfig = storage.getConfig();
    if (existingConfig) {
      const answer = await rl.question(chalk.yellow('Config exists. Reinitialise? (y/n) '));
      if (answer.toLowerCase() !== 'y') {
        console.log(chalk.blue('Initialisation cancelled.'));
        rl.close();
        return;
      }
    }

    console.log(chalk.cyan(`\nTarget Goal: ${goal}`));

    console.log(chalk.white('\nWhat\'s your income model?'));
    console.log('1. Social media / content');
    console.log('2. Freelancing / services');
    console.log('3. Affiliate marketing');
    console.log('4. Digital products');
    console.log('5. Other (describe)');

    const modelChoice = await rl.question('Choice (1-5): ');
    let model = '';
    switch (modelChoice) {
      case '1': model = 'Social media / content'; break;
      case '2': model = 'Freelancing / services'; break;
      case '3': model = 'Affiliate marketing'; break;
      case '4': model = 'Digital products'; break;
      case '5': model = await rl.question('Describe your model: '); break;
      default: model = 'Other';
    }

    console.log(chalk.white('\nWhich AI provider?'));
    console.log('1. Anthropic Claude (recommended — best mission quality)');
    console.log('2. OpenAI GPT-4');
    console.log('3. Groq (fast + free tier available)');

    const providerChoice = await rl.question('Choice (1-3): ');
    let provider = '';
    let keyUrl = '';
    switch (providerChoice) {
      case '1':
        provider = 'anthropic';
        keyUrl = 'console.anthropic.com/keys';
        break;
      case '2':
        provider = 'openai';
        keyUrl = 'platform.openai.com/api-keys';
        break;
      case '3':
        provider = 'groq';
        keyUrl = 'console.groq.com/keys';
        break;
      default:
        provider = 'anthropic';
        keyUrl = 'console.anthropic.com/keys';
    }

    console.log(chalk.dim(`\nGet your key at: ${keyUrl}`));
    const apiKey = await rl.question(chalk.white('Paste your API key: '));
    console.log(chalk.dim('Stored locally on your machine only. We never see it.'));

    const config = {
      goal,
      model,
      provider,
      apiKey,
      startDate: new Date().toISOString(),
      week: 1
    };

    storage.setConfig(config);

    const successBox = boxen(
      `${chalk.bold('OPERATOR INITIALISED')}\n\n` +
      `${chalk.gray('GOAL')}      ${goal}\n` +
      `${chalk.gray('MODEL')}     ${model}\n` +
      `${chalk.gray('PROVIDER')}  ${provider === 'anthropic' ? 'Anthropic Claude' : provider === 'openai' ? 'OpenAI GPT-4' : 'Groq'}\n` +
      `${chalk.gray('WEEK')}      1\n\n` +
      `${chalk.dim('Key stored locally. Never shared.')}\n\n` +
      `Run: ${chalk.cyan('income-agent plan')}`,
      {
        padding: 1,
        margin: 1,
        borderStyle: 'single',
        borderColor: 'cyan'
      }
    );

    console.log(successBox);

  } catch (error) {
    console.error(chalk.red('\n✗ Initialisation failed.'), error.message);
  } finally {
    rl.close();
  }
}
