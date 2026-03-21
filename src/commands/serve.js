import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { storage } from '../lib/storage.js';
import { calculateScore } from '../lib/score.js';
import { infoBox } from '../lib/display.js';
import { markDone, markMissed } from './missions.js';
import { logEarning } from './log.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '../../');

export async function serve() {
  const server = http.createServer(async (req, res) => {
    // Enable CORS for development
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const { url, method } = req;

    // Static files
    if (url === '/' || url === '/index.html') {
      const htmlPath = path.join(PROJECT_ROOT, 'web', 'index.html');
      if (fs.existsSync(htmlPath)) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(fs.readFileSync(htmlPath));
      } else {
        res.writeHead(404);
        res.end('Web UI not found. Run buildup first.');
      }
      return;
    }

    // API: GetData
    if (url === '/api/data' && method === 'GET') {
      const config = storage.getConfig();
      if (!config) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not initialised' }));
        return;
      }
      const missions = storage.getMissions();
      const earnings = storage.getEarnings();
      const stats = calculateScore(config, missions, earnings);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ config, missions, earnings, stats }));
      return;
    }

    // API: Mark Done
    if (url.startsWith('/api/done/') && method === 'POST') {
      const id = parseInt(url.split('/').pop());
      await markDone(id);
      res.writeHead(200);
      res.end(JSON.stringify({ success: true }));
      return;
    }

    // API: Mark Missed
    if (url.startsWith('/api/missed/') && method === 'POST') {
      const id = parseInt(url.split('/').pop());
      await markMissed(id);
      res.writeHead(200);
      res.end(JSON.stringify({ success: true }));
      return;
    }

    // API: Log Earning
    if (url === '/api/log' && method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const { amount, description } = JSON.parse(body);
          await logEarning(amount, description);
          res.writeHead(200);
          res.end(JSON.stringify({ success: true }));
        } catch (e) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid payload' }));
        }
      });
      return;
    }

    res.writeHead(404);
    res.end('Not Found');
  });

  const PORT = 4321;
  server.listen(PORT, () => {
    console.log(infoBox([
      `  ${'INCOME-AGENT WEB UI'}`,
      `  Running at http://localhost:${PORT}`,
      `  Press Ctrl+C to stop`,
    ], '#4ADE80'));
  });
}
