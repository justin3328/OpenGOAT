import type { IPlaybookPlugin, IProviderPlugin, IRendererPlugin, IStorageAdapter } from '../types/index.js';

class PluginRegistry {
  private playbooks: Map<string, IPlaybookPlugin> = new Map();
  private providers: Map<string, IProviderPlugin> = new Map();
  private renderers: Map<string, IRendererPlugin> = new Map();
  private storage: IStorageAdapter | null = null;

  registerPlaybook(plugin: IPlaybookPlugin) {
    this.playbooks.set(plugin.name, plugin);
  }

  registerProvider(plugin: IProviderPlugin) {
    this.providers.set(plugin.name, plugin);
  }

  registerRenderer(plugin: IRendererPlugin) {
    this.renderers.set(plugin.name, plugin);
  }

  setStorage(adapter: IStorageAdapter) {
    this.storage = adapter;
  }

  getPlaybooks() { return Array.from(this.playbooks.values()); }
  getProviders() { return Array.from(this.providers.values()); }
  getProvider(name: string) { return this.providers.get(name); }
  getStorage() { return this.storage; }
}

export const pluginRegistry = new PluginRegistry();
