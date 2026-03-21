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
export declare const PlaybookSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    category: z.ZodString;
    description: z.ZodString;
    paths: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        estimatedWeeks: z.ZodNumber;
        confidenceScore: z.ZodNumber;
        requiredHoursPerWeek: z.ZodNumber;
        milestones: z.ZodArray<z.ZodObject<{
            week: z.ZodNumber;
            description: z.ZodString;
            metric: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            description: string;
            week: number;
            metric: number;
        }, {
            description: string;
            week: number;
            metric: number;
        }>, "many">;
        tags: z.ZodArray<z.ZodString, "many">;
        missionTemplates: z.ZodArray<z.ZodObject<{
            title: z.ZodString;
            description: z.ZodString;
            estimatedHours: z.ZodNumber;
            xp: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            description: string;
            title: string;
            estimatedHours: number;
            xp: number;
        }, {
            description: string;
            title: string;
            estimatedHours: number;
            xp: number;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        description: string;
        estimatedWeeks: number;
        confidenceScore: number;
        requiredHoursPerWeek: number;
        milestones: {
            description: string;
            week: number;
            metric: number;
        }[];
        tags: string[];
        missionTemplates: {
            description: string;
            title: string;
            estimatedHours: number;
            xp: number;
        }[];
    }, {
        id: string;
        name: string;
        description: string;
        estimatedWeeks: number;
        confidenceScore: number;
        requiredHoursPerWeek: number;
        milestones: {
            description: string;
            week: number;
            metric: number;
        }[];
        tags: string[];
        missionTemplates: {
            description: string;
            title: string;
            estimatedHours: number;
            xp: number;
        }[];
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    category: string;
    description: string;
    paths: {
        id: string;
        name: string;
        description: string;
        estimatedWeeks: number;
        confidenceScore: number;
        requiredHoursPerWeek: number;
        milestones: {
            description: string;
            week: number;
            metric: number;
        }[];
        tags: string[];
        missionTemplates: {
            description: string;
            title: string;
            estimatedHours: number;
            xp: number;
        }[];
    }[];
}, {
    id: string;
    name: string;
    category: string;
    description: string;
    paths: {
        id: string;
        name: string;
        description: string;
        estimatedWeeks: number;
        confidenceScore: number;
        requiredHoursPerWeek: number;
        milestones: {
            description: string;
            week: number;
            metric: number;
        }[];
        tags: string[];
        missionTemplates: {
            description: string;
            title: string;
            estimatedHours: number;
            xp: number;
        }[];
    }[];
}>;
