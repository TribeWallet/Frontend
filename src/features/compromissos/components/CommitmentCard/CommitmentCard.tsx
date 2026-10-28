import React, { useEffect } from 'react';
import { Image, Pressable, View } from 'react-native';
import { Pill } from '../../../../components/Pill';
import { Box, Text } from '../../../../theme';
import type { Commitment, CommitmentSummary } from '../../types/Commitment';
import { summarizeCommitment } from '../../services/split';
import { formatCurrency } from '../../../../utils/currency';
import { diffDays } from '../../../../utils/date';
import { environment } from '../../../../config/environment';

interface CommitmentCardProps {
  commitment: Commitment | CommitmentSummary;
  onPress?: (id: string) => void;
}

const statusPalette = {
  paid: { background: '#E7F8F2', color: '#16AF7E', border: '#B6E7D6' },
  partial: { background: '#FFF6E2', color: '#E8A924', border: '#F2DAA6' },
  pending: { background: '#EDF5FF', color: '#3089EF', border: '#BDD7FB' },
  overdue: { background: '#FDE8EB', color: '#EF5067', border: '#F5C1CB' },
};

const statusLabel = {
  paid: 'Pago',
  partial: 'Parcial',
  pending: 'Pendente',
  overdue: 'Vencido',
};

const avatarColors = {
  blue: '#0071DF',
  teal: '#16AF7E',
  indigo: '#6E5BEF',
};

export function CommitmentCard({ commitment, onPress }: CommitmentCardProps) {
  const daysToDue = diffDays(commitment.dueDate);
  const isOverdue =
    commitment.status !== 'paid' &&
    ('overdue' in commitment ? commitment.overdue : daysToDue !== null && daysToDue < 0);
  const effectiveStatus = isOverdue ? 'overdue' : commitment.status;
  const palette = statusPalette[effectiveStatus];
  const summary =
    'splits' in commitment
      ? summarizeCommitment(commitment)
      : { progress: commitment.progress, remaining: commitment.remainingAmount };
  const imageUri = commitment.imagem
    ? /^https?:\/\//i.test(commitment.imagem)
      ? commitment.imagem
      : `${environment.mediaUrl}/${commitment.imagem}`
    : null;

  return (
    <Pressable
      onPress={() => onPress?.(commitment.id)}
      accessibilityRole="button"
      accessibilityLabel={`Ver compromisso ${commitment.name}`}
    >
      <Box
        bg="surface"
        borderRadius="md"
        borderWidth={isOverdue ? 2 : 1}
        borderColor={isOverdue ? 'danger' : 'cardBorder'}
        p="md"
        mb="md"
      >
        <Box flexDirection="row" alignItems="center" mb="sm" gap="sm">
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 9999,
              backgroundColor: avatarColors[commitment.avatarTone],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={{ width: 44, height: 44, borderRadius: 9999 }}
              />
            ) : (
              <Text variant="bodyStrong" color="white" style={{ fontSize: 16 }}>
              {commitment.initials}
            </Text>
            )}
          </View>

          <Box flex={1}>
            <Text variant="bodyStrong" numberOfLines={1}>{commitment.name}</Text>
            <Text variant="caption" color="textSecondary" numberOfLines={1}>
              {commitment.groupName}
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
              {statusLabel[effectiveStatus]}
            </Text>
          </View>
        </Box>

        <Box flexDirection="row" flexWrap="wrap" gap="xs">
          <Pill label={commitment.category} tone="neutral" size="sm" />
          {isOverdue ? (
            <Pill label={`Vencido em ${commitment.dueDate}`} tone="danger" size="sm" />
          ) : (
            <Pill label={`Vence ${commitment.dueDate}`} tone="primary" size="sm" />
          )}
          <Pill
            label={
              commitment.splitMode === 'equal'
                ? 'Divisão igual'
                : 'Personalizada'
            }
            tone="warning"
            size="sm"
          />
        </Box>

        <Box mt="sm">
          <Box flexDirection="row" justifyContent="space-between" mb="xxs">
            <Text variant="caption" color="textSecondary">Progresso</Text>
            <Text variant="captionStrong">{summary.progress}%</Text>
          </Box>
          <Box height={6} bg="border" borderRadius="full" overflow="hidden">
            <View
              style={{
                height: '100%',
                width: `${summary.progress}%`,
                backgroundColor: palette.color,
              }}
            />
          </Box>
        </Box>

        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          mt="sm"
        >
          <Box>
            <Text variant="bodyStrong">{formatCurrency(commitment.amount)}</Text>
            <Text variant="caption" color="textMuted">
              Restante {formatCurrency(summary.remaining)}
            </Text>
          </Box>
          <Box alignItems="flex-end">
            <Text variant="captionStrong" color="primary">Toque para ver</Text>
          </Box>
        </Box>
      </Box>
    </Pressable>
  );
}

export default CommitmentCard;
