import { getDB } from '../db.js';
import { GoalPath } from '../../types/path.js';

export class PathsRepo {
  /**
   * Saves the generated top 5 paths for a goal to the database.
   * Assumes the array is pre-ranked 1-5.
   */
  static savePaths(goalId: string, paths: GoalPath[]): void {
    const db = getDB();
    const insert = db.prepare(`
      INSERT OR REPLACE INTO paths (id, goal_id, data, rank, is_active)
      VALUES (?, ?, ?, ?, ?)
    `);

    db.transaction(() => {
      // First, clear existing paths for this goal to ensure strict 5
      db.prepare('DELETE FROM paths WHERE goal_id = ?').run(goalId);
      
      paths.forEach(p => {
        insert.run(p.id, goalId, JSON.stringify(p), p.rank, 0);
      });
    })();
  }

  /**
   * Activates a specific path, deactivating all others.
   */
  static activatePath(goalId: string, pathId: string): void {
    const db = getDB();
    db.transaction(() => {
      db.prepare('UPDATE paths SET is_active = 0 WHERE goal_id = ?').run(goalId);
      db.prepare('UPDATE paths SET is_active = 1 WHERE id = ?').run(pathId);
      db.prepare('UPDATE goals SET active_path = ? WHERE id = ?').run(pathId, goalId);
    })();
  }

  /**
   * Retrieves all paths for a goal, sorted by rank (speed to close gap).
   */
  static getForGoal(goalId: string): (GoalPath & { isActive: boolean })[] {
    const db = getDB();
    const rows = db.prepare('SELECT * FROM paths WHERE goal_id = ? ORDER BY rank ASC').all(goalId) as any[];
    return rows.map(r => ({
      ...JSON.parse(r.data),
      id: r.id, // Ensure ID matches DB row natively
      rank: r.rank,
      isActive: r.is_active === 1
    }));
  }

  /**
   * Retrieves the currently active path for a goal.
   */
  static getActivePath(goalId: string): GoalPath | null {
    const db = getDB();
    const row = db.prepare('SELECT * FROM paths WHERE goal_id = ? AND is_active = 1 LIMIT 1').get(goalId) as any | undefined;
    if (!row) return null;
    return {
      ...JSON.parse(row.data),
      id: row.id,
      rank: row.rank
    };
  }
}
