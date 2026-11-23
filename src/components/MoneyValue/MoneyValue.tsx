import React from 'react';
import { Text } from '../../theme';
import { usePreferencesStore } from '../../features/configuracoes/stores/preferencesStore';
import { formatCurrency } from '../../utils/currency';
import type { PreferencesState } from '../../features/configuracoes/stores/preferencesStore';

interface MoneyValueProps {
  amount: number;
  variant?: 'body' | 'bodyStrong' | 'h1' | 'h2' | 'caption' | 'display';
}

export function MoneyValue({ amount, variant = 'bodyStrong' }: MoneyValueProps) {
  const hideValues = usePreferencesStore((state: PreferencesState) => state.hideValues);
  const label = hideValues ? '••••' : formatCurrency(amount);
  return <Text variant={variant}>{label}</Text>;
}

export default MoneyValue;
