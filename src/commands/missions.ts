import chalk from 'chalk';
import { GoalsRepo } from '../data/repos/goals.repo.js';
import { MissionsRepo } from '../data/repos/missions.repo.js';
import { storage } from '../lib/storage.js';

function statusIcon(status: 'pending' | 'complete' | 'missed'): string {
  if (status === 'complete') return chalk.green('[✓]');
  if (status === 'pending') return chalk.yellow('[→]');
  return chalk.dim('[ ]');
}

export async function showMissions(action?: string, missionId?: string) {
  const goalId = await storage.get<string>('active_goal_id');
  if (!goalId) {
    console.log(chalk.red('\n No active goal. Run `opengoat init` first.\n'));
    return;
  }

  const goal = GoalsRepo.getById(goalId);

  // If completing a mission natively
  if (action === 'complete' && missionId) {
    MissionsRepo.markComplete(missionId);
    console.log(chalk.green(`\n✓ Mission ${missionId} complete!`));
    // XP is implicitly handled natively by SQL evaluation in the score engine
    return;
  }

  const missions = MissionsRepo.getAllByGoal(goalId);
  
  if (missions.length === 0) {
    console.log(chalk.dim('\n No generated missions found for this goal. Select a generated Path first!\n'));
    return;
  }

  const completeCount = missions.filter(m => m.status === 'complete').length;
  const totalXPEarned = missions.filter(m => m.status === 'complete').reduce((sum, m) => sum + m.xp, 0);
  const totalXPAvail = missions.reduce((sum, m) => sum + m.xp, 0);

  console.log('\n' + chalk.hex('#EF9F27').bold(`  ◢ MISSION BOARD — ${goal?.statement || 'Your Goal'}`));
  console.log(chalk.dim(`  Progress: ${completeCount}/${missions.length} missions · ${totalXPEarned} XP earned\n`));

  for (const mission of missions) {
    const icon = statusIcon(mission.status);
    const titleColor = mission.status === 'complete' ? chalk.dim : chalk.white.bold;
    const xpColor = mission.status === 'complete' ? chalk.green : chalk.dim;
    
    console.log(`  ${icon} ${titleColor(mission.title.padEnd(30))} ${xpColor(`+${mission.xp} XP`)}  ${chalk.dim(`(ID: ${mission.id.slice(0, 8)})`)}`);
    if (mission.status !== 'complete') {
      console.log(chalk.dim(`      ${mission.description}`));
    }
  }

  const pct = Math.round((completeCount / Math.max(1, missions.length)) * 100);
  const bar = '█'.repeat(Math.round(pct / 5)) + '░'.repeat(20 - Math.round(pct / 5));
  console.log('\n' + chalk.dim(`  [${bar}] ${pct}% Mission Complete`));
  console.log(chalk.hex('#1D9E75')(`  Total XP Pool: ${totalXPAvail} XP available\n`));
  
  if (completeCount < missions.length) {
    console.log(chalk.dim(`  To complete a mission: opengoat missions complete <ID>`));
  }
}
