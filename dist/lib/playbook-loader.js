import fs from 'node:fs/promises';
import path from 'node:path';
import { PlaybookSchema } from '../types/index.js';
export async function loadPlaybooks(playbooksDir) {
    const categories = await fs.readdir(playbooksDir);
    const playbooks = [];
    for (const category of categories) {
        const categoryPath = path.join(playbooksDir, category);
        const stats = await fs.stat(categoryPath);
        if (stats.isDirectory()) {
            const files = await fs.readdir(categoryPath);
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const content = await fs.readFile(path.join(categoryPath, file), 'utf-8');
                    const data = JSON.parse(content);
                    const result = PlaybookSchema.safeParse(data);
                    if (result.success) {
                        playbooks.push(result.data);
                    }
                    else {
                        console.error(`Invalid playbook: ${file}`, result.error.format());
                    }
                }
            }
        }
    }
    return playbooks;
}
