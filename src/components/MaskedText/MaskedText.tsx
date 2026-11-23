import React from 'react';
import { Text } from '../../theme';
import { usePreferencesStore } from '../../features/configuracoes/stores/preferencesStore';
import type { PreferencesState } from '../../features/configuracoes/stores/preferencesStore';

interface MaskedTextProps {
  text: string;
  variant?: 'body' | 'bodyStrong' | 'h1' | 'h2' | 'caption' | 'display';
}

export function MaskedText({ text, variant = 'bodyStrong' }: MaskedTextProps) {
  const hideValues = usePreferencesStore((state: PreferencesState) => state.hideValues);
  return <Text variant={variant}>{hideValues ? '••••' : text}</Text>;
}

export default MaskedText;
