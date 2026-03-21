import type { IProviderPlugin, CompletionOptions } from '../types/index.js';
export declare class OllamaProvider implements IProviderPlugin {
    name: string;
    version: string;
    private baseUrl;
    constructor(baseUrl?: string);
    complete(prompt: string, opts?: CompletionOptions): Promise<string>;
}
