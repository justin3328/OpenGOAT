import type { IPlaybookPlugin, IProviderPlugin, IRendererPlugin, IStorageAdapter } from '../types/index.js';
declare class PluginRegistry {
    private playbooks;
    private providers;
    private renderers;
    private storage;
    registerPlaybook(plugin: IPlaybookPlugin): void;
    registerProvider(plugin: IProviderPlugin): void;
    registerRenderer(plugin: IRendererPlugin): void;
    setStorage(adapter: IStorageAdapter): void;
    getPlaybooks(): IPlaybookPlugin[];
    getProviders(): IProviderPlugin[];
    getProvider(name: string): IProviderPlugin | undefined;
    getStorage(): IStorageAdapter | null;
}
export declare const pluginRegistry: PluginRegistry;
export {};
