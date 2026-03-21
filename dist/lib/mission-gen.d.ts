import type { GoatState, Mission } from '../types/index.js';
export declare function getMissionPrompt(state: GoatState): string;
export declare function parseMissions(json: string): Mission[];
