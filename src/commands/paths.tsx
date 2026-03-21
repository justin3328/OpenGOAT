import React from 'react';
import { render, Box, Text } from 'ink';
import { GoalsRepo } from '../data/repos/goals.repo.js';
import { PathsRepo } from '../data/repos/paths.repo.js';
import { storage } from '../lib/storage.js';
import chalk from 'chalk';

export async function showPaths() {
  const goalId = await storage.get<string>('active_goal_id');
  if (!goalId) {
    console.log(chalk.red('No active goal. Run `opengoat init` first.'));
    return;
  }

  const goal = GoalsRepo.getById(goalId);
  const paths = PathsRepo.getForGoal(goalId);

  if (!paths || paths.length === 0) {
    console.log(chalk.yellow('No paths generated yet for this goal. Run `opengoat init`.'));
    return;
  }

  render(<PathsUI paths={paths} goal={goal!} />);
}

const PathsUI = ({ paths, goal }: { paths: any[], goal: any }) => {
  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">GOATBRAIN PATHS FOR: {goal.statement}</Text>
      
      <Box flexDirection="column" marginY={1}>
        {paths.map((p, i) => (
          <Box key={i} flexDirection="column" marginBottom={1} borderStyle="round" borderColor={p.isActive ? 'green' : 'gray'}>
            <Text bold color={p.isActive ? 'green' : 'white'}>
              {p.rank}. {p.name} {p.isActive && <Text color="green">(ACTIVE)</Text>}
            </Text>
            <Text dimColor>{p.tagline}</Text>
            
            <Box flexDirection="column" marginY={1}>
              <Text>Gap Closes: ~{p.weeksToClose} weeks ({p.weeklyHoursRequired} hrs/wk)</Text>
              <Text>Capital Req: ${p.capitalRequired}</Text>
              <Text>Confidence: {Math.round(p.confidenceScore)}%</Text>
            </Box>
            
            {p.isActive && (
              <Box flexDirection="column" marginTop={1}>
                <Text bold color="yellow">First Action:</Text>
                <Text>{p.firstAction.description}</Text>
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};
