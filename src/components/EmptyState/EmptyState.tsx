import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { Box, Text } from '../../theme';
import { Button } from '../Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

function DefaultIcon() {
  return (
    <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 8v4M12 16h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        stroke="#8C949B"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Box alignItems="center" justifyContent="center" py="xl" px="lg">
      <Box mb="md">{icon || <DefaultIcon />}</Box>
      <Text variant="h3" textAlign="center" marginBottom="xs">
        {title}
      </Text>
      {description && (
        <Text
          variant="bodySmall"
          textAlign="center"
          color="textSecondary"
          marginBottom="md"
        >
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} variant="primary" />
      )}
    </Box>
  );
}