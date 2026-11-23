import React, { useEffect, useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { Pill } from '../../../../components/Pill';
import { Box, Text, useTheme } from '../../../../theme';
import { useTranslation } from '../../../../hooks/useTranslation';
import type { Commitment, CommitmentSummary } from '../../types/Commitment';
import { summarizeCommitment } from '../../services/split';
import { MoneyValue } from '../../../../components/MoneyValue';
import { useFormatMoney } from '../../../../hooks/useFormatMoney';
import { isCommitmentOverdue } from '../../../../utils/date';
import { translateCategory } from '../../../../utils/categoryTranslations';
import { initialsFromName } from '../../../../utils/formatters';
import { environment } from '../../../../config/environment';

interface CommitmentCardProps {
  commitment: Commitment | CommitmentSummary;
  onPress?: (id: string) => void;
}

function statusPaletteFor(theme: any) {
  return {
    paid: { background: theme.colors.successLight, color: theme.colors.success, border: theme.colors.success },
    partial: { background: theme.colors.warningLight, color: theme.colors.warning, border: theme.colors.warning },
    pending: { background: theme.colors.primaryLight, color: theme.colors.primary, border: theme.colors.primary },
    overdue: { background: theme.colors.dangerLight, color: theme.colors.danger, border: theme.colors.danger },
  };
}

function avatarColorsFor(theme: any) {
  return {
    blue: theme.colors.primary,
    teal: theme.colors.success,
    indigo: '#6E5BEF',
  };
}

export function CommitmentCard({ commitment, onPress }: CommitmentCardProps) {
  const theme = useTheme();
  const { t, language } = useTranslation();
  const formatMoney = useFormatMoney();

  const [imageFailed, setImageFailed] = useState(false);

  const statusLabel = {
    paid: t('common.paid'),
    partial: t('common.partial'),
    pending: t('common.pending'),
    overdue: t('common.overdue'),
  };

  const isOverdue = isCommitmentOverdue(commitment);
  const effectiveStatus = isOverdue ? 'overdue' : commitment.status;
  const palette = statusPaletteFor(theme)[effectiveStatus];
  const summary =
    'splits' in commitment
      ? summarizeCommitment(commitment)
      : { progress: commitment.progress, remaining: commitment.remainingAmount };
  const imageUri = commitment.imagem
    ? /^https?:\/\//i.test(commitment.imagem)
      ? commitment.imagem
      : `${environment.mediaUrl}/${commitment.imagem}`
    : null;
  const avatarColors = avatarColorsFor(theme);

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
            {imageUri && !imageFailed ? (
              <Image
                source={{ uri: imageUri }}
                onError={() => setImageFailed(true)}
                style={{ width: 44, height: 44, borderRadius: 9999 }}
              />
            ) : (
              <Text variant="bodyStrong" color="white" style={{ fontSize: 16 }}>
                {initialsFromName(commitment.name)}
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
          <Pill label={translateCategory(commitment.category, language)} tone="neutral" size="sm" />
          {isOverdue ? (
            <Pill label={t('commitments.overdueOn', { date: commitment.dueDate })} tone="danger" size="sm" />
          ) : (
            <Pill label={t('commitments.dueOn', { date: commitment.dueDate })} tone="primary" size="sm" />
          )}
          <Pill
            label={
              commitment.splitMode === 'equal'
                ? t('commitments.equalSplit')
                : t('commitments.customSplit')
            }
            tone="warning"
            size="sm"
          />
        </Box>

        <Box mt="sm">
          <Box flexDirection="row" justifyContent="space-between" mb="xxs">
            <Text variant="caption" color="textSecondary">{t('commitmentCard.progress')}</Text>
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
            <MoneyValue amount={commitment.amount} />
            <Text variant="caption" color="textMuted">
              Restante {formatMoney(summary.remaining)}
            </Text>
          </Box>
          <Box alignItems="flex-end">
            <Text variant="captionStrong" color="primary">{t('commitmentCard.tapToView')}</Text>
          </Box>
        </Box>
      </Box>
    </Pressable>
  );
}

export default CommitmentCard;
