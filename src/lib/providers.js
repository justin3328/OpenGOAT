import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import Groq from 'groq-sdk';
import { getMissionPrompt } from '../prompts/mission-gen.js';

// Model to use per provider — best quality defaults
const MODELS = {
  anthropic: 'claude-opus-4-6',
  openai:    'gpt-4o',
  groq:      'llama-3.3-70b-versatile'
};

export async function generateMissions(config) {
  const { provider, apiKey, goal, model: incomeModel, week } = config;
  const prompt = getMissionPrompt(goal, incomeModel, week);

  switch (provider) {
    case 'anthropic': {
      const client = new Anthropic({ apiKey });
      const msg = await client.messages.create({
        model: MODELS.anthropic,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      });
      return parseResponse(msg.content[0].text);
    }

    case 'openai': {
      const client = new OpenAI({ apiKey });
      const res = await client.chat.completions.create({
        model: MODELS.openai,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      });
      return parseResponse(res.choices[0].message.content);
    }

    case 'groq': {
      const client = new Groq({ apiKey });
      const res = await client.chat.completions.create({
        model: MODELS.groq,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      });
      return parseResponse(res.choices[0].message.content);
    }

    default:
      throw new Error(`Unknown provider: ${provider}. Run income-agent init to reconfigure.`);
  }
}

function parseResponse(text) {
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}
