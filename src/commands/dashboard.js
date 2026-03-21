import { storage } from '../lib/storage.js';
import { calculateScore } from '../lib/score.js';
import { C, bar, currency, anchor } from '../lib/display.js';
import terminalSize from 'terminal-size';
import cliCursor from 'cli-cursor';
import { clearScreenDown, moveCursor, emitKeypressEvents } from 'node:readline';

export async function dashboard() {
  const config = storage.getConfig();
  if (!config) {
    console.log(C.negative('✗ Not initialised. Run: income-agent init "your goal"'));
    return;
  }

  cliCursor.hide();
  emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) process.stdin.setRawMode(true);

  let refreshTimer;
  let secondsToRefresh = 30;

  const render = () => {
    const { columns, rows } = terminalSize();
    const allMissions = storage.getMissions();
    const allEarnings = storage.getEarnings();
    const stats = calculateScore(config, allMissions, allEarnings);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayEarnings = allEarnings
      .filter(e => e.date.startsWith(todayStr))
      .reduce((sum, e) => sum + e.amount, 0);
    
    const todayMissions = allMissions.filter(m => m.week === config.week && m.status === 'complete' && m.completedAt?.startsWith(todayStr)).length;

    const lastWeekEarnings = allEarnings
      .filter(e => e.week === config.week - 1)
      .reduce((sum, e) => sum + e.amount, 0);
    const earningsDelta = lastWeekEarnings > 0 
      ? ((stats.thisWeekEarnings - lastWeekEarnings) / lastWeekEarnings) * 100 
      : 0;

    const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    process.stdout.write('\x1B[2J\x1B[3J\x1B[H'); // Clear and home

    const width = 64;
    const hr = C.ghost('─'.repeat(width - 4));
    const doubleHr = C.ghost('═'.repeat(width - 4));

    console.log(C.ghost(`╔${'═'.repeat(width - 2)}╗`));
    console.log(C.ghost('║') + `  ${C.primary('INCOME-AGENT')}  ${C.ghost('·')}  ${C.primary('MISSION CONTROL')}  ${C.ghost('·')}  ${C.dim(`${dateStr}  ${timeStr}`)}`.padEnd(width + 8) + C.ghost('║'));
    console.log(C.ghost(`╠${'═'.repeat(width - 2)}╣`));
    console.log(C.ghost('║') + ' '.repeat(width - 2) + C.ghost('║'));
    console.log(C.ghost('║') + `  ${C.label('OPERATOR SCORE'.padEnd(16))} ${stats.score}/100  ${bar(stats.score, 20)}`.padEnd(width + 8) + C.ghost('║'));
    console.log(C.ghost('║') + `  ${C.label('STREAK'.padEnd(16))} ${stats.streak}d`.padEnd(width + 17) + C.ghost('║'));
    console.log(C.ghost('║') + ' '.repeat(width - 2) + C.ghost('║'));
    console.log(C.ghost(`╠${'═'.repeat(28)}╦${'═'.repeat(33)}╣`));
    console.log(C.ghost('║') + `  ${anchor('TODAY'.padEnd(10))}            ${C.ghost('║')}  ${anchor('THIS WEEK'.padEnd(10))}              ${C.ghost('║')}`);
    console.log(C.ghost('║') + `  ${C.label('CAPITAL')}    ${currency(todayEarnings).padEnd(10)} ${C.ghost('║')}  ${C.label('CAPITAL')}    ${currency(stats.thisWeekEarnings).padEnd(10)} ${earningsDelta > 0 ? C.positive('↑') : ''}  ${C.ghost('║')}`);
    console.log(C.ghost('║') + `  ${C.label('PROTOCOL')}   ${todayMissions}/5 done    ${C.ghost('║')}  ${C.label('MISSIONS')}   ${stats.completedMissions}/${stats.totalMissions} done      ${C.ghost('║')}`);
    console.log(C.ghost(`╠${'═'.repeat(28)}╩${'═'.repeat(33)}╣`));
    console.log(C.ghost('║') + ' '.repeat(width - 2) + C.ghost('║'));
    console.log(C.ghost('║') + `  ${anchor('ACTIVE PROTOCOL')}`.padEnd(width + 17) + C.ghost('║'));
    
    const currentMissions = allMissions.filter(m => m.week === config.week).slice(0, 5);
    currentMissions.forEach((m, idx) => {
      const statusIcon = m.status === 'complete' ? C.positive('[✓]') : m.status === 'missed' ? C.negative('[✗]') : C.ghost('[ ]');
      console.log(C.ghost('║') + `  ${C.ghost(String(idx + 1).padStart(2, '0'))}  ${statusIcon}  ${(m.status === 'complete' ? C.dim(m.title) : C.primary(m.title)).padEnd(48).slice(0, 48)}`.padEnd(width + 25) + C.ghost('║'));
    });

    console.log(C.ghost('║') + ' '.repeat(width - 2) + C.ghost('║'));
    const goalProgress = Math.min(Math.round((stats.allTimeEarnings / (parseInt(config.goal.match(/\d+/)?.[0] || 1000))) * 100), 100);
    console.log(C.ghost('║') + `  ${C.label('GOAL')}  ${C.dim(config.goal.slice(0, 25))}  ${C.ghost('·')}  ${currency(stats.allTimeEarnings)}/${currency(parseInt(config.goal.match(/\d+/)?.[0] || 1000))}  ${bar(goalProgress, 12)}`.padEnd(width + 50) + C.ghost('║'));
    console.log(C.ghost('║') + ' '.repeat(width - 2) + C.ghost('║'));
    console.log(C.ghost(`╠${'═'.repeat(width - 2)}╣`));
    console.log(C.ghost('║') + `  ${C.ghost('[r]')} refresh  ${C.ghost('[q]')} quit  ${C.ghost('·')}  auto-refresh in ${secondsToRefresh}s`.padEnd(width + 34) + C.ghost('║'));
    console.log(C.ghost(`╚${'═'.repeat(width - 2)}╝`));
  };

  const startTimer = () => {
    refreshTimer = setInterval(() => {
      secondsToRefresh--;
      if (secondsToRefresh <= 0) {
        secondsToRefresh = 30;
        render();
      } else {
        // Just update the last line to avoid flicker
        moveCursor(process.stdout, 0, -2);
        const width = 64;
        process.stdout.write(C.ghost('║') + `  ${C.ghost('[r]')} refresh  ${C.ghost('[q]')} quit  ${C.ghost('·')}  auto-refresh in ${secondsToRefresh}s `.padEnd(width + 34) + C.ghost('║') + '\n');
        moveCursor(process.stdout, 0, 1);
      }
    }, 1000);
  };

  render();
  startTimer();

  process.stdin.on('keypress', (str, key) => {
    if (key.name === 'q' || (key.ctrl && key.name === 'c')) {
      clearInterval(refreshTimer);
      cliCursor.show();
      process.stdin.setRawMode(false);
      process.exit();
    } else if (key.name === 'r') {
      secondsToRefresh = 30;
      render();
    }
  });
}
