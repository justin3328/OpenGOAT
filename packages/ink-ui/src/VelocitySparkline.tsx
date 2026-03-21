import React from 'react';
import { Box, Text } from 'ink';

export interface VelocitySparklineProps {
  data: number[];
  color?: string;
}

export function VelocitySparkline({ data, color = 'green' }: VelocitySparklineProps) {
  if (!data || data.length === 0) return <Text color="gray">No history</Text>;
  const chars = [' ', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
  const max = Math.max(...data, 1);
  const sparkline = data.map(v => chars[Math.floor((Math.max(0, v) / max) * 7)]).join('');

  return (
    <Box>
      <Text color={color}>{sparkline}</Text>
    </Box>
  );
}
