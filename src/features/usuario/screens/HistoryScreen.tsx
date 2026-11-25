import React, { useMemo, useState } from 'react';
import { ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { TopBar } from '../../../components/TopBar';
import { Pill } from '../../../components/Pill';
import { Box, Text, useTheme } from '../../../theme';
import { Modal } from '../../../components/Modal';
import { Button } from '../../../components/Button';
import { PressableBox } from '../../../theme';
import { useUserStore } from '../stores/userStore';
import { useAppCommitments, useAppPayments } from '../../../contexts/AppContext';
import { useTopBarActions } from '../../../hooks/useTopBarActions';
import { useTranslation } from '../../../hooks/useTranslation';
import type { RootStackParamList } from '../../../navigation/types';
import { useFormatMoney } from '../../../hooks/useFormatMoney';
import { parseBRDate } from '../../../utils/date';
import { translateCategory } from '../../../utils/categoryTranslations';
import { paymentMethodLabels } from '../../pagamentos/types/Payment';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'History'>;

interface HistoryEntry {
  id: string;
  type: 'commitment' | 'payment';
  action: string;
  description: string;
  when: string;
  amount: number;
  category?: string;
  method?: string;
  payerName?: string;
  commitmentName?: string;
  groupName?: string;
  status?: string;
}

export function HistoryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const profile = useUserStore((state) => state.profile);
  const topBar = useTopBarActions();
  const { width } = useWindowDimensions();
  const { commitments } = useAppCommitments();
  const { payments } = useAppPayments();

  const isSmallPhone = width < 360;
  const theme = useTheme();
  const { t, language } = useTranslation();
  const formatMoney = useFormatMoney();

  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);

  // O backend tem HistoricoAlteracao, mas nenhum endpoint que a exponha: esta é a
  // linha do tempo dos registros reais que a API devolve.
  const entries = useMemo(() => {
    const items: HistoryEntry[] = [];

    commitments.forEach((commitment) => {
      items.push({
        id: `commitment-${commitment.id}`,
        type: 'commitment',
        action: t('history.commitmentLaunched'),
        description: `${commitment.name} • ${commitment.groupName}`,
        when: commitment.dueDate,
        amount: commitment.amount,
        category: commitment.category,
        groupName: commitment.groupName,
        status: commitment.status,
      });
    });

    payments.forEach((payment) => {
      items.push({
        id: `payment-${payment.id}`,
        type: 'payment',
        action: t('history.paymentRegistered'),
        description: `${payment.payerName} • ${payment.commitmentName}`,
        when: payment.date,
        amount: payment.amount,
        category: payment.category,
        method: payment.method,
        payerName: payment.payerName,
        commitmentName: payment.commitmentName,
        groupName: payment.groupName,
        status: payment.status,
      });
    });

    return items
      .sort((a, b) => {
        const left = parseBRDate(b.when)?.getTime() ?? 0;
        const right = parseBRDate(a.when)?.getTime() ?? 0;
        return left - right;
      })
      .slice(0, 50);
  }, [commitments, payments, t]);

  const entryDetail = useMemo(() => {
    if (!selectedEntry) return null;

    if (selectedEntry.type === 'commitment') {
      const commitment = commitments.find((c) => `commitment-${c.id}` === selectedEntry.id);
      if (!commitment) return null;
      return {
        type: selectedEntry.type,
        action: selectedEntry.action,
        description: selectedEntry.description,
        date: selectedEntry.when,
        amount: selectedEntry.amount,
        category: commitment.category,
        groupName: commitment.groupName,
        status: commitment.status,
        dueDate: commitment.dueDate,
      };
    }

    const payment = payments.find((p) => `payment-${p.id}` === selectedEntry.id);
    if (!payment) return null;
    return {
      type: selectedEntry.type,
      action: selectedEntry.action,
      description: selectedEntry.description,
      date: selectedEntry.when,
      amount: selectedEntry.amount,
      category: payment.category,
      method: payment.method,
      payerName: payment.payerName,
      commitmentName: payment.commitmentName,
      groupName: payment.groupName,
      status: payment.status,
    };
  }, [selectedEntry, commitments, payments]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <Box flex={1} width="100%" maxWidth={430} alignSelf="center" bg="background">
        <TopBar
          initials={profile?.initials ?? ''}
          onOpenMenu={topBar.openMenu}
          onOpenNotifications={topBar.openNotifications}
          onOpenProfile={topBar.openProfile}
        />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 110 }}
          showsVerticalScrollIndicator={false}
        >
          <Box width="100%" px={isSmallPhone ? 'sm' : 'md'} pt="md">
            <Text variant="h2" mb="xs">{t('settings.history')}</Text>
            <Text variant="bodySmall" color="textSecondary" mb="md">
              {t('history.subtitle')}
            </Text>

            {entries.length === 0 ? (
              <Text variant="body" color="textSecondary">
                {t('history.noRecords')}
              </Text>
            ) : (
              entries.map((entry) => (
                <PressableBox
                  key={entry.id}
                  onPress={() => setSelectedEntry(entry)}
                  accessibilityRole="button"
                  accessibilityLabel={`Ver detalhes de ${entry.description}`}
                >
                  <Box
                    bg="surface"
                    borderRadius="md"
                    borderWidth={1}
                    borderColor="cardBorder"
                    p="md"
                    mb="sm"
                  >
                    <Box flexDirection="row" alignItems="center" justifyContent="space-between">
                      <Box flex={1}>
                        <Text variant="bodyStrong">{entry.action}</Text>
                        <Text variant="caption" color="textSecondary">
                          {entry.description}
                        </Text>
                        <Text variant="caption" color="textMuted">
                          {entry.when}
                        </Text>
                      </Box>
                      <Pill label={formatMoney(entry.amount)} tone="primary" />
                    </Box>
                  </Box>
                </PressableBox>
              ))
            )}
          </Box>
        </ScrollView>

        {entryDetail && (
          <Modal
            visible={true}
            onClose={() => setSelectedEntry(null)}
            title={t('history.modalTitle')}
            variant="center"
            showCloseButton
            footer={
              <Button
                title={t('history.close')}
                variant="outline"
                fullWidth
                onPress={() => setSelectedEntry(null)}
              />
            }
          >
            <Box gap="md">
              <Box
                flexDirection="row"
                justifyContent="space-between"
                bg="surface"
                borderRadius="md"
                borderWidth={1}
                borderColor="cardBorder"
                p="md"
              >
                <Box>
                  <Text variant="captionStrong" color="textMuted">
                    {t('history.detailType')}
                  </Text>
                  <Text variant="bodyStrong">
                    {entryDetail.type === 'commitment'
                      ? t('history.typeCommitment')
                      : t('history.typePayment')}
                  </Text>
                </Box>
                <Box>
                  <Text variant="captionStrong" color="textMuted">
                    {t('history.detailStatus')}
                  </Text>
                  <Text variant="bodyStrong">{entryDetail.status ?? '-'}</Text>
                </Box>
              </Box>

              <Box
                flexDirection="row"
                justifyContent="space-between"
                bg="surface"
                borderRadius="md"
                borderWidth={1}
                borderColor="cardBorder"
                p="md"
              >
                <Box>
                  <Text variant="captionStrong" color="textMuted">
                    {t('history.detailDate')}
                  </Text>
                  <Text variant="bodyStrong">{entryDetail.date}</Text>
                </Box>
                <Box>
                  <Text variant="captionStrong" color="textMuted">
                    {t('history.detailAmount')}
                  </Text>
                  <Text variant="bodyStrong">{formatMoney(entryDetail.amount)}</Text>
                </Box>
              </Box>

              {entryDetail.groupName && (
                <Box
                  flexDirection="row"
                  justifyContent="space-between"
                  bg="surface"
                  borderRadius="md"
                  borderWidth={1}
                  borderColor="cardBorder"
                  p="md"
                >
                  <Box>
                    <Text variant="captionStrong" color="textMuted">
                      {t('history.detailGroup')}
                    </Text>
                    <Text variant="bodyStrong">{entryDetail.groupName}</Text>
                  </Box>
                  {entryDetail.commitmentName && (
                    <Box>
                      <Text variant="captionStrong" color="textMuted">
                        {t('history.detailCommitment')}
                      </Text>
                      <Text variant="bodyStrong">{entryDetail.commitmentName}</Text>
                    </Box>
                  )}
                </Box>
              )}

              {entryDetail.payerName && (
                <Box
                  flexDirection="row"
                  justifyContent="space-between"
                  bg="surface"
                  borderRadius="md"
                  borderWidth={1}
                  borderColor="cardBorder"
                  p="md"
                >
                  <Box>
                    <Text variant="captionStrong" color="textMuted">
                      {t('history.detailPayer')}
                    </Text>
                    <Text variant="bodyStrong">{entryDetail.payerName}</Text>
                  </Box>
                </Box>
              )}

              {entryDetail.method && (
                <Box
                  flexDirection="row"
                  justifyContent="space-between"
                  bg="surface"
                  borderRadius="md"
                  borderWidth={1}
                  borderColor="cardBorder"
                  p="md"
                >
                  <Box>
                    <Text variant="captionStrong" color="textMuted">
                      {t('history.detailMethod')}
                    </Text>
                    <Text variant="bodyStrong">
                      {t(
                        paymentMethodLabels[entryDetail.method as keyof typeof paymentMethodLabels],
                      ) ?? entryDetail.method}
                    </Text>
                  </Box>
                </Box>
              )}

              {entryDetail.category && (
                <Box
                  flexDirection="row"
                  justifyContent="space-between"
                  bg="surface"
                  borderRadius="md"
                  borderWidth={1}
                  borderColor="cardBorder"
                  p="md"
                >
                  <Box>
                    <Text variant="captionStrong" color="textMuted">
                      {t('history.detailCategory')}
                    </Text>
                    <Text variant="bodyStrong">{translateCategory(entryDetail.category, language)}</Text>
                  </Box>
                </Box>
              )}

              <Box
                flexDirection="row"
                justifyContent="space-between"
                bg="surface"
                borderRadius="md"
                borderWidth={1}
                borderColor="cardBorder"
                p="md"
              >
                <Box>
                  <Text variant="captionStrong" color="textMuted">
                    {t('history.detailAction')}
                  </Text>
                  <Text variant="bodyStrong">{entryDetail.action}</Text>
                </Box>
              </Box>

              <Box
                flexDirection="row"
                justifyContent="space-between"
                bg="surface"
                borderRadius="md"
                borderWidth={1}
                borderColor="cardBorder"
                p="md"
              >
                <Box>
                  <Text variant="captionStrong" color="textMuted">
                    {t('history.detailDescription')}
                  </Text>
                  <Text variant="bodyStrong">{entryDetail.description}</Text>
                </Box>
              </Box>
            </Box>
          </Modal>
        )}
      </Box>
    </SafeAreaView>
  );
}

export default HistoryScreen;
