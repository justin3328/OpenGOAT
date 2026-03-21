import React from 'react';
import { Box, Text } from 'ink';
import { Theme, goatTheme } from './themes/index.js';

interface GapMeterProps {
  current: number;
  target: number;
  unit: string;
  theme?: Theme;
}

export const GapMeter: React.FC<GapMeterProps> = ({ current, target, unit, theme = goatTheme }) => {
  const percent = Math.min(100, Math.round((current / target) * 100));
  const width = 15;
  const filledCount = Math.round((percent / 100) * width);
  
  return (
    <Box flexDirection="column">
      <Box justifyContent="space-between" marginBottom={0}>
        <Text color={theme.colors.muted}>{unit.toUpperCase()}</Text>
        <Text bold color={theme.colors.primary}>{percent}%</Text>
      </Box>
      <Box>
        <Text color={theme.colors.primary}>{'█'.repeat(filledCount)}</Text>
        <Text color="#252525">{'▒'.repeat(width - filledCount)}</Text>
        <Box marginLeft={1}>
          <Text color={theme.colors.muted}>{current}/{target}</Text>
        </Box>
      </Box>
    </Box>
  );
};


export * from './themes/index.js';
