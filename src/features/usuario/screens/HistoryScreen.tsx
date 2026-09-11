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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'History'>;

export function HistoryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const profile = useUserStore((state) => state.profile);
  const topBar = useTopBarActions();
  const { width } = useWindowDimensions();
  const { commitments } = useAppCommitments();
  const { payments } = useAppPayments();

  const isSmallPhone = width < 360;

  const entries = useMemo(() => {
    const items: { id: string; type: 'commitment' | 'payment'; action: string; description: string; when: string; amount?: number }[] = [];
    commitments.forEach((commitment) => {
      items.push({
        id: `c-${commitment.id}-create`,
        type: 'commitment',
        action: 'Compromisso criado',
        description: commitment.name,
        when: commitment.createdAt,
        amount: commitment.amount,
      });
      items.push({
        id: `c-${commitment.id}-update`,
        type: 'commitment',
        action: 'Compromisso atualizado',
        description: commitment.name,
        when: commitment.updatedAt,
        amount: commitment.amount,
      });
    });
    payments.forEach((payment) => {
      items.push({
        id: `p-${payment.id}-create`,
        type: 'payment',
        action: 'Pagamento registrado',
        description: payment.description,
        when: payment.createdAt,
        amount: payment.amount,
      });
    });
    return items.sort((a, b) => b.when.localeCompare(a.when)).slice(0, 30);
  }, [commitments, payments]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFB' }} edges={['top']}>
      <Box flex={1} width="100%" maxWidth={430} alignSelf="center" bg="background">
        <TopBar
          initials={profile?.initials ?? 'G'}
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
              Acompanhe as últimas ações em compromissos e pagamentos.
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
                        {new Date(entry.when).toLocaleString('pt-BR')}
                      </Text>
                    </Box>
                    {entry.amount !== undefined ? (
                      <Pill label={formatCurrency(entry.amount)} tone="primary" />
                    ) : null}
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
