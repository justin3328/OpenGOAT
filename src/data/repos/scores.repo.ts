import { getDB } from '../db.js';
import { HistoricalScore } from '../../types/score.js';
import { v4 as uuidv4 } from 'uuid';

export class ScoresRepo {
  /**
   * Saves the weekly operator score summary.
   */
  static saveWeekScore(score: Omit<HistoricalScore, 'id' | 'scoredAt'>): string {
    const db = getDB();
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO week_scores (
        id, goal_id, week_number, velocity_score, consistency, 
        momentum, path_fit, total, rank, xp, gap_at_week
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(goal_id, week_number) DO UPDATE SET
        velocity_score=excluded.velocity_score, consistency=excluded.consistency, 
        momentum=excluded.momentum, path_fit=excluded.path_fit, total=excluded.total, 
        rank=excluded.rank, xp=excluded.xp, gap_at_week=excluded.gap_at_week, 
        scored_at=datetime("now")
    `);
    
    stmt.run(
      id, score.goalId, score.weekNumber, score.velocityScore, score.consistency, 
      score.momentum, score.pathFit, score.total, score.rank, score.xp, score.gapAtWeek
    );
    
    return id;
  }

  /**
   * Retrieves historical weekly scores for a goal.
   */
  static getScores(goalId: string, limit: number = 12): HistoricalScore[] {
    const db = getDB();
    const rows = db.prepare('SELECT * FROM week_scores WHERE goal_id = ? ORDER BY week_number DESC LIMIT ?').all(goalId, limit) as any[];
    return rows.map(r => ({
      id: r.id,
      goalId: r.goal_id,
      weekNumber: r.week_number,
      velocityScore: r.velocity_score,
      consistency: r.consistency,
      momentum: r.momentum,
      pathFit: r.path_fit,
      total: r.total,
      rank: r.rank,
      xp: r.xp,
      gapAtWeek: r.gap_at_week,
      scoredAt: new Date(r.scored_at + 'Z')
    }));
  }
}
