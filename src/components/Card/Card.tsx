import React from 'react';
import { ViewStyle } from 'react-native';
import { Box, useTheme } from '../../theme';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'flat' | 'elevated' | 'outlined';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  style?: ViewStyle;
}

export function Card({
  children,
  variant = 'flat',
  padding = 'md',
  borderRadius = 'md',
  style,
}: CardProps) {
  const theme = useTheme();

  const shadowKey = variant === 'elevated' ? 'sm' : 'none';

  return (
    <Box
      bg="surface"
      borderRadius={borderRadius}
      p={padding}
      style={[
        theme.shadows[shadowKey],
        variant === 'outlined' && { borderWidth: 1, borderColor: theme.colors.cardBorder },
        style,
      ]}
    >
      {children}
    </Box>
  );
}