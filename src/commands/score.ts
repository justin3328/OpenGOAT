import { storage } from '../lib/storage.js';
import { calculateScore } from '../lib/score-engine.js';
import { scoreCard, banner } from '../lib/display.js';
import { eventBus } from '../lib/event-bus.js';

export async function showScore() {
  const missions = storage.get<any[]>('missions') || [];
  const weekNumber = storage.get<number>('weekNumber') || 1;

  eventBus.emit('before:score');
  
  const score = calculateScore(missions, weekNumber);
  
  console.clear();
  banner();
  scoreCard(score);
  
  eventBus.emit('after:score', score);
}
