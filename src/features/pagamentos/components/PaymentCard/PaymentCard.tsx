import React from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Box, Text } from '../../../../theme';
import { Pill } from '../../../../components/Pill';
import type { Payment } from '../../types/Payment';
import { cardBrandLabels, paymentMethodLabels } from '../../types/Payment';
import { formatCurrency } from '../../../../utils/currency';

interface PaymentCardProps {
  payment: Payment;
  onPress?: (id: string) => void;
}

const statusPalette = {
  paid: { background: '#E7F8F2', color: '#16AF7E', border: '#B6E7D6' },
  partial: { background: '#FFF6E2', color: '#E8A924', border: '#F2DAA6' },
  pending: { background: '#EDF5FF', color: '#3089EF', border: '#BDD7FB' },
};

const statusLabel = {
  paid: 'Pago',
  partial: 'Parcial',
  pending: 'Pendente',
};

function CardIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M3.5 6h17v12h-17z" stroke="#0071DF" strokeWidth={1.7} strokeLinejoin="round" />
      <Path d="M3.5 10h17" stroke="#0071DF" strokeWidth={1.7} />
    </Svg>
  );
}

function methodLabel(payment: Payment): string {
  if (payment.method === 'card') {
    return `${paymentMethodLabels.card} • ${cardBrandLabels[payment.cardBrand ?? 'credit']}`;
  }
  if (payment.method === 'other' && payment.otherMethod) {
    return `${paymentMethodLabels.other} • ${payment.otherMethod}`;
  }
  return paymentMethodLabels[payment.method];
}

export function PaymentCard({ payment, onPress }: PaymentCardProps) {
  const palette = statusPalette[payment.status];

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
            <CardIcon />
          </Box>
          <Box flex={1}>
            <Text variant="bodyStrong" numberOfLines={1}>{payment.description}</Text>
            <Text variant="caption" color="textSecondary" numberOfLines={1}>
              {payment.groupName} • {payment.payerName}
            </Text>
          </Box>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 9999,
              borderWidth: 1,
              backgroundColor: palette.background,
              borderColor: palette.border,
            }}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 9999,
                backgroundColor: palette.color,
                marginRight: 4,
              }}
            />
            <Text style={{ color: palette.color, fontSize: 12, fontWeight: '600' }}>
              {statusLabel[payment.status]}
            </Text>
          </View>
        </Box>

        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          mt="sm"
        >
          <Box flexDirection="row" alignItems="center" gap="xs" flexWrap="wrap">
            <Pill label={methodLabel(payment)} tone="primary" size="sm" />
            <Pill label={payment.category} tone="neutral" size="sm" />
          </Box>
          <Text variant="bodyStrong">{formatCurrency(payment.amount)}</Text>
        </Box>

        <Text variant="caption" color="textSecondary" mt="xs">
          {payment.date}
          {payment.commitmentName ? ` • ${payment.commitmentName}` : ''}
        </Text>
        {payment.notes ? (
          <Text variant="caption" color="textMuted" mt="xxs" numberOfLines={2}>
            {payment.notes}
          </Text>
        ) : null}
      </Box>
    </Pressable>
  );
}

export default PaymentCard;
