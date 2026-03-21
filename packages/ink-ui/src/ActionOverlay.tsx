import React from 'react';
import { Box, Text } from 'ink';

export const ActionOverlay = ({ action, estMinutes }: { action: string, estMinutes: number }) => {
  return (
    <Box flexDirection="column" padding={1} borderStyle="round" borderColor="yellow">
      <Text bold color="yellow">🔥 THE NEXT LEVER</Text>
      <Box marginY={1}>
        <Text>{action}</Text>
      </Box>
      <Text dimColor>Takes ~{estMinutes} minutes. Run `opengoat log` after completion to close the gap.</Text>
    </Box>
  );
};
