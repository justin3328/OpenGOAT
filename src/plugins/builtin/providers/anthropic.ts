import Anthropic from '@anthropic-ai/sdk';
import type { IProviderPlugin, CompletionOptions } from '../../../types/index.js';

export class AnthropicProvider implements IProviderPlugin {
  readonly supportsStreaming = true;
  name = 'anthropic';
  version = '1.0.0';
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async complete(prompt: string, opts?: CompletionOptions): Promise<string> {
    const res = await this.client.messages.create({
      model: opts?.model || 'claude-3-opus-20240229',
      max_tokens: opts?.maxTokens || 1024,
      system: opts?.systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = res.content[0];
    return content.type === 'text' ? content.text : '';
  }

  async *stream(prompt: string, opts?: CompletionOptions): AsyncGenerator<string> {
    const text = await this.complete(prompt, opts);
    yield text;
  }
}
