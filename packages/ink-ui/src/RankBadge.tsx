import React from 'react';
import { Box, Text } from 'ink';

export function RankBadge({ rank }: { rank: 'Recruit' | 'Operator' | 'Ghost' | 'Apex' }) {
  const colors: Record<string, string> = {
    'Recruit': 'gray',
    'Operator': 'blue',
    'Ghost': 'magenta',
    'Apex': 'yellow'
  };
  
  return (
    <Box paddingX={1} borderStyle="round" borderColor={colors[rank] || 'white'}>
      <Text bold color={colors[rank] || 'white'}>{rank.toUpperCase()}</Text>
    </Box>
  );
}
