import chalk from 'chalk';
import boxen from 'boxen';
import { storage } from '../lib/storage.js';

export async function missions() {
  const config = storage.getConfig();
  if (!config) {
    console.log(chalk.red('✗ Not initialised. Run: income-agent init "your goal"'));
    return;
  }

  const allMissions = storage.getMissions();
  const currentMissions = allMissions.filter(m => m.week === config.week);

  if (currentMissions.length === 0) {
    console.log(chalk.yellow('⚠ No missions for this week. Run: income-agent plan'));
    return;
  }

  const completed = currentMissions.filter(m => m.status === 'complete').length;
  const remaining = currentMissions.length - completed;

  let missionList = '';
  currentMissions.forEach(m => {
    let statusIcon = '[ ]';
    let text = chalk.white(m.title);

    if (m.status === 'complete') {
      statusIcon = chalk.green('[✓]');
      text = chalk.green.strikethrough(m.title);
    } else if (m.status === 'missed') {
      statusIcon = chalk.red('[✗]');
      text = chalk.red(m.title);
    }

    missionList += `${chalk.cyan(m.id.toString().padStart(2, '0'))}  ${statusIcon} ${text}\n`;
  });

  const missionsBox = boxen(
    `${chalk.bold(`WEEK ${config.week} MISSIONS`)}\n` +
    `${chalk.gray('─'.repeat(40))}\n` +
    missionList +
    `${chalk.gray('─'.repeat(40))}\n` +
    `${chalk.white(`Week ${config.week}`)} · ${chalk.green(`${completed}/${currentMissions.length} complete`)} · ${chalk.yellow(`${remaining} remaining`)}\n\n` +
    `${chalk.dim('Mark done:   income-agent done <id>')}\n` +
    `${chalk.dim('Mark missed: income-agent missed <id>')}`,
    {
      padding: 1,
      margin: 1,
      borderStyle: 'single',
      borderColor: 'blue'
    }
  );

  console.log(missionsBox);
}

export async function markDone(id) {
  await updateMissionStatus(id, 'complete');
}

export async function markMissed(id) {
  await updateMissionStatus(id, 'missed');
}

async function updateMissionStatus(id, status) {
  const config = storage.getConfig();
  if (!config) {
    console.log(chalk.red('✗ Not initialised.'));
    return;
  }

  const allMissions = storage.getMissions();
  const index = allMissions.findIndex(m => m.id === id && m.week === config.week);

  if (index === -1) {
    console.log(chalk.red(`✗ Mission ${id} not found for Week ${config.week}.`));
    return;
  }

  allMissions[index].status = status;
  if (status === 'complete') {
    allMissions[index].completedAt = new Date().toISOString();
  }
  
  storage.setMissions(allMissions);

  console.log(chalk.green(`✓ Mission ${id} marked as ${status}.`));
}
