import fs from 'node:fs/promises';
import path from 'node:path';
export async function loadPlaybooks(playbooksDir: string) {
  const categories = await fs.readdir(playbooksDir);
  const playbooks: any[] = [];

  for (const category of categories) {
    const categoryPath = path.join(playbooksDir, category);
    const stats = await fs.stat(categoryPath);
    
    if (stats.isDirectory()) {
      const files = await fs.readdir(categoryPath);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(path.join(categoryPath, file), 'utf-8');
          try {
            const data = JSON.parse(content);
            playbooks.push(data);
          } catch(e) {
            console.error(`Invalid JSON playbook: ${file}`);
          }
        }
      }
    }
  }

  return playbooks;
}
