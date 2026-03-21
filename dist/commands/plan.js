import ora from 'ora';
import { storage } from '../lib/storage.js';
import { getMissionPrompt, parseMissions } from '../lib/mission-gen.js';
import { AnthropicProvider } from '../providers/anthropic.js';
import { OpenAIProvider } from '../providers/openai.js';
import { GroqProvider } from '../providers/groq.js';
import { missionCard } from '../lib/display.js';
import { calculateScore } from '../lib/score-engine.js';
export async function planMissions() {
    const goal = storage.get('goal');
    const gap = storage.get('gap');
    const activePath = storage.get('activePath');
    const weekNumber = storage.get('weekNumber');
    const providerName = storage.get('provider');
    const apiKey = storage.get('apiKey');
    if (!activePath) {
        console.log('  No active path selected. Run opengoat init.');
        return;
    }
    const spinner = ora('Generating missions...').start();
    try {
        const state = { goal, gap, activePath, weekNumber, missions: [], score: calculateScore([], weekNumber), createdAt: new Date() };
        const prompt = getMissionPrompt(state);
        let provider;
        if (providerName === 'openai')
            provider = new OpenAIProvider(apiKey);
        else if (providerName === 'groq')
            provider = new GroqProvider(apiKey);
        else
            provider = new AnthropicProvider(apiKey);
        const res = await provider.complete(prompt, { systemPrompt: 'Return only valid JSON.' });
        const missions = parseMissions(res);
        storage.set('missions', missions);
        spinner.succeed(`Missions generated for Week ${weekNumber}`);
        console.log('');
        missionCard(missions);
        console.log('\n  Run opengoat missions to start tracking.\n');
    }
    catch (error) {
        spinner.fail(`Generation failed: ${error.message}`);
    }
}
