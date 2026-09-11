import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { Box, Text } from '../../../../theme';
import { statusLabel, statusPalette } from '../../../../types/transactionStatus';
import type { DashboardOverviewData } from '../../hooks/useDashboardOverview';

type TransactionStatus = 'paid' | 'partial' | 'pending';

type DashboardTransaction = DashboardOverviewData['transactions'][number];

interface TransactionItemProps {
  transaction: DashboardTransaction;
  showDivider?: boolean;
}

function renderStatusIcon(status: TransactionStatus, color: string) {
  switch (status) {
    case 'paid':
      return (
        <Svg width={12} height={12} viewBox="0 0 12 12" fill="none">
          <Path
            d="m2 6.1 2.3 2.2L10 2.9"
            stroke={color}
            strokeWidth={1.55}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'partial':
      return (
        <Svg width={12} height={12} viewBox="0 0 12 12" fill="none">
          <Circle cx={6} cy={6} r={4.1} stroke={color} strokeWidth={1.25} />
          <Path d="M6 3.8V6l1.5 1" stroke={color} strokeWidth={1.2} strokeLinecap="round" />
        </Svg>
      );
    case 'pending':
      return (
        <Svg width={12} height={12} viewBox="0 0 12 12" fill="none">
          <Circle cx={6} cy={6} r={4.2} stroke={color} strokeWidth={1.3} />
          <Path d="M6 3.6V6.2" stroke={color} strokeWidth={1.3} strokeLinecap="round" />
          <Circle cx={6} cy={8.4} r={0.65} fill={color} />
        </Svg>
      );
  }
}

export function TransactionItem({
  transaction,
  showDivider = false,
}: TransactionItemProps) {
  const palette = statusPalette[transaction.status];
  const label = statusLabel[transaction.status];

  return (
    <Box>
      {showDivider && <Box height={1} bg="border" mb="md" />}
      <Box flexDirection="row" alignItems="center" py="sm">
        <Box
          width={40}
          height={40}
          borderRadius="full"
          bg="primaryLight"
          alignItems="center"
          justifyContent="center"
        >
          <Text variant="bodySmallStrong" color="primary">
            {transaction.initials}
          </Text>
        </Box>

        <Box flex={1} px="md">
          <Text variant="bodyStrong" numberOfLines={1}>
            {transaction.name}
          </Text>
          <Box flexDirection="row" alignItems="center" gap="xs" mt="xxs" flexWrap="wrap">
            <Text variant="caption" color="textSecondary" numberOfLines={1}>
              {transaction.group}
            </Text>
            <Box
              bg="border"
              px="xs"
              py="xxs"
              borderRadius="full"
            >
              <Text variant="caption" color="textSecondary">
                {transaction.category}
              </Text>
            </Box>
            <Text variant="caption" color="textMuted">
              {transaction.date}
            </Text>
          </Box>
        </Box>

        <Box alignItems="flex-end">
          <Text variant="bodyStrong">{transaction.value}</Text>
          <Box
            flexDirection="row"
            alignItems="center"
            gap="xxs"
            px="xs"
            py="xxs"
            borderRadius="full"
            mt="xxs"
            style={{ backgroundColor: palette.background }}
          >
            {renderStatusIcon(transaction.status, palette.color)}
            <Text variant="caption" style={{ color: palette.color, fontWeight: '600' }}>
              {label}
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}