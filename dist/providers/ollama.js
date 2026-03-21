export class OllamaProvider {
    name = 'ollama';
    version = '1.0.0';
    baseUrl;
    constructor(baseUrl = 'http://localhost:11434') {
        this.baseUrl = baseUrl;
    }
    async complete(prompt, opts) {
        const res = await fetch(`${this.baseUrl}/api/generate`, {
            method: 'POST',
            body: JSON.stringify({
                model: opts?.model || 'llama2',
                prompt: prompt,
                system: opts?.systemPrompt,
                stream: false
            })
        });
        const data = await res.json();
        return data.response || '';
    }
}
