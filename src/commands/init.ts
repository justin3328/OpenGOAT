import inquirer from 'inquirer';
import { storage } from '../lib/storage.js';
import { banner, gapMeter } from '../lib/display.js';
import { calculateGap } from '../lib/path-engine.js';
import { loadPlaybooks } from '../lib/playbook-loader.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const GOAL_CATEGORIES = [
  { name: '💰  Earn money online', value: 'income' },
  { name: '🏃  Fitness goal', value: 'fitness' },
  { name: '📚  Learn something new', value: 'learning' },
  { name: '🚀  Launch a project', value: 'launch' },
];

export async function init() {
  console.clear();
  banner();

  const playbooks = await loadPlaybooks(path.join(__dirname, '../../playbooks'));

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'category',
      message: 'What kind of goal are you working toward?',
      choices: GOAL_CATEGORIES,
    },
    {
      type: 'input',
      name: 'goal',
      message: 'Describe your goal in one line:',
      default: 'earn $500 this month'
    },
    {
      type: 'input',
      name: 'target',
      message: 'Target number (e.g. 500 for $500, 5 for 5kg):',
      validate: (v) => !isNaN(parseFloat(v)) || 'Enter a number',
    },
    {
      type: 'input',
      name: 'current',
      message: 'Current progress (0 if starting fresh):',
      default: '0',
      validate: (v) => !isNaN(parseFloat(v)) || 'Enter a number',
    },
    {
      type: 'input',
      name: 'deadline',
      message: 'Deadline (days from today):',
      default: '30',
      validate: (v) => !isNaN(parseInt(v)) || 'Enter number of days',
    }
  ]);

  const deadlineDate = new Date();
  deadlineDate.setDate(deadlineDate.getDate() + parseInt(answers.deadline));

  const gap = calculateGap(parseFloat(answers.current), parseFloat(answers.target), deadlineDate);
  gap.category = answers.category;

  console.log('\n  DISPLACEMENT ANALYSIS:');
  gapMeter(gap);

  const filteredPlaybooks = playbooks.filter(p => p.category === answers.category);
  
  if (filteredPlaybooks.length === 0) {
    console.log('\n  No predefined playbooks for this category yet.');
  } else {
    const { playbookId } = await inquirer.prompt([{
      type: 'list',
      name: 'playbookId',
      message: 'Choose your path:',
      choices: filteredPlaybooks.flatMap(p => p.paths.map((pathObj: any) => ({
        name: `${pathObj.name} — ${pathObj.description}`,
        value: pathObj.id
      })))
    }]);

    const activePlaybook = filteredPlaybooks.find(p => p.paths.some((pathObj: any) => pathObj.id === playbookId));
    const activePath = activePlaybook?.paths.find((pathObj: any) => pathObj.id === playbookId);

    storage.set('goal', answers.goal);
    storage.set('category', answers.category);
    storage.set('gap', gap);
    storage.set('activePath', activePath);
    storage.set('weekNumber', 1);
    storage.set('createdAt', new Date());

    console.log(`\n  ${activePath?.name} path locked.`);
    console.log('  Run opengoat plan to generate your week 1 missions.\n');
  }
}
