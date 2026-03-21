import OpenAI from 'openai';
export class OpenAIProvider {
    name = 'openai';
    version = '1.0.0';
    client;
    constructor(apiKey) {
        this.client = new OpenAI({ apiKey });
    }
    async complete(prompt, opts) {
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
