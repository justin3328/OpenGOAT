import type { IProviderPlugin, CompletionOptions } from '../types/index.js';
export declare class AnthropicProvider implements IProviderPlugin {
    name: string;
    version: string;
    private client;
    constructor(apiKey: string);
    complete(prompt: string, opts?: CompletionOptions): Promise<string>;
}
