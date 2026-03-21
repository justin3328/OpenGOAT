import { Mission } from '../types/index.js';

export function parseMissions(json: string, goalId: string, pathId: string, week: number): Mission[] {
  try {
    const data = JSON.parse(json);
    const missions = Array.isArray(data) ? data : data.missions || [];
    
    return missions.map((m: any) => ({
      id: m.id || Math.random().toString(36).substr(2, 9),
      title: m.title || 'Untitled Mission',
      description: m.description || '',
      estimatedHours: m.estimatedHours || 1,
      status: 'pending',
      week,
      pathId,
      goalId,
      xp: m.xp || 100,
      difficulty: m.difficulty || 2,
      createdAt: new Date()
    }));
  } catch (e) {
    console.error('Failed to parse missions JSON', e);
    return [];
  }
}
