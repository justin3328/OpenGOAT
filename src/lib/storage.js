import Conf from 'conf';

const store = new Conf({ projectName: 'income-agent' });

export const storage = {
  getConfig: () => store.get('config') || null,
  setConfig: (data) => store.set('config', data),

  getMissions: () => store.get('missions') || [],
  setMissions: (data) => store.set('missions', data),
  addMission: (mission) => {
    const missions = storage.getMissions();
    missions.push(mission);
    store.set('missions', missions);
  },

  getEarnings: () => store.get('earnings') || [],
  addEarning: (earning) => {
    const earnings = storage.getEarnings();
    earnings.push(earning);
    store.set('earnings', earnings);
  },

  reset: () => store.clear()
};
