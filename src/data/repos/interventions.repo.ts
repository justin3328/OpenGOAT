import { getDB } from '../db.js';
import { Intervention } from '../../types/intervention.js';
import { v4 as uuidv4 } from 'uuid';

export class InterventionsRepo {
  /**
   * Creates a new intervention when GoatBrain detects stagnation.
   */
  static create(intervention: Omit<Intervention, 'id' | 'createdAt' | 'resolved'>): Intervention {
    const db = getDB();
    const id = uuidv4();
    
    db.prepare(`
      INSERT INTO interventions (id, goal_id, trigger_type, question, user_response, constraint_type, unlock_action)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, 
      intervention.goalId, 
      intervention.triggeredBy, 
      intervention.question, 
      intervention.userResponse || null, 
      intervention.constraintType || null, 
      intervention.unlockAction || null
    );

    return {
      ...intervention,
      id,
      createdAt: new Date(),
      resolved: false
    };
  }

  /**
   * Updates an intervention (e.g. after the user answers the question and GoatBrain identifies the block).
   */
  static update(id: string, updates: Partial<Intervention>): void {
    const db = getDB();
    const setStrings: string[] = [];
    const params: any[] = [];
    
    if (updates.userResponse !== undefined) {
      setStrings.push('user_response = ?');
      params.push(updates.userResponse);
    }
    if (updates.constraintType !== undefined) {
      setStrings.push('constraint_type = ?');
      params.push(updates.constraintType);
    }
    if (updates.unlockAction !== undefined) {
      setStrings.push('unlock_action = ?');
      params.push(updates.unlockAction);
    }
    if (updates.resolved !== undefined) {
      setStrings.push('resolved = ?');
      params.push(updates.resolved ? 1 : 0);
    }
    
    if (setStrings.length === 0) return;
    
    params.push(id);
    db.prepare(`
      UPDATE interventions SET ${setStrings.join(', ')} WHERE id = ?
    `).run(...params);
  }

  /**
   * Retrieves all unresolved interventions.
   */
  static getUnresolved(goalId: string): Intervention[] {
    const db = getDB();
    const rows = db.prepare('SELECT * FROM interventions WHERE goal_id = ? AND resolved = 0').all(goalId) as any[];
    return rows.map(r => ({
      id: r.id,
      goalId: r.goal_id,
      triggeredBy: r.trigger_type,
      question: r.question,
      userResponse: r.user_response,
      constraintType: r.constraint_type,
      unlockAction: r.unlock_action,
      createdAt: new Date(r.created_at + 'Z'),
      resolved: r.resolved === 1
    }));
  }
}
