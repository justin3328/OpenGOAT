import React, { useEffect, useState } from 'react';
import { render, Box, Text } from 'ink';
import { GoalsRepo } from '../data/repos/goals.repo.js';
import { GapsRepo } from '../data/repos/gaps.repo.js';
import { PathsRepo } from '../data/repos/paths.repo.js';
import { InterventionsRepo } from '../data/repos/interventions.repo.js';
import { storage } from '../lib/storage.js';
import { GapMeter } from '../../packages/ink-ui/src/index.js';
import chalk from 'chalk';

export async function showGap() {
  const goalId = await storage.get<string>('active_goal_id');
  if (!goalId) {
    console.log(chalk.red('No active goal. Run `opengoat init` first.'));
    return;
  }

  const goal = GoalsRepo.getById(goalId);
  const activePath = PathsRepo.getActivePath(goalId);
  const history = GapsRepo.getSeries(goalId);
  const interventions = InterventionsRepo.getUnresolved(goalId);

  render(<GapUI goal={goal!} activePath={activePath} history={history} interventions={interventions} />);
}

const GapUI = ({ goal, activePath, history, interventions }: { goal: any, activePath: any, history: any[], interventions: any[] }) => {
  const gapRemaining = goal.targetVal - goal.currentVal;
  const closedPercent = goal.currentVal > 0 ? Math.round((goal.currentVal / goal.targetVal) * 100) : 0;
  
  // Velocity calc
  let velocity7d = 0;
  if (history.length >= 2) {
    const oldestIn7 = history[Math.max(0, history.length - 7)];
    velocity7d = goal.currentVal - oldestIn7.value;
  }
  
  const msRemaining = new Date(goal.deadline).getTime() - Date.now();
  const weeksRemaining = Math.max(1, msRemaining / (1000 * 60 * 60 * 24 * 7));
  const targetVelocity = gapRemaining / weeksRemaining;

  return (
    <Box flexDirection="column" padding={1} borderStyle="round" borderColor="#EF9F27">
      <Text bold color="#EF9F27">GAP STATUS</Text>
      
      <Box marginY={1}>
        <GapMeter current={goal.currentVal} target={goal.targetVal} unit={goal.unit} />
      </Box>
      
      <Text dimColor>Goal: {goal.statement}</Text>
      {activePath && <Text dimColor>Path: {activePath.name}</Text>}
      
      <Box flexDirection="column" marginTop={1}>
        <Text>Velocity: <Text color={velocity7d >= targetVelocity ? 'green' : 'yellow'}>+{velocity7d.toFixed(1)}/wk</Text> (Target: {Math.round(targetVelocity)}/wk)</Text>
        <Text>Pace: {velocity7d >= targetVelocity ? 'On Track' : 'Behind Pace'}</Text>
        <Text>Remaining: {gapRemaining.toFixed(1)} {goal.unit}</Text>
      </Box>

      {interventions.length > 0 && (
        <Box flexDirection="column" marginTop={1} padding={1} borderStyle="round" borderColor="red">
          <Text bold color="red">🚨 ACTIVE INTERVENTION</Text>
          <Text>{interventions[0].question}</Text>
          <Text dimColor>Run `opengoat why` to resolve this block.</Text>
        </Box>
      )}
    </Box>
  );
};
