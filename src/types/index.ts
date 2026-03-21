import { z } from 'zod';

export type GoalCategory = 'income' | 'fitness' | 'learning' | 'launch' | string;

export interface Gap {
  category: GoalCategory;
  current: number;
  target: number;
  unit: string;
  deadline: Date;
  velocity: number;
}

export interface GoatState {
  goal: string;
  category: GoalCategory;
  gap: Gap;
  activePath: Path | null;
  missions: Mission[];
  score: OperatorScore;
  weekNumber: number;
  createdAt: Date;
}

export interface Path {
  id: string;
  name: string;
  description: string;
  estimatedWeeks: number;
  confidenceScore: number;
  requiredHoursPerWeek: number;
  milestones: Milestone[];
  tags: string[];
}

export interface Milestone {
  week: number;
  description: string;
  metric: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  status: 'pending' | 'complete' | 'missed';
  week: number;
  pathId: string;
  xp: number;
  completedAt?: Date;
}

export interface OperatorScore {
  execution: number;
  consistency: number;
  capitalVelocity: number;
  reflection: number;
  total: number;
  rank: 'Recruit' | 'Operator' | 'Ghost' | 'Apex';
  xp: number;
}

export interface CompletionOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface IPlaybookPlugin {
  name: string;
  category: GoalCategory;
  version: string;
  getPaths(gap: Gap): Path[];
  scorePath(path: Path, state: GoatState): number;
  getMissions(path: Path, week: number): Mission[];
}

export interface IProviderPlugin {
  name: string;
  version: string;
  complete(prompt: string, opts?: CompletionOptions): Promise<string>;
  stream?(prompt: string, opts?: CompletionOptions): AsyncGenerator<string>;
}

export interface IRendererPlugin {
  name: string;
  version: string;
  renderDashboard(state: GoatState): void;
  renderMissions(missions: Mission[]): void;
  renderScore(score: OperatorScore): void;
}

export interface IStorageAdapter {
  name: string;
  version: string;
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T): void;
  delete(key: string): void;
  clear(): void;
  getAll(): Record<string, unknown>;
}

export const PlaybookSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  description: z.string(),
  paths: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    estimatedWeeks: z.number().int().positive(),
    confidenceScore: z.number().min(0).max(100),
    requiredHoursPerWeek: z.number().positive(),
    milestones: z.array(z.object({
      week: z.number(),
      description: z.string(),
      metric: z.number()
    })),
    tags: z.array(z.string()),
    missionTemplates: z.array(z.object({
      title: z.string(),
      description: z.string(),
      estimatedHours: z.number(),
      xp: z.number()
    }))
  }))
});
