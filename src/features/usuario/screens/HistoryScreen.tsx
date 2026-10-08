import React, { useMemo } from 'react';
import { ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { TopBar } from '../../../components/TopBar';
import { Pill } from '../../../components/Pill';
import { Box, Text } from '../../../theme';
import { useUserStore } from '../stores/userStore';
import { useAppCommitments, useAppPayments } from '../../../contexts/AppContext';
import { useTopBarActions } from '../../../hooks/useTopBarActions';
import type { RootStackParamList } from '../../../navigation/types';
import { formatCurrency } from '../../../utils/currency';
import { parseBRDate } from '../../../utils/date';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'History'>;

export function HistoryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const profile = useUserStore((state) => state.profile);
  const topBar = useTopBarActions();
  const { width } = useWindowDimensions();
  const { commitments } = useAppCommitments();
  const { payments } = useAppPayments();

  const isSmallPhone = width < 360;

  // O backend tem HistoricoAlteracao, mas nenhum endpoint que a exponha: esta é a
  // linha do tempo dos registros reais que a API devolve.
  const entries = useMemo(() => {
    const items: {
      id: string;
      action: string;
      description: string;
      when: string;
      amount: number;
    }[] = [];

    commitments.forEach((commitment) => {
      items.push({
        id: `commitment-${commitment.id}`,
        action: 'Compromisso lançado',
        description: `${commitment.name} • ${commitment.groupName}`,
        when: commitment.dueDate,
        amount: commitment.amount,
      });
    });

    payments.forEach((payment) => {
      items.push({
        id: `payment-${payment.id}`,
        action: 'Pagamento registrado',
        description: `${payment.payerName} • ${payment.commitmentName}`,
        when: payment.date,
        amount: payment.amount,
      });
    });

    return items
      .sort((a, b) => {
        const left = parseBRDate(b.when)?.getTime() ?? 0;
        const right = parseBRDate(a.when)?.getTime() ?? 0;
        return left - right;
      })
      .slice(0, 50);
  }, [commitments, payments]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFB' }} edges={['top']}>
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
            <Text variant="h2" mb="xs">Histórico de alterações</Text>
            <Text variant="bodySmall" color="textSecondary" mb="md">
              Compromissos lançados e pagamentos registrados nos seus grupos.
            </Text>

            {entries.length === 0 ? (
              <Text variant="body" color="textSecondary">
                Sem registros no momento.
              </Text>
            ) : (
              entries.map((entry) => (
                <Box
                  key={entry.id}
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
                    <Pill label={formatCurrency(entry.amount)} tone="primary" />
                  </Box>
                </Box>
              ))
            )}
          </Box>
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
}

export default HistoryScreen;
