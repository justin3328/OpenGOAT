import { getDB } from '../db.js';
import { ResourceProfile } from '../../types/resource.js';
import { v4 as uuidv4 } from 'uuid';

export class ResourcesRepo {
  /**
   * Upserts the resource profile for a goal.
   */
  static save(goalId: string, profile: ResourceProfile): void {
    const db = getDB();
    const existing = this.getByGoalId(goalId);
    
    if (existing) {
      db.prepare(`
        UPDATE resource_profiles 
        SET profile = ?, updated_at = datetime('now')
        WHERE goal_id = ?
      `).run(JSON.stringify(profile), goalId);
    } else {
      db.prepare(`
        INSERT INTO resource_profiles (id, goal_id, profile)
        VALUES (?, ?, ?)
      `).run(uuidv4(), goalId, JSON.stringify(profile));
    }
  }

  /**
   * Gets the resource profile for a given goal.
   */
  static getByGoalId(goalId: string): ResourceProfile | null {
    const db = getDB();
    const row = db.prepare('SELECT profile FROM resource_profiles WHERE goal_id = ?').get(goalId) as { profile: string } | undefined;
    if (!row) return null;
    return JSON.parse(row.profile) as ResourceProfile;
  }
}
