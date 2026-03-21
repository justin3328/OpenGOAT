import inquirer from 'inquirer';
import { storage } from '../lib/storage.js';
import { missionCard } from '../lib/display.js';
import { eventBus } from '../lib/event-bus.js';

export async function trackMissions() {
  const missions = storage.get<any[]>('missions') || [];
  
  if (missions.length === 0) {
    console.log('  No missions found. Run opengoat plan to generate some.');
    return;
  }

  console.clear();
  missionCard(missions);

  const { action } = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    message: 'What do you want to do?',
    choices: [
      { name: '✅  Mark a mission complete', value: 'complete' },
      { name: '❌  Mark a mission missed', value: 'missed' },
      { name: '🔙  Exit', value: 'exit' }
    ]
  }]);

  if (action === 'exit') return;

  const pending = missions.filter(m => m.status === 'pending');
  if (pending.length === 0) {
    console.log('  All missions for this week are accounted for.');
    return;
  }

  const { missionId } = await inquirer.prompt([{
    type: 'list',
    name: 'missionId',
    message: `Select mission to mark as ${action}:`,
    choices: pending.map(m => ({
      name: m.title,
      value: m.id
    }))
  }]);

  const updatedMissions = missions.map(m => {
    if (m.id === missionId) {
      m.status = action;
      m.completedAt = action === 'complete' ? new Date() : undefined;
      
      if (action === 'complete') {
        eventBus.emit('on:mission-complete', m);
      } else {
        eventBus.emit('on:mission-missed', m);
      }
    }
    return m;
  });

  storage.set('missions', updatedMissions);
  console.log(`\n  Mission marked as ${action}. Record updated.`);
  missionCard(updatedMissions);
}
