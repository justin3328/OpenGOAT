import { getDB } from '../db.js';
import { GapEntry } from '../../types/gap.js';
import { v4 as uuidv4 } from 'uuid';

export class GapsRepo {
  /**
   * Logs a new gap entry reading.
   */
  static log(goalId: string, value: number, note?: string): GapEntry {
    const db = getDB();
    const id = uuidv4();
    
    db.prepare(`
      INSERT INTO gap_log (id, goal_id, value, note)
      VALUES (?, ?, ?, ?)
    `).run(id, goalId, value, note || null);

    return {
      id,
      goalId,
      value,
      loggedAt: new Date(),
      note
    };
  }

  /**
   * Gets the complete time-series of gap movement for a goal.
   * Sorted oldest to newest.
   */
  static getSeries(goalId: string): GapEntry[] {
    const db = getDB();
    const rows = db.prepare('SELECT * FROM gap_log WHERE goal_id = ? ORDER BY logged_at ASC').all(goalId) as any[];
    return rows.map(r => ({
      id: r.id,
      goalId: r.goal_id,
      value: r.value,
      note: r.note,
      loggedAt: new Date(r.logged_at + 'Z')
    }));
  }

  /**
   * Gets the most recent recorded gap value for a goal.
   */
  static getLatest(goalId: string): GapEntry | null {
    const db = getDB();
    const row = db.prepare('SELECT * FROM gap_log WHERE goal_id = ? ORDER BY logged_at DESC LIMIT 1').get(goalId) as any | undefined;
    if (!row) return null;
    return {
      id: row.id,
      goalId: row.goal_id,
      value: row.value,
      note: row.note,
      loggedAt: new Date(row.logged_at + 'Z')
    };
  }
}
