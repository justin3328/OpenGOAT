import { AnthropicProvider } from '../plugins/builtin/providers/anthropic.js';
import { OpenAIProvider } from '../plugins/builtin/providers/openai.js';
import { GroqProvider } from '../plugins/builtin/providers/groq.js';
import { OllamaProvider } from '../plugins/builtin/providers/ollama.js';
import { IProviderPlugin } from '../types/plugin.js';
import { SecretStore } from './secret-store.js';

/**
 * Default models per provider.
 * Keep these updated as provider APIs evolve.
 * Prefer cost-efficient models by default.
 */
const DEFAULT_MODELS: Record<string, string> = {
  groq: 'llama-3.3-70b-versatile',
  anthropic: 'claude-3-5-haiku-20241022', // not opus — 10x cheaper for coaching tasks
  openai: 'gpt-4o-mini',                  // not gpt-4o — 15x cheaper for coaching tasks
  ollama: 'llama3.1'
};

/**
 * Instantiates the correct AI Provider based on user selection.
 * Uses SecretStore (cross-platform, no native binaries) for key retrieval.
 * Falls back to OPENGOAT_API_KEY_<PROVIDER> env vars for CI/headless.
 */
export async function getProviderInstance(providerName: string): Promise<IProviderPlugin> {
  const norm = providerName.toLowerCase();
  
  if (norm.includes('ollama')) {
    return new OllamaProvider();
  }
  
  const key = SecretStore.get('opengoat', norm);
  if (!key) {
    throw new Error(
      `No API key found for "${providerName}".\n` +
      `  Option 1: Run \`opengoat init\` to set up your provider.\n` +
      `  Option 2: Set the env var OPENGOAT_API_KEY_${norm.toUpperCase()}=<your-key>`
    );
  }

  if (norm.includes('anthropic')) {
    process.env.ANTHROPIC_API_KEY = key;
    return new AnthropicProvider(key);
  }
  
  if (norm.includes('openai')) {
    process.env.OPENAI_API_KEY = key;
    return new OpenAIProvider(key);
  }
  
  if (norm.includes('groq')) {
    process.env.GROQ_API_KEY = key;
    return new GroqProvider(key);
  }

  throw new Error(`Unknown provider: ${providerName}`);
}

/**
 * Standardizes invoking the model.
 * Wraps in try/catch so HUD sessions survive API failures gracefully.
 */
export async function invokeModel(provider: IProviderPlugin, prompt: string): Promise<string> {
  try {
    const modelStr = DEFAULT_MODELS[provider.name.toLowerCase()] || 'gpt-4o-mini';
    return await provider.complete(prompt, { model: modelStr });
  } catch (error: any) {
    console.error(`\n[BRAIN OFFLINE] AI Model Inference Failed: ${error.message}`);
    // Return empty fallback string so parsers can fail gracefully without crashing
    return '';
  }
}
