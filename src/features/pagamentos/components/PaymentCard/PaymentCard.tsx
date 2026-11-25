import React from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Box, Text, useTheme, lightTheme } from '../../../../theme';
import { Pill } from '../../../../components/Pill';
import { useTranslation } from '../../../../hooks/useTranslation';
import type { Payment } from '../../types/Payment';
import { paymentMethodLabels } from '../../types/Payment';
import { MoneyValue } from '../../../../components/MoneyValue';
import { translateCategory } from '../../../../utils/categoryTranslations';

interface PaymentCardProps {
  payment: Payment;
  onPress?: (id: string) => void;
}

type StatusPalette = Record<
  'paid' | 'partial' | 'pending',
  {
    background: keyof typeof lightTheme.colors;
    color: keyof typeof lightTheme.colors;
    border: keyof typeof lightTheme.colors;
  }
>;

function statusPaletteFor(): StatusPalette {
  return {
    paid: { background: 'successLight', color: 'success', border: 'success' },
    partial: { background: 'warningLight', color: 'warning', border: 'warning' },
    pending: { background: 'primaryLight', color: 'primary', border: 'primary' },
  };
}

const statusLabel = {
  paid: 'common.paid',
  partial: 'common.partial',
  pending: 'common.pending',
};

function CardIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M3.5 6h17v12h-17z" stroke={color} strokeWidth={1.7} strokeLinejoin="round" />
      <Path d="M3.5 10h17" stroke={color} strokeWidth={1.7} />
    </Svg>
  );
}

export function PaymentCard({ payment, onPress }: PaymentCardProps) {
  const theme = useTheme();
  const { t, language } = useTranslation();
  const palette = statusPaletteFor()[payment.status];

  return (
    <Pressable
      onPress={() => onPress?.(payment.id)}
      accessibilityRole="button"
    >
      <Box
        bg="surface"
        borderRadius="md"
        borderWidth={1}
        borderColor="cardBorder"
        p="md"
        mb="md"
      >
        <Box flexDirection="row" alignItems="center" gap="sm">
          <Box
            width={40}
            height={40}
            borderRadius="md"
            bg="primaryLight"
            alignItems="center"
            justifyContent="center"
          >
            <CardIcon color={theme.colors.primary} />
          </Box>
          <Box flex={1}>
            <Text variant="bodyStrong" numberOfLines={1}>{payment.commitmentName}</Text>
            <Text variant="caption" color="textSecondary" numberOfLines={1}>
              {payment.groupName} • {payment.payerName}
            </Text>
          </Box>
          <Box
            flexDirection="row"
            alignItems="center"
            paddingHorizontal="xs"
            paddingVertical="xxs"
            borderRadius="full"
            borderWidth={1}
            bg={palette.background}
            borderColor={palette.border}
          >
            <Box width={6} height={6} borderRadius="full" bg={palette.color} marginRight="xs" />
            <Text variant="captionStrong" color={palette.color} style={{ fontSize: 12 }}>
              {t(statusLabel[payment.status])}
            </Text>
          </Box>
        </Box>

        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          mt="sm"
        >
          <Box flexDirection="row" alignItems="center" gap="xs" flexWrap="wrap">
            <Pill label={t(paymentMethodLabels[payment.method])} tone="primary" size="sm" />
            <Pill label={translateCategory(payment.category, language)} tone="neutral" size="sm" />
          </Box>
          <MoneyValue amount={payment.amount} />
        </Box>

        <Text variant="caption" color="textSecondary" mt="xs">
          {payment.date}
        </Text>
      </Box>
    </Pressable>
  );
}

export default PaymentCard;
