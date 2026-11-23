import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { Box, Text, useTheme } from '../../../../theme';
import { CommitmentAvatar } from '../CommitmentAvatar/CommitmentAvatar';
import { MoneyValue } from '../../../../components/MoneyValue';
import { useTranslation } from '../../../../hooks/useTranslation';

type TransactionStatus = 'paid' | 'partial' | 'pending';

interface DashboardTransaction {
  id: string;
  imageUrl: string | null;
  initials: string;
  name: string;
  group: string;
  value: number;
  status: TransactionStatus;
}

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
          <Path
            d="M6 1.4 11 10.3H1L6 1.4Z"
            stroke={color}
            strokeWidth={1.15}
            strokeLinejoin="round"
          />
          <Path d="M6 4.1v2.5" stroke={color} strokeWidth={1.2} strokeLinecap="round" />
          <Circle cx={6} cy={8.3} r={0.55} fill={color} />
        </Svg>
      );
  }
}

function statusColorsFor(theme: any) {
  return {
    paid: { color: theme.colors.success, label: 'common.paid' },
    partial: { color: theme.colors.warning, label: 'common.partial' },
    pending: { color: theme.colors.danger, label: 'common.pending' },
  };
}

export function TransactionItem({
  transaction,
  showDivider = false,
}: TransactionItemProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const status = statusColorsFor(theme)[transaction.status];

  return (
    <Box>
      {showDivider && <Box height={1} bg="border" mb="md" />}
      <Box flexDirection="row" alignItems="center" py="sm">
        <CommitmentAvatar
          imageUrl={transaction.imageUrl}
          initials={transaction.initials}
        />

        <Box flex={1} px="md">
          <Text variant="h3" numberOfLines={1}>
            {transaction.name}
          </Text>
          <Text variant="caption" color="textSecondary" numberOfLines={1} mt="xxs">
            {transaction.group}
          </Text>
        </Box>

        <Box alignItems="flex-end">
          <MoneyValue amount={transaction.value} />
          <Box
            flexDirection="row"
            alignItems="center"
            gap="xxs"
            mt="xxs"
            paddingVertical="xxs"
            paddingHorizontal="xs"
            borderRadius="full"
            bg={
              transaction.status === 'paid'
                ? 'successLight'
                : transaction.status === 'partial'
                  ? 'warningLight'
                  : 'dangerLight'
            }
          >
            {renderStatusIcon(transaction.status, status.color)}
            <Text variant="caption" style={{ color: status.color, fontWeight: '600' }}>
              {t(status.label)}
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}