import React from 'react';
import { Text } from '../../theme';
import { usePreferencesStore } from '../../features/configuracoes/stores/preferencesStore';
import type { PreferencesState } from '../../features/configuracoes/stores/preferencesStore';

interface MaskedTextProps {
  text: string;
  variant?: 'body' | 'bodyStrong' | 'h1' | 'h2' | 'caption' | 'display';
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
}

export function MaskedText({
  text,
  variant = 'bodyStrong',
  numberOfLines = 1,
  ellipsizeMode = 'tail',
}: MaskedTextProps) {
  const hideValues = usePreferencesStore((state: PreferencesState) => state.hideValues);
  return (
    <Text variant={variant} numberOfLines={numberOfLines} ellipsizeMode={ellipsizeMode}>
      {hideValues ? '••••' : text}
    </Text>
  );
}

export default MaskedText;
