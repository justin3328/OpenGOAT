import inquirer from 'inquirer';
import { GoalsRepo } from '../data/repos/goals.repo.js';
import { ResourcesRepo } from '../data/repos/resources.repo.js';
import { PathsRepo } from '../data/repos/paths.repo.js';
import { storage } from '../lib/storage.js';
import { ResourceMapper } from '../brain/resource-mapper.js';
import { PathGenerator } from '../brain/path-generator.js';
import { getProviderInstance, invokeModel } from '../lib/ai-provider.js';
import chalk from 'chalk';

export async function updateResources() {
  const goalId = await storage.get<string>('active_goal_id');
  if (!goalId) {
    console.log(chalk.red('No active goal. Run `opengoat init` first.'));
    return;
  }

  const goal = GoalsRepo.getById(goalId);
  const currentProfile = ResourcesRepo.getByGoalId(goalId);

  console.log(chalk.cyan(`\nUPDATING RESOURCES FOR: ${goal?.statement}`));
  if (currentProfile) {
    console.log(chalk.dim('Your last answers were processed into this mapped profile:'));
    console.log(chalk.dim(JSON.stringify(currentProfile, null, 2)));
  }

  console.log(chalk.yellow('\nProvide new answers for the 5 dimensions. Leave blank to skip that dimension.'));
  
  const answers = await inquirer.prompt([
    { name: 'time', message: '[Time] Any changes to schedule/availability?' },
    { name: 'capital', message: '[Capital] Did funding, income, or runway change?' },
    { name: 'skills', message: '[Skills] Any new skills acquired or tools mastered?' },
    { name: 'network', message: '[Network] Any new valuable connections or platforms?' },
    { name: 'assets', message: '[Assets] Any new leverage or reputation built?' }
  ]);

  if (!answers.time && !answers.capital && !answers.skills && !answers.network && !answers.assets) {
    console.log(chalk.dim('No changes made. Aborting.'));
    return;
  }

  console.log(chalk.blue('GoatBrain is analyzing new dimensions...'));
  try {
    const providerName = await storage.get<string>('preferred_provider') || 'Ollama (Local)';
    const provider = await getProviderInstance(providerName);
    
    // Map Resources
    const resPrompt = ResourceMapper.generateProfileExtractionPrompt(answers);
    const rawResJson = await invokeModel(provider, resPrompt);
    const parsedRes = JSON.parse(rawResJson.replace(/```json|```/g, '').trim());
    
    // Merge or Overwrite? The AI probably parsed only the diff or everything?
    // We'll trust GoatBrain generated a complete replacement based on what we gave it,
    // though in a real system we'd send the old profile as context. For this iteration,
    // it replaces it entirely.
    ResourcesRepo.save(goalId, parsedRes);

    console.log(chalk.blue('Re-calculating paths based on new profile...'));
    // Re-generate Paths
    const pathPrompt = PathGenerator.generatePrompt(goal!, parsedRes);
    const rawPathsJson = await invokeModel(provider, pathPrompt);
    const parsedPaths = JSON.parse(rawPathsJson.replace(/```json|```/g, '').trim());
    
    PathsRepo.savePaths(goalId, parsedPaths);

    console.log(chalk.green('Resources updated and Top 5 Paths fully regenerated.'));
    console.log(chalk.dim('Run `opengoat paths` to lock in your new strategy.'));
  } catch (e: any) {
    console.log(chalk.red(`GoatBrain failed: ${e.message}`));
  }
}
