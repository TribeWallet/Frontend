import React from 'react';
import { Box, Text } from '../../theme';

export type ScreenHeaderSize = 'standard' | 'compact';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  size?: ScreenHeaderSize;
  children?: React.ReactNode;
}

export function ScreenHeader({
  title,
  subtitle,
  size = 'standard',
  children,
}: ScreenHeaderProps) {
  const compact = size === 'compact';

  return (
    <Box mb="md">
      <Text variant={compact ? 'h2' : 'h1'}>{title}</Text>

      {subtitle && (
        <Text variant="bodySmall" color="textSecondary" mt="xs">
          {subtitle}
        </Text>
      )}

      {children && <Box mt="md">{children}</Box>}
    </Box>
  );
}