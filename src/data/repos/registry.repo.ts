import { getDB } from '../db.js';
import { PluginManifest } from '../../types/index.js';

export class RegistryRepo {
  static register(manifest: PluginManifest) {
    const db = getDB();
    db.prepare(`
      INSERT INTO plugin_registry (name, version, type, manifest)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(name) DO UPDATE SET
        version=excluded.version, type=excluded.type, manifest=excluded.manifest, installed_at=datetime("now")
    `).run(manifest.name, manifest.version, manifest.type, JSON.stringify(manifest));
  }

  static getPlugins(): any[] {
    const db = getDB();
    return db.prepare('SELECT * FROM plugin_registry').all();
  }
}
