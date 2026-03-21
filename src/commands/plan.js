import chalk from 'chalk';
import boxen from 'boxen';
import ora from 'ora';
import { storage } from '../lib/storage.js';
import { generateMissions } from '../lib/providers.js';

export async function plan() {
  const config = storage.getConfig();

  if (!config) {
    console.log(chalk.red('✗ Not initialised. Run: income-agent init "your goal"'));
    return;
  }

  const spinner = ora({
    text: `Generating your Week ${config.week} protocol... (using ${config.provider})`,
    color: 'cyan'
  }).start();

  try {
    const result = await generateMissions(config);
    const { missions, weekFocus } = result;

    // Add week and status to missions
    const missionsToSave = missions.map(m => ({
      ...m,
      week: config.week,
      status: 'pending',
      createdAt: new Date().toISOString()
    }));

    // Get existing missions and add new ones
    const allMissions = storage.getMissions();
    
    // Check if missions for this week already exist
    const hasExisting = allMissions.some(m => m.week === config.week);
    if (hasExisting) {
      spinner.stop();
      console.log(chalk.yellow(`⚠ Missions for Week ${config.week} already exist.`));
      // In a real app, we might ask to overwrite, but keeping it simple for v1
      return;
    }

    storage.setMissions([...allMissions, ...missionsToSave]);

    spinner.succeed(chalk.green(`Week ${config.week} protocol generated.`));

    const dateStr = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    let missionRows = '';
    missionsToSave.forEach(m => {
      missionRows += `${chalk.cyan(m.id.toString().padStart(2, '0'))}  [ ] ${m.title}\n`;
    });

    const planBox = boxen(
      `${chalk.bold(`WEEK ${config.week} PROTOCOL — ${config.goal}`)}\n` +
      `${chalk.dim(`Generated: ${dateStr}`)}\n` +
      `${chalk.gray('─'.repeat(40))}\n` +
      missionRows +
      `${chalk.gray('─'.repeat(40))}\n` +
      `Run: ${chalk.cyan('income-agent missions')} to track`,
      {
        padding: 1,
        margin: 1,
        borderStyle: 'single',
        borderColor: 'magenta'
      }
    );

    console.log(planBox);

  } catch (error) {
    spinner.stop();
    if (error.message.includes('API key') || error.status === 401) {
      console.log(chalk.red(`✗ API key rejected by ${config.provider}.`));
      const KEY_URLS = {
        anthropic: 'console.anthropic.com/keys',
        openai:    'platform.openai.com/api-keys',
        groq:      'console.groq.com/keys (free tier available)'
      };
      console.log(chalk.dim(`  Get a valid key at: ${KEY_URLS[config.provider]}`));
      console.log(chalk.dim(`  Then run: income-agent init to update your key.`));
    } else if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      console.log(chalk.red(`✗ Unable to reach ${config.provider} API. Check your connection.`));
    } else {
      console.log(chalk.red(`✗ Generation failed: ${error.message}`));
    }
  }
}
