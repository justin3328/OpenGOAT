import { GoalsRepo } from '../data/repos/goals.repo.js';
import { PathsRepo } from '../data/repos/paths.repo.js';
import { GapsRepo } from '../data/repos/gaps.repo.js';
import { ScoresRepo } from '../data/repos/scores.repo.js';
import { storage } from '../lib/storage.js';
import chalk from 'chalk';
import path from 'node:path';
import cors from 'cors';

export async function startServer(portStr?: string) {
  // Dynamically import express so it doesn't slow down CLI boots
  const express = (await import('express')).default;
  const app = express();
  const port = Number(portStr) || 3000;

  app.use(express.json());
  app.use(cors());

  // Serve static Web UI
  const webPath = path.join(process.cwd(), 'web');
  app.use(express.static(webPath));

  app.get('/api/state', async (req, res) => {
    const goalId = await storage.get<string>('active_goal_id');
    if (!goalId) return res.status(404).json({ error: 'No active goal' });
    
    const goal = GoalsRepo.getById(goalId);
    const p = PathsRepo.getActivePath(goalId);
    const history = GapsRepo.getSeries(goalId);
    const scores = ScoresRepo.getScores(goalId, 1);
    
    res.json({
      goal: goal?.statement,
      gap: {
        current: goal?.currentVal,
        target: goal?.targetVal,
        unit: goal?.unit
      },
      score: {
        total: scores.length > 0 ? scores[0].total : 0,
        rank: scores.length > 0 ? scores[0].rank : 'RECRUIT',
        xp: scores.length > 0 ? scores[0].xp : 0
      },
      path: p?.name,
      historyCount: history.length
    });
  });

  // SSE: Live-stream state updates every 2 seconds — replaces 10s polling
  app.get('/api/state/stream', async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const buildPayload = async () => {
      const goalId = await storage.get<string>('active_goal_id');
      if (!goalId) return { error: 'No active goal' };
      const goal = GoalsRepo.getById(goalId);
      const p = PathsRepo.getActivePath(goalId);
      const history = GapsRepo.getSeries(goalId);
      const scores = ScoresRepo.getScores(goalId, 1);
      return {
        goal: goal?.statement,
        gap: { current: goal?.currentVal, target: goal?.targetVal, unit: goal?.unit },
        score: { total: scores[0]?.total || 0, rank: scores[0]?.rank || 'RECRUIT', xp: scores[0]?.xp || 0 },
        path: p?.name,
        historyCount: history.length,
        ts: Date.now()
      };
    };

    // Send immediately
    res.write(`data: ${JSON.stringify(await buildPayload())}\n\n`);

    const interval = setInterval(async () => {
      try {
        res.write(`data: ${JSON.stringify(await buildPayload())}\n\n`);
      } catch {
        clearInterval(interval);
      }
    }, 2000);

    req.on('close', () => clearInterval(interval));
  });

  app.get('/api/v1/goal', async (req, res) => {
    const goalId = await storage.get<string>('active_goal_id');
    if (!goalId) return res.status(404).json({ error: 'No active goal' });
    const goal = GoalsRepo.getById(goalId);
    res.json(goal);
  });

  app.get('/api/v1/paths/active', async (req, res) => {
    const goalId = await storage.get<string>('active_goal_id');
    if (!goalId) return res.status(404).json({ error: 'No active goal' });
    const p = PathsRepo.getActivePath(goalId);
    res.json(p);
  });

  app.get('/api/v1/gap/history', async (req, res) => {
    const goalId = await storage.get<string>('active_goal_id');
    if (!goalId) return res.status(404).json({ error: 'No active goal' });
    const history = GapsRepo.getSeries(goalId);
    res.json(history);
  });

  app.post('/api/v1/gap/log', async (req, res) => {
    const goalId = await storage.get<string>('active_goal_id');
    if (!goalId) return res.status(404).json({ error: 'No active goal' });
    const { value, note } = req.body;
    const entry = GapsRepo.log(goalId, Number(value), note);
    GoalsRepo.updateCurrentValue(goalId, Number(value));
    res.json(entry);
  });

  app.listen(port, async () => {
    const url = `http://localhost:${port}`;
    console.log(chalk.green(`\n🚀 OpenGOAT API running on ${url}`));
    console.log(chalk.hex('#1D9E75')(`   SSE live stream: ${url}/api/state/stream`));
    console.log(chalk.dim(`   Hook in your Obsidian/Notion/iOS plugins to read the local gap state.\n`));
    // Auto-open the web UI in the browser
    const { default: open } = await import('open').catch(() => ({ default: null as any }));
    if (open) open(url);
  });
}
