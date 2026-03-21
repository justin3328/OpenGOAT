import Groq from 'groq-sdk';
import type { IProviderPlugin, CompletionOptions } from '../types/index.js';

export class GroqProvider implements IProviderPlugin {
  name = 'groq';
  version = '1.0.0';
  private client: Groq;

  constructor(apiKey: string) {
    this.client = new Groq({ apiKey });
  }

  async complete(prompt: string, opts?: CompletionOptions): Promise<string> {
    const res = await this.client.chat.completions.create({
      model: opts?.model || 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: opts?.systemPrompt || '' },
        { role: 'user', content: prompt }
      ]
    });

    return res.choices[0]?.message?.content || '';
  }
}
