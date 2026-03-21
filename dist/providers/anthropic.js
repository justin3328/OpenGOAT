import Anthropic from '@anthropic-ai/sdk';
export class AnthropicProvider {
    name = 'anthropic';
    version = '1.0.0';
    client;
    constructor(apiKey) {
        this.client = new Anthropic({ apiKey });
    }
    async complete(prompt, opts) {
        const res = await this.client.messages.create({
            model: opts?.model || 'claude-3-opus-20240229',
            max_tokens: opts?.maxTokens || 1024,
            system: opts?.systemPrompt,
            messages: [{ role: 'user', content: prompt }],
        });
        const content = res.content[0];
        return content.type === 'text' ? content.text : '';
    }
}
