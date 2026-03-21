import { getDB } from '../data/db.js';
import { GoalsRepo } from '../data/repos/goals.repo.js';

export async function showHistory() {
  const goals = GoalsRepo.getAllActive();
  if (goals.length === 0) return;

  const db = getDB();
  for (const goal of goals) {
    const history = db.prepare('SELECT * FROM week_scores WHERE goal_id = ? ORDER BY week_number DESC').all(goal.id) as any[];
    
    console.log(`\nHISTORY: ${goal.statement}`);
    if (history.length === 0) {
      console.log('No historical protocols recorded yet.');
      continue;
    }

    history.forEach(h => {
      console.log(`Week ${h.week_number}: Score ${h.total} | Rank ${h.rank} | XP ${h.xp}`);
    });
  }
}
