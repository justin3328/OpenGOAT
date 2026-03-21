import { PluginManifest, PluginManifestSchema } from '../types/index.js';
import { z } from 'zod';
import path from 'node:path';
import fs from 'node:fs';

export class PluginRegistry {
  private plugins: Map<string, { plugin: any; manifest: PluginManifest }> = new Map();

  async register(pluginPath: string) {
    const manifestPath = path.join(pluginPath, 'opengoat.plugin.json');
    if (!fs.existsSync(manifestPath)) {
      throw new Error(`Plugin manifest not found at ${manifestPath}`);
    }

    const rawManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const manifest = PluginManifestSchema.parse(rawManifest);

    // Dynamic import of the plugin's register file
    const modulePath = path.isAbsolute(manifest.register) 
      ? manifest.register 
      : path.resolve(pluginPath, manifest.register);
      
    const { default: plugin } = await import(modulePath);

    this.plugins.set(manifest.name, { plugin, manifest });
    return manifest;
  }

  getPluginsByType(type: PluginManifest['type']) {
    return Array.from(this.plugins.values())
      .filter(p => p.manifest.type === type)
      .map(p => p.plugin);
  }

  getPlugin(name: string) {
    return this.plugins.get(name);
  }

  getAll() {
    return Array.from(this.plugins.values());
  }
}

export const registry = new PluginRegistry();
