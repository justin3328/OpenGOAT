import { z } from 'zod';

// ─── primitives ──────────────────────────────────────────────────────────────

export type GoalCategory =
  | 'income' | 'fitness' | 'learning' | 'launch' | string;

export interface Gap {
  category:               GoalCategory;
  current:                number;
  target:                 number;
  unit:                   string;
  deadline:               Date;
  weeklyVelocityNeeded:   number;
  currentVelocity:        number;
  weeksRemaining:         number;
  percentClosed:          number;
}

export interface Path {
  id:                     string;
  name:                   string;
  description:            string;
  estimatedWeeks:         number;
  confidenceScore:        number;        // 0–100
  requiredHoursPerWeek:   number;
  milestones:             Milestone[];
  tags:                   string[];
}

export interface Milestone {
  week:         number;
  description:  string;
  metric:       number;
  unit:         string;
}

export interface Mission {
  id:             string;
  title:          string;
  description:    string;
  estimatedHours: number;
  status:         'pending' | 'complete' | 'missed';
  week:           number;
  pathId:         string;
  goalId:         string;
  xp:             number;
  difficulty:     1 | 2 | 3;
  createdAt:      Date;
}

export interface OperatorScore {
  execution:        number;   // % missions completed
  consistency:      number;   // streak score
  capitalVelocity:  number;   // gap-closing rate
  reflection:       number;   // recap bonus
  total:            number;   // weighted composite
  rank:             'Recruit' | 'Operator' | 'Ghost' | 'Apex';
  xp:               number;
  weekNumber:       number;
}

export interface GoatState {
  goalId:       string;
  goal:         string;
  category:     GoalCategory;
  gap:          Gap;
  activePath:   Path | null;
  missions:     Mission[];
  score:        OperatorScore;
  weekNumber:   number;
  createdAt:    Date;
}

export interface WeekSummary {
  weekNumber:         number;
  score:              OperatorScore;
  missionsCompleted:  number;
  missionsTotal:      number;
  gapAtWeekEnd:       number;
  embedding?:         number[];
}

// ─── plugin 1: playbook ──────────────────────────────────────────────────────
// lowest barrier. JSON + this interface. no infra knowledge needed.

export interface IPlaybookPlugin {
  readonly name:        string;
  readonly category:    GoalCategory;
  readonly version:     string;
  readonly description: string;
  getPaths(gap: Gap): Path[];
  scorePath(path: Path, state: GoatState): number;
  getMissions(path: Path, week: number, difficulty: 1 | 2 | 3): Mission[];
  getMilestoneMessage?(milestone: Milestone): string;
}

// ─── plugin 2: provider ──────────────────────────────────────────────────────
// any AI model. implement 2 methods. runs offline with Ollama.

export interface CompletionOptions {
  model?:         string;
  maxTokens?:     number;
  temperature?:   number;
  systemPrompt?:  string;
  context?:       string[];
}

export interface IProviderPlugin {
  readonly name:               string;
  readonly version:            string;
  readonly supportsStreaming:   boolean;
  complete(prompt: string, opts?: CompletionOptions): Promise<string>;
  stream(prompt: string, opts?: CompletionOptions): AsyncGenerator<string>;
  embed?(text: string): Promise<number[]>;
}

// ─── plugin 3: renderer ──────────────────────────────────────────────────────
// how state is displayed. terminal, Obsidian, Notion, Raycast, web.

export interface IRendererPlugin {
  readonly name:    string;
  readonly version: string;
  renderDashboard(state: GoatState): void | Promise<void>;
  renderMissions(missions: Mission[]): void | Promise<void>;
  renderScore(score: OperatorScore): void | Promise<void>;
  renderRecap?(week: WeekSummary): void | Promise<void>;
  onGoalReached?(state: GoatState): void | Promise<void>;
}

// ─── plugin 4: storage ───────────────────────────────────────────────────────
// SQLite by default. swap for Supabase, Turso, PocketBase, anything.

export interface IStorageAdapter {
  readonly name:    string;
  readonly version: string;
  initialize(): Promise<void>;
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
  transaction<T>(fn: () => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

// ─── plugin 5: hook ──────────────────────────────────────────────────────────
// SIMPLEST plugin type. 20 lines of code max.
// perfect for: Discord alerts, Slack messages, webhooks, tweets.
// this is the entry point that gets 200 contributors.

export type HookName =
  | 'before:init'       | 'after:init'
  | 'before:plan'       | 'after:plan'
  | 'on:mission-complete'
  | 'on:mission-missed'
  | 'on:goal-reached'
  | 'on:week-recalibrate'
  | 'on:behind-pace'
  | 'before:score'      | 'after:score'
  | 'on:rank-up';

export interface IHookPlugin {
  readonly name:    string;
  readonly version: string;
  hooks: Partial<Record<HookName, (payload: unknown) => void | Promise<void>>>;
}

// ─── plugin manifest ─────────────────────────────────────────────────────────

export const PluginManifestSchema = z.object({
  name:         z.string(),
  version:      z.string(),
  description:  z.string(),
  type:         z.enum(['playbook','provider','renderer','storage','hook']),
  register:     z.string(),
  permissions:  z.array(z.enum([
    'read:state','write:state',
    'read:vault','write:vault',
    'network','filesystem'
  ])).default([]),
  keywords:     z.array(z.string()).default([]),
  author:       z.string().optional(),
  homepage:     z.string().url().optional(),
});

export type PluginManifest = z.infer<typeof PluginManifestSchema>;
