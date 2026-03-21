import fs from 'fs';
import { storage } from '../lib/storage.js';
import { calculateScore } from '../lib/score.js';
import { C } from '../lib/display.js';
import chalk from 'chalk';

export async function exportData() {
  const config = storage.getConfig();
  if (!config) {
    console.log(C.negative('✗ Not initialised. Run: income-agent init "your goal"'));
    return;
  }

  const allMissions = storage.getMissions();
  const allEarnings = storage.getEarnings();
  const stats = calculateScore(config, allMissions, allEarnings);

  const date = new Date().toISOString().split('T')[0];
  const filename = `income-agent-export-${date}.md`;
  const fullDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  let content = `# income-agent export — ${fullDate}\n\n`;
  content += `## Goal\n${config.goal}\n\n`;
  content += `## Operator Score: ${stats.score}/100\n\n`;
  
  content += `### Performance Metrics\n`;
  content += `- Execution: ${stats.execution}%\n`;
  content += `- Consistency: ${stats.consistency}%\n`;
  content += `- Capital Velocity: ${stats.capitalVelocity}%\n`;
  content += `- Reflection: ${stats.reflection}%\n\n`;

  content += `## Earnings ($${stats.allTimeEarnings.toFixed(2)} total)\n`;
  content += `| Date | Amount | Description | Week |\n`;
  content += `| :--- | :--- | :--- | :--- |\n`;
  
  allEarnings.sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(e => {
    const d = new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    content += `| ${d} | $${e.amount.toFixed(2)} | ${e.description} | Week ${e.week} |\n`;
  });
  content += `\n`;

  content += `## Missions\n`;
  content += `| Week | ID | Mission | Status | Completed At |\n`;
  content += `| :--- | :--- | :--- | :--- | :--- |\n`;
  
  allMissions.sort((a,b) => b.week - a.week || a.id - b.id).forEach(m => {
    const completedAt = m.completedAt ? new Date(m.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-';
    content += `| Week ${m.week} | ${m.id} | ${m.title} | ${m.status} | ${completedAt} |\n`;
  });

  try {
    fs.writeFileSync(filename, content);
    console.log(C.positive(`✓ Data exported to ${filename}`));
  } catch (error) {
    console.log(C.negative(`✗ Export failed: ${error.message}`));
  }
}
