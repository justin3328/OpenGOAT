import { PluginManifest } from '../types/index.js';

/**
 * Wraps a plugin to enforce declared permissions.
 */
export function createSandboxedPlugin<T extends object>(plugin: T, manifest: PluginManifest): T {
  const permissions = new Set(manifest.permissions);

  return new Proxy(plugin, {
    get(target: any, prop: string) {
      // Permission checks for specific methods or access patterns
      if (prop === 'writeToDisk' && !permissions.has('filesystem')) {
        throw new Error(`Permission Denied: 'filesystem' required for plugin '${manifest.name}'`);
      }
      if (prop === 'fetch' && !permissions.has('network')) {
         throw new Error(`Permission Denied: 'network' required for plugin '${manifest.name}'`);
      }

      const val = target[prop];
      if (typeof val === 'function') {
        return val.bind(target);
      }
      return val;
    }
  });
}
