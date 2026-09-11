import React from 'react';
import { Box, Text } from '../../theme';

export type PillTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'blue' | 'green';

export interface PillProps {
  label: string;
  tone?: PillTone;
  size?: 'sm' | 'md';
}

const toneColorMap = {
  neutral: { bg: 'border' as const, text: 'textSecondary' as const },
  primary: { bg: 'primaryLight' as const, text: 'primary' as const },
  success: { bg: 'successLight' as const, text: 'success' as const },
  warning: { bg: 'warningLight' as const, text: 'warning' as const },
  danger: { bg: 'dangerLight' as const, text: 'danger' as const },
  blue: { bg: 'primaryLight' as const, text: 'primary' as const },
  green: { bg: 'successLight' as const, text: 'success' as const },
} as const;

export function Pill({ label, tone = 'neutral', size = 'md' }: PillProps) {
  const { bg, text } = toneColorMap[tone];

  return (
    <Box
      bg={bg}
      px={size === 'sm' ? 'xs' : 'sm'}
      py={size === 'sm' ? 'xxs' : 'xs'}
      borderRadius="full"
      alignSelf="flex-start"
    >
      <Text
        variant={size === 'sm' ? 'captionStrong' : 'label'}
        color={text}
      >
        {label}
      </Text>
    </Box>
  );
}