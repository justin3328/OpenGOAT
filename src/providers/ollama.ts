import type { IProviderPlugin, CompletionOptions } from '../types/index.js';

export class OllamaProvider implements IProviderPlugin {
  name = 'ollama';
  version = '1.0.0';
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
  }

  async complete(prompt: string, opts?: CompletionOptions): Promise<string> {
    const res = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      body: JSON.stringify({
        model: opts?.model || 'llama2',
        prompt: prompt,
        system: opts?.systemPrompt,
        stream: false
      })
    });

    const data: any = await res.json();
    return data.response || '';
  }
}
