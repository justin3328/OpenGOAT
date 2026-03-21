import React from 'react';
import { Box, Text } from 'ink';
import { Theme, goatTheme } from './themes/index.js';

interface Score {
  execution: number;
  consistency: number;
  capitalVelocity: number;
  xp: number;
  rank: string;
  weekNumber: number;
}

interface ScoreCardProps {
  score: Score;
  theme?: Theme;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ score, theme = goatTheme }) => {
  return (
    <Box flexDirection="column" borderStyle="round" borderColor={theme.colors.primary} paddingX={1}>
      <Box justifyContent="space-between" marginBottom={1}>
        <Text bold color={theme.colors.primary}>OPERATOR SCORE</Text>
        <Text color={theme.colors.muted}>WEEK {score.weekNumber}</Text>
        <Text bold inverse color={theme.colors.primary}> {score.rank.toUpperCase()} </Text>
      </Box>
      <Box justifyContent="space-between">
        <Box flexDirection="column" alignItems="center">
          <Text color={theme.colors.muted}>Execution</Text>
          <Text bold color={theme.colors.secondary}>{score.execution}%</Text>
        </Box>
        <Box flexDirection="column" alignItems="center">
          <Text color={theme.colors.muted}>Velocity</Text>
          <Text bold color={theme.colors.primary}>{score.capitalVelocity}%</Text>
        </Box>
        <Box flexDirection="column" alignItems="center">
          <Text color={theme.colors.muted}>Consistency</Text>
          <Text bold color={theme.colors.warning}>{score.consistency}%</Text>
        </Box>
        <Box flexDirection="column" alignItems="center">
          <Text color={theme.colors.muted}>XP</Text>
          <Text bold color={theme.colors.secondary}>{score.xp}</Text>
        </Box>
      </Box>
    </Box>
  );
};
