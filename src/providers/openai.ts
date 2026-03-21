import OpenAI from 'openai';
import type { IProviderPlugin, CompletionOptions } from '../types/index.js';

export class OpenAIProvider implements IProviderPlugin {
  name = 'openai';
  version = '1.0.0';
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async complete(prompt: string, opts?: CompletionOptions): Promise<string> {
    const res = await this.client.chat.completions.create({
      model: opts?.model || 'gpt-4o',
      messages: [
        { role: 'system', content: opts?.systemPrompt || '' },
        { role: 'user', content: prompt }
      ],
      max_tokens: opts?.maxTokens,
      temperature: opts?.temperature
    });

    return res.choices[0]?.message?.content || '';
  }
}
