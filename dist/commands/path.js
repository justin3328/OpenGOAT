import { storage } from '../lib/storage.js';
import { banner, gapMeter, pathTable } from '../lib/display.js';
import { rankPaths } from '../lib/path-engine.js';
import { loadPlaybooks } from '../lib/playbook-loader.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export async function showPath() {
    const goal = storage.get('goal');
    const gap = storage.get('gap');
    const activePath = storage.get('activePath');
    if (!goal || !gap) {
        console.log('  Not initialised. Run opengoat init first.');
        return;
    }
    banner();
    console.log(`  GOAL: ${goal}`);
    gapMeter(gap);
    const playbooks = await loadPlaybooks(path.join(__dirname, '../../playbooks'));
    const filteredPaths = playbooks
        .filter(p => p.category === gap.category)
        .flatMap(p => p.paths);
    const ranked = rankPaths(filteredPaths, gap);
    console.log('\n  PATH ANALYSIS:');
    pathTable(ranked);
    if (activePath) {
        console.log(`  ACTIVE PATH: ${activePath.name}`);
    }
}
