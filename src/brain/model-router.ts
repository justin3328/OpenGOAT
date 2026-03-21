export type TaskType =
  | 'generate-missions'
  | 'recovery-plan'
  | 'score-recap'
  | 'milestone-message'
  | 'pattern-analysis';

export interface RouteResult {
  model: string;
  estimatedTokens: number;
  estimatedCostCents: number;
}

export function routeTask(task: TaskType, availableModels: string[]): RouteResult {
  const powerful = ['claude-3-opus', 'claude-3-5-sonnet', 'gpt-4o', 'gpt-4'];
  const isPowerfulNeeded = task === 'generate-missions' || task === 'recovery-plan' || task === 'pattern-analysis';

  if (availableModels.includes('ollama')) {
    return { model: 'ollama', estimatedTokens: 500, estimatedCostCents: 0 };
  }

  const model = isPowerfulNeeded
    ? availableModels.find(m => powerful.includes(m.toLowerCase())) || availableModels[0]
    : availableModels.find(m => !powerful.includes(m.toLowerCase())) || availableModels[0];

  return {
    model: model || 'default',
    estimatedTokens: isPowerfulNeeded ? 1000 : 300,
    estimatedCostCents: model?.toLowerCase().includes('gpt-4') ? 5 : 1
  };
}
