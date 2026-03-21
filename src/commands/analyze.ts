import { storage } from '../lib/storage.js';
import { getProviderInstance, invokeModel } from '../lib/ai-provider.js';
import { GoalsRepo } from '../data/repos/goals.repo.js';
import { GapsRepo } from '../data/repos/gaps.repo.js';
import chalk from 'chalk';

export async function analyzeGoal() {
  const goalId = await storage.get<string>('active_goal_id');
  if (!goalId) {
    console.log(chalk.red('No active goal.'));
    return;
  }

  const goal = GoalsRepo.getById(goalId);
  const history = GapsRepo.getSeries(goalId);
  const providerName = await storage.get<string>('preferred_provider') || 'Ollama (Local)';
  
  console.log(chalk.cyan(`Booting ${providerName} for deep diagnostic analysis...`));

  try {
    const provider = await getProviderInstance(providerName);
    const prompt = `
You are GoatBrain Diagnostics.
Analyze the following gap velocity time-series and Goal constraints.
Goal: ${JSON.stringify(goal, null, 2)}
Gap Log: ${JSON.stringify(history, null, 2)}

Identify any latent friction patterns or acceleration windows in this exact time-series.
Output a 3-bullet insight summary. Be brutally honest. No intro.
`;
    
    const analysis = await invokeModel(provider, prompt);
    console.log(`\n${chalk.yellow(analysis)}`);
  } catch(e: any) {
    console.log(chalk.red(`Diagnostic failed: ${e.message}`));
  }
}
