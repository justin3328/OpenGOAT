import { Goal } from '../types/goal.js';
import { ResourceProfile } from '../types/resource.js';

export class ConstraintIdentifier {
  /**
   * Generates the system prompt to classify a user's constraint response and generate an unlock plan.
   */
  static generateConstraintPrompt(
    goal: Goal, 
    activePath: any, 
    resources: ResourceProfile, 
    userResponse: string
  ): string {
    return `
You are GoatBrain. The user working on the goal "${goal.statement}" has stalled.
When asked what is blocking them, they said:
"${userResponse}"

Their active path is: ${activePath?.name || 'Unknown'}
Their current resources: ${JSON.stringify(resources, null, 2)}

Identify which of these 6 constraint types this is:
- time (not enough hours -> time audit + ruthless cut)
- skill (missing capability -> fastest learning path)
- resource (need capital/tool/access -> creative workaround)
- clarity (don't know what to do -> path refinement)
- external (waiting on someone -> reframe to what you control)
- motivation (resistance/fear -> identity reconnection)

Then, generate ONE SINGLE UNLOCK ACTION. Not a task list. Not generic advice. 
Exactly ONE highly specific, resource-matched action they can do TODAY to unblock this constraint.

Return exactly this JSON interface:
{
  "constraintType": "time" | "skill" | "resource" | "clarity" | "external" | "motivation",
  "unlockAction": "The exact action description string"
}

Output JSON only. No markdown. No intro.
`;
  }
}
