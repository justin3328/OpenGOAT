import Groq from 'groq-sdk';
export class GroqProvider {
    name = 'groq';
    version = '1.0.0';
    client;
    constructor(apiKey) {
        this.client = new Groq({ apiKey });
    }
    async complete(prompt, opts) {
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
