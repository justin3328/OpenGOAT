import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';
import { pluginRegistry } from './plugin-registry.js';
import chalk from 'chalk';

const SKILLS_DIR = path.join(os.homedir(), '.opengoat', 'skills');

/**
 * Inspired by OpenClaw's ClawHub architecture.
 * Dynamically loads user-created plugins from ~/.opengoat/skills
 */
export async function loadLocalSkills() {
  try {
    // Ensure the skills directory exists
    try {
      await fs.access(SKILLS_DIR);
    } catch {
      await fs.mkdir(SKILLS_DIR, { recursive: true });
      return; // Newly created, no skills to load
    }

    const entries = await fs.readdir(SKILLS_DIR, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const skillPath = path.join(SKILLS_DIR, entry.name);
        
        // We look for an index.js (or index.mjs) file as the entry point
        const entryPoint = path.join(skillPath, 'index.js');
        const entryPointMjs = path.join(skillPath, 'index.mjs');

        let targetFile: string | null = null;
        
        try { await fs.access(entryPoint); targetFile = entryPoint; } catch {}
        if (!targetFile) {
          try { await fs.access(entryPointMjs); targetFile = entryPointMjs; } catch {}
        }

        if (targetFile) {
          try {
            // Must use file:// protocol for dynamic ESM imports in Windows/Linux absolute paths
            const fileUrl = new URL(`file://${targetFile}`).href;
            const module = await import(fileUrl);
            
            if (module.default && typeof module.default === 'function') {
              const plugin = module.default();
              
              if (plugin.name && plugin.category) {
                pluginRegistry.registerPlaybook(plugin);
                // In verbose mode, we could log: console.log(`Loaded local skill: ${plugin.name}`)
              }
            } else if (module.plugin) {
               // Fallback if they export `plugin` object directly
               pluginRegistry.registerPlaybook(module.plugin);
            }
          } catch (e: any) {
             console.error(chalk.yellow(`[SkillsLoader] Failed to load skill '${entry.name}': ${e.message}`));
          }
        }
      }
    }
  } catch (e: any) {
    console.error(chalk.red(`[SkillsLoader] Critical failure reading ~/.opengoat/skills: ${e.message}`));
  }
}
