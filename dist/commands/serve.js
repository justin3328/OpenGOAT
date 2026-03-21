import express from 'express';
import { storage } from '../lib/storage.js';
import { calculateScore } from '../lib/score-engine.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '../../');
export async function startServer() {
    const app = express();
    const PORT = 4321;
    app.use(express.json());
    // Static Dashboard
    app.get('/', (req, res) => {
        const htmlPath = path.join(PROJECT_ROOT, 'web', 'index.html');
        if (fs.existsSync(htmlPath)) {
            res.sendFile(htmlPath);
        }
        else {
            res.status(404).send('Web UI not found.');
        }
    });
    // API: Get State
    app.get('/api/state', (req, res) => {
        const goal = storage.get('goal');
        const category = storage.get('category');
        const gap = storage.get('gap');
        const activePath = storage.get('activePath');
        const missions = storage.get('missions') || [];
        const weekNumber = storage.get('weekNumber') || 1;
        const createdAt = storage.get('createdAt');
        const score = calculateScore(missions, weekNumber);
        res.json({
            goal,
            category,
            gap,
            activePath,
            missions,
            score,
            weekNumber,
            createdAt
        });
    });
    app.listen(PORT, () => {
        console.log(`\n  🐐 OPENGOAT WEB UI`);
        console.log(`  Running at http://localhost:${PORT}`);
        console.log(`  Press Ctrl+C to stop\n`);
    });
}
