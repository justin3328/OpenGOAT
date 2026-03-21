import { getDB } from '../db.js';
import { Goal } from '../../types/goal.js';
import { v4 as uuidv4 } from 'uuid';

export class GoalsRepo {
  /**
   * Creates a new goal and returns its ID.
   */
  static create(goal: Omit<Goal, 'id' | 'createdAt' | 'status'>): string {
    const db = getDB();
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO goals (id, statement, category, current_val, target_val, unit, deadline, active_path)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id, goal.statement, goal.category, goal.currentVal, goal.targetVal, 
      goal.unit, goal.deadline, goal.activePath || null
    );
    return id;
  }

  /**
   * Returns all active goals.
   */
  static getAllActive(): Goal[] {
    const db = getDB();
    const rows = db.prepare('SELECT * FROM goals WHERE status = "active"').all() as any[];
    return rows.map(r => ({
      id: r.id,
      statement: r.statement,
      category: r.category,
      currentVal: r.current_val,
      targetVal: r.target_val,
      unit: r.unit,
      deadline: r.deadline,
      activePath: r.active_path,
      status: r.status,
      createdAt: new Date(r.created_at + 'Z')
    }));
  }

  /**
   * Gets a specific goal.
   */
  static getById(id: string): Goal | null {
    const db = getDB();
    const row = db.prepare('SELECT * FROM goals WHERE id = ?').get(id) as any | undefined;
    if (!row) return null;
    return {
      id: row.id,
      statement: row.statement,
      category: row.category,
      currentVal: row.current_val,
      targetVal: row.target_val,
      unit: row.unit,
      deadline: row.deadline,
      activePath: row.active_path,
      status: row.status,
      createdAt: new Date(row.created_at + 'Z')
    };
  }

  /**
   * Modifies only the primary tracking number.
   */
  static updateCurrentValue(id: string, value: number): void {
    const db = getDB();
    db.prepare('UPDATE goals SET current_val = ?, updated_at = datetime("now") WHERE id = ?').run(value, id);
  }

  /**
   * Sets the path that the gap tracker uses for intervention contexts.
   */
  static updatePath(id: string, pathId: string): void {
    const db = getDB();
    db.prepare('UPDATE goals SET active_path = ?, updated_at = datetime("now") WHERE id = ?').run(pathId, id);
  }
}
