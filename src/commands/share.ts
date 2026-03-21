import chalk from 'chalk';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { GoalsRepo } from '../data/repos/goals.repo.js';
import { ScoresRepo } from '../data/repos/scores.repo.js';
import { GapsRepo } from '../data/repos/gaps.repo.js';
import { storage } from '../lib/storage.js';

/**
 * Generates a viral HTML scorecard — no native dependencies, works everywhere.
 * Replaced canvas-based renderer with a pure HTML/CSS approach.
 * The generated HTML is opened in the user's default browser.
 */
export async function shareCard() {
  const goalId = await storage.get<string>('active_goal_id');
  if (!goalId) {
    console.log(chalk.red('\nNo active goal. Run `opengoat init` first.\n'));
    return;
  }

  const goal = GoalsRepo.getById(goalId);
  const scores = ScoresRepo.getScores(goalId, 1);
  const history = GapsRepo.getSeries(goalId);
  
  const score = scores[0];
  const rank = score?.rank || 'RECRUIT';
  const xp = score?.xp || 0;
  const total = score?.total || 0;
  const closedPct = goal ? Math.round((goal.currentVal / goal.targetVal) * 100) : 0;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>OpenGOAT Scorecard</title>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;900&family=Orbitron:wght@700;900&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #080808;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    font-family: 'JetBrains Mono', monospace;
  }
  .card {
    width: 680px;
    background: #0e0e0e;
    border: 1px solid #252525;
    border-radius: 12px;
    padding: 40px;
    position: relative;
    overflow: hidden;
  }
  .card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, #EF9F27, #1D9E75);
  }
  .goat { font-size: 48px; margin-bottom: 8px; }
  .brand { font-family: 'Orbitron', monospace; color: #EF9F27; font-size: 24px; font-weight: 900; letter-spacing: 4px; }
  .tagline { color: #555550; font-size: 12px; margin-top: 4px; letter-spacing: 2px; }
  .divider { border: none; border-top: 1px solid #1e1e1e; margin: 24px 0; }
  .goal-label { color: #555550; font-size: 11px; letter-spacing: 2px; margin-bottom: 8px; }
  .goal-text { color: #e8e6df; font-size: 16px; font-weight: 700; line-height: 1.4; }
  .metrics { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin: 24px 0; }
  .metric { text-align: center; }
  .metric-value { font-family: 'Orbitron', monospace; font-size: 28px; font-weight: 900; color: #EF9F27; }
  .metric-label { color: #555550; font-size: 10px; letter-spacing: 2px; margin-top: 4px; }
  .progress-bar { background: #141414; border-radius: 4px; height: 8px; overflow: hidden; margin: 16px 0 4px; }
  .progress-fill { height: 100%; background: linear-gradient(90deg, #EF9F27, #1D9E75); border-radius: 4px; transition: width 0.3s; }
  .progress-label { display: flex; justify-content: space-between; color: #555550; font-size: 11px; }
  .rank-badge { display: inline-block; background: #1D9E7522; border: 1px solid #1D9E75; color: #1D9E75; font-family: 'Orbitron', monospace; font-size: 12px; font-weight: 700; padding: 4px 16px; border-radius: 4px; letter-spacing: 3px; margin-top: 16px; }
  .footer { color: #2a2a28; font-size: 10px; text-align: center; margin-top: 24px; letter-spacing: 2px; }
</style>
</head>
<body>
<div class="card">
  <div class="goat">🐐</div>
  <div class="brand">OPENGOAT</div>
  <div class="tagline">GOAL OPERATING SYSTEM · GAP = GOAL − CURRENT</div>
  <hr class="divider">
  <div class="goal-label">ACTIVE MISSION</div>
  <div class="goal-text">${goal?.statement || 'No active goal'}</div>
  <div class="metrics">
    <div class="metric">
      <div class="metric-value">${closedPct}%</div>
      <div class="metric-label">GAP CLOSED</div>
    </div>
    <div class="metric">
      <div class="metric-value">${total}</div>
      <div class="metric-label">OPERATOR SCORE</div>
    </div>
    <div class="metric">
      <div class="metric-value">${history.length}</div>
      <div class="metric-label">DATA POINTS</div>
    </div>
  </div>
  <div class="progress-bar">
    <div class="progress-fill" style="width:${Math.min(100, closedPct)}%"></div>
  </div>
  <div class="progress-label">
    <span>${goal?.currentVal || 0} ${goal?.unit || ''}</span>
    <span>${goal?.targetVal || 0} ${goal?.unit || ''}</span>
  </div>
  <div class="rank-badge">${rank}</div>
  <div class="footer">opengoat.dev · built by a goat, for goats</div>
</div>
</body>
</html>`;

  const outFile = path.join(os.tmpdir(), `opengoat-share-${Date.now()}.html`);
  fs.writeFileSync(outFile, html, 'utf-8');

  console.log(chalk.green(`\n✓ Scorecard generated: ${outFile}`));

  // Auto-open in browser (cross-platform)
  try {
    const { default: open } = await import('open');
    await open(outFile);
    console.log(chalk.dim('  Opened in browser. Screenshot and post to X! 🚀\n'));
  } catch {
    console.log(chalk.dim(`  Open this file in your browser: ${outFile}\n`));
  }
}
