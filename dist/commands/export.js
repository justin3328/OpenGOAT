import fs from 'node:fs';
import { storage } from '../lib/storage.js';
import chalk from 'chalk';
export async function exportMarkdown() {
    const state = storage.getAll();
    const date = new Date().toISOString().split('T')[0];
    const filename = `opengoat-export-${date}.md`;
    let content = `# OpenGOAT Export — ${date}\n\n`;
    content += `## Goal: ${state.goal}\n`;
    content += `## Path: ${state.activePath?.name}\n\n`;
    content += `## Current Week: ${state.weekNumber}\n\n`;
    content += `## Missions\n`;
    const missions = state.missions || [];
    missions.forEach(m => {
        content += `- [${m.status === 'complete' ? 'x' : ' '}] ${m.title} (${m.estimatedHours}h, ${m.xp} XP)\n`;
    });
    fs.writeFileSync(filename, content);
    console.log(`\n  ${chalk.green('✓')} Data exported to ${filename}\n`);
}
