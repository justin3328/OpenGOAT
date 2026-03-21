export function getMissionPrompt(state) {
    const { goal, gap, activePath, weekNumber, score } = state;
    if (!activePath)
        throw new Error('No active path selected');
    const context = `
YOU ARE OPENGOAT 🐐 — A PRECISION GOAL ENGINE.
GENERATE 5 SPECIFIC MISSIONS FOR THE USER.

CONTEXT:
GOAL: ${goal}
GAP: ${gap.current} to ${gap.target} ${gap.unit} (${Math.ceil((gap.deadline.getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000))} weeks left)
PATH: ${activePath.name} - ${activePath.description}
WEEK: ${weekNumber}
LAST SCORE: ${score?.total || 'N/A'}

RULES:
1. Return ONLY a valid JSON array. No markdown, no explanation.
2. Each mission MUST be specific, measurable, and actionable.
3. Total estimated hours should be around ${activePath.requiredHoursPerWeek}h.
4. XP should be 50-200 based on diffculty.
  `;
    return context;
}
export function parseMissions(json) {
    try {
        const raw = JSON.parse(json);
        if (!Array.isArray(raw))
            throw new Error('Response is not an array');
        return raw.map((m, i) => ({
            id: m.id || crypto.randomUUID(),
            title: m.title,
            description: m.description,
            estimatedHours: m.estimatedHours || 2,
            status: 'pending',
            week: m.week || 1,
            pathId: m.pathId || 'active',
            xp: m.xp || 100
        }));
    }
    catch (e) {
        console.error('Failed to parse missions JSON', e);
        return [];
    }
}
