class PluginRegistry {
    playbooks = new Map();
    providers = new Map();
    renderers = new Map();
    storage = null;
    registerPlaybook(plugin) {
        this.playbooks.set(plugin.name, plugin);
    }
    registerProvider(plugin) {
        this.providers.set(plugin.name, plugin);
    }
    registerRenderer(plugin) {
        this.renderers.set(plugin.name, plugin);
    }
    setStorage(adapter) {
        this.storage = adapter;
    }
    getPlaybooks() { return Array.from(this.playbooks.values()); }
    getProviders() { return Array.from(this.providers.values()); }
    getProvider(name) { return this.providers.get(name); }
    getStorage() { return this.storage; }
}
export const pluginRegistry = new PluginRegistry();
