import { ResourceProfile } from '../types/resource.js';
import { Goal } from '../types/goal.js';
import { GoalPath } from '../types/path.js';

export class PathGenerator {
  /**
   * Generates the system prompt instructing the AI to generate the Ranked Top 5 paths
   * matching the user's specific resources.
   */
  static generatePrompt(goal: Goal, profile: ResourceProfile): string {
    return `
You are GoatBrain — the intelligence engine of OpenGOAT.
A person has a goal and a specific set of resources.
Your job: generate exactly 5 paths to close their gap.

CRITICAL RULES:
- Every path must be built around THEIR specific resources
- Rank by one metric only: speed to close the gap given what they have NOW
- Be brutally honest about skill gaps and resource mismatches
- The #1 path must be startable within 2 hours with zero additional resources
- Never generate generic advice. Specific means specific.
- Include a first action for each path that takes under 2 hours
- Return ONLY valid JSON. Zero markdown. Zero explanation.

Goal: ${goal.statement}
Current: ${goal.currentVal} ${goal.unit}
Target: ${goal.targetVal} ${goal.unit}
Deadline: ${goal.deadline}
Resource profile: ${JSON.stringify(profile, null, 2)}

Generate 5 paths as a JSON array matching exactly this TypeScript interface:
interface Path {
  id: string; // generate a random uuid string
  name: string;
  tagline: string;
  whyFastest: string;
  confidenceScore: number;
  weeksToClose: number;
  weeklyHoursRequired: number;
  capitalRequired: number;
  skillGaps: string[];
  resourceFit: { time: string, capital: string, skills: string, network: string, overall: number };
  milestones: { week: number, description: string, metric: number, unit: string }[];
  firstAction: { description: string, timeRequired: number, output: string };
  rank: 1 | 2 | 3 | 4 | 5;
}

Output JSON array only. No code blocks. No intro.
`;
  }
}
