import React from 'react';
import { render, Box, Text } from 'ink';
import { GapMeter } from '../../packages/ink-ui/src/index.js';
import { GoalsRepo } from '../data/repos/goals.repo.js';
import { calculateGap } from '../lib/path-engine.js';

export async function showPath() {
  const goals = GoalsRepo.getAllActive();
  if (goals.length === 0) {
    console.log('No active goals. Run opengoat init first.');
    return;
  }

  for (const goal of goals) {
    const gap = calculateGap(goal.currentVal, goal.targetVal, new Date(goal.deadline));
    render(
      <Box flexDirection="column" paddingX={1}>
        <Text bold underline>{goal.statement.toUpperCase()}</Text>
        <GapMeter current={gap.current} target={gap.target} unit={goal.unit} />
        <Text italic dimColor>Velocity needed: {Math.round(gap.weeklyVelocityNeeded)} {goal.unit}/week</Text>
        <Box marginY={1} />
      </Box>
    );
  }
}
