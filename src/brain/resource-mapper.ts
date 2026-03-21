import { ResourceProfile } from '../types/resource.js';
import { Goal } from '../types/goal.js';

export class ResourceMapper {
  /**
   * Generates the system prompt to parse a single English sentence into a structured Goal.
   */
  static generateGoalExtractionPrompt(naturalLanguageStatement: string): string {
    return `
You are GoatBrain, the OpenGOAT intent parser.
Extract the structured goal data from this natural language statement:
"${naturalLanguageStatement}"

Rules:
- Current value is usually 0 unless implied otherwise.
- Infer the category (e.g. income, fitness, learning, audience, product).
- If unit is implied as currency, use '$' or the specified currency.
- If deadline is implied (e.g. "by august"), calculate the exact YYYY-MM-DD representing the end of that period for the year 2026.

Return exactly this JSON interface:
{
  "statement": "${naturalLanguageStatement}",
  "category": "string",
  "currentVal": 0,
  "targetVal": number,
  "unit": "string",
  "deadline": "YYYY-MM-DD"
}

Output JSON only. No markdown. No intro.
`;
  }

  /**
   * Generates the system prompt to deeply parse the user's conversational answers 
   * across the 5 Resource Dimensions into the strict ResourceProfile schema.
   */
  static generateProfileExtractionPrompt(answers: {
    time: string,
    capital: string,
    skills: string,
    network: string,
    assets: string
  }): string {
    return `
You are GoatBrain, mapping a user's organic answers into a strict 5D Resource Profile.

Here are the user's answers to the 5 dimensions:
Time: "${answers.time}"
Capital: "${answers.capital}"
Skills: "${answers.skills}"
Network: "${answers.network}"
Assets: "${answers.assets}"

Parse these answers directly into this strict JSON schema. Extract numbers intelligently.
If an array is requested, split their answers logically.

interface ResourceProfile {
  time: {
    hoursPerDay: number;
    peakHours: 'morning' | 'afternoon' | 'evening';
    daysPerWeek: number;
    hardConstraints: string[];
  };
  capital: {
    deployable: number;
    monthlyIncome: number;
    runway: number;
    willingToSpend: boolean;
  };
  skills: string[];
  tools: string[];
  triedBefore: string[];
  unfairAdvantage: string;
  network: {
    hasExistingAudience: boolean;
    audienceSize: number;
    platforms: string[];
    keyConnections: string[];
    communities: string[];
  };
  assets: string[];
}

Return ONLY the valid JSON object matching the ResourceProfile layout. No markdown context.
`;
  }
}
