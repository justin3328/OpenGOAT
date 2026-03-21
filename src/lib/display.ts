import chalk from 'chalk';
import boxen from 'boxen';
import { Gap, Mission, OperatorScore, Path } from '../types/index.js';

export function banner(): void {
  console.log(chalk.hex('#4ADE80')(`
   ██████╗ ██████╗ ███████╗███╗   ██╗ ██████╗  ██████╗  █████╗ ████████╗
  ██╔═══██╗██╔══██╗██╔════╝████╗  ██║██╔════╝ ██╔═══██╗██╔══██╗╚══██╔══╝
  ██║   ██║██████╔╝█████╗  ██╔██╗ ██║██║  ███╗██║   ██║███████║   ██║
  ██║   ██║██╔═══╝ ██╔══╝  ██║╚██╗██║██║   ██║██║   ██║██╔══██║   ██║
  ╚██████╔╝██║     ███████╗██║ ╚████║╚██████╔╝╚██████╔╝██║  ██║   ██║
   ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═══╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝   ╚═╝
  `));
  console.log(chalk.dim('  🐐  The GOAT path to any goal.\n'));
}

export function gapMeter(gap: Gap): void {
  const percent = Math.min(100, Math.round((gap.current / gap.target) * 100));
  const width = 30;
  const filled = Math.round((percent / 100) * width);
  const meter = chalk.hex('#4ADE80')('█'.repeat(filled)) + chalk.dim('░'.repeat(width - filled));
  console.log(`  ${chalk.dim('PROGRESS')}  [${meter}]  ${chalk.bold(percent + '%')}`);
}

export function missionCard(missions: Mission[]): void {
  const lines = missions.map(m => {
    const status = m.status === 'complete' ? chalk.hex('#4ADE80')('✓') : m.status === 'missed' ? chalk.hex('#F87171')('✗') : chalk.dim('·');
    const title = m.status === 'complete' ? chalk.dim(m.title) : chalk.white(m.title);
    return `  ${status}  ${title.padEnd(50)} ${chalk.dim(m.estimatedHours + 'h')}`;
  });

  console.log(boxen(lines.join('\n'), {
    title: 'WEEKLY MISSIONS',
    padding: 1,
    borderStyle: 'round',
    borderColor: 'dim'
  }));
}

export function scoreCard(score: OperatorScore): void {
  const { total, rank, execution, consistency, capitalVelocity, xp } = score;
  const color = total >= 70 ? '#4ADE80' : total >= 40 ? '#E8A84A' : '#F87171';
  
  const lines = [
    `${chalk.bold('PATHFINDER SCORE')}    ${chalk.hex(color)(total + ' / 100')}`,
    `${chalk.bold('RANK')}                ${chalk.hex(color)(rank.toUpperCase())}`,
    ``,
    `${chalk.dim('EXECUTION')}      ${execution}%`,
    `${chalk.dim('CONSISTENCY')}    ${consistency}%`,
    `${chalk.dim('VELOCITY')}       ${capitalVelocity}%`,
    ``,
    `${chalk.bold('TOTAL XP')}       ${chalk.yellow(xp)}`
  ];

  console.log(boxen(lines.join('\n'), {
    padding: 1,
    borderStyle: 'double',
    borderColor: color
  }));
}

export function pathTable(paths: Path[]): void {
  console.log(`  ${chalk.dim('RANK  PATH NAME'.padEnd(35))} ${chalk.dim('WEEKS  CONFIDENCE')}`);
  paths.forEach((p, i) => {
    const rank = (i + 1).toString().padStart(2, '0');
    console.log(`  ${chalk.hex('#4ADE80')(rank)}    ${p.name.padEnd(30)} ${p.estimatedWeeks.toString().padEnd(6)} ${chalk.bold(p.confidenceScore + '%')}`);
  });
  console.log('');
}

export function successBurst(message: string): void {
  console.log(chalk.hex('#4ADE80').bold(`\n  🐐 GOAL CRUSHED: ${message.toUpperCase()} 🐐\n`));
}
