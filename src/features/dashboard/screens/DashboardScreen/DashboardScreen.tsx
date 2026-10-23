import React, { useCallback, useEffect, useMemo } from 'react';
import { ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { TopBar } from '../../../../components/TopBar';
import { Button } from '../../../../components/Button';
import { Loading } from '../../../../components/Loading';
import { Box, Text } from '../../../../theme';
import { useAppDashboard } from '../../hooks/useDashboard';
import { StatCard } from '../../components/StatCard/StatCard';
import { SectionCard } from '../../components/SectionCard/SectionCard';
import { TransactionItem } from '../../components/TransactionItem/TransactionItem';
import { UpcomingItem } from '../../components/UpcomingItem/UpcomingItem';
import { AlertBanner } from '../../components/AlertBanner/AlertBanner';
import { useTopBarActions } from '../../../../hooks/useTopBarActions';
import { useAppNotifications } from '../../../../hooks/useNotifications';
import { formatCurrency } from '../../../../utils/currency';
import { isoToBR } from '../../../../utils/date';
import { initialsFromName } from '../../../../utils/formatters';
import { environment } from '../../../../config/environment';
import { useAuthStore } from '../../../auth/stores/authStore';
import { SituacaoPagamento } from '../../Types/Dashboard';
import type { RootStackParamList } from '../../../../navigation/types';


type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TransactionStatus = 'paid' | 'partial' | 'pending';

const transactionStatusByPaymentSituation: Record<SituacaoPagamento, TransactionStatus> = {
  [SituacaoPagamento.Pendente]: 'pending',
  [SituacaoPagamento.Pago]: 'paid',
  [SituacaoPagamento.Parcial]: 'partial',
};

function resolveCommitmentImageUrl(imageUrl: string | null): string | null {
  if (!imageUrl) return null;
  return `${environment.mediaUrl}/${imageUrl}`;
}

export function DashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { width } = useWindowDimensions();
  const { data, isLoading, isError: dashboardError, refetch } = useAppDashboard();
  const topBar = useTopBarActions();
  const { unreadCount } = useAppNotifications();
  const user = useAuthStore((state) => state.user);
  const isSmallPhone = width < 360;


  const statCards = useMemo(
    () =>
      data
        ? [
            {
              id: 'stat-groups',
              tone: 'blue' as const,
              icon: 'groups' as const,
              label: 'Grupos Ativos',
              value: String(data.gruposAtivosCount),
            },
            {
              id: 'stat-due-soon',
              tone: 'yellow' as const,
              icon: 'clock' as const,
              label: 'Vencendo em Breve',
              value: String(data.compromissosAVencerCount),
            },
            {
              id: 'stat-pending-payments',
              tone: 'blue' as const,
              icon: 'card' as const,
              label: 'Pagamentos Pendentes',
              value: String(data.pagamentosPendentesCount),
            },
            {
              id: 'stat-punctuality',
              tone: 'green' as const,
              icon: 'trend' as const,
              label: 'Taxa de Pontualidade',
              value: `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(
                data.taxaDePontualidade * 100,
              )}%`,
            },
          ]
        : [],
    [data],
  );

  const transactions = useMemo(
    () =>
      (data?.transacoesEVencimentos ?? [])
        .slice(0, 5)
        .map((item) => {
          return {
            id: item.integranteCompromissoToken,
            imageUrl: resolveCommitmentImageUrl(item.imagemCompromissoUrl),
            initials: initialsFromName(item.nomeCompromisso),
            name: item.nomeCompromisso,
            group: item.nomeGrupo,
            value: formatCurrency(item.valorDevedor),
            status: transactionStatusByPaymentSituation[item.situacaoPagamento],
          };
        }),
    [data],
  );

  const upcomingCommitments = useMemo(
    () =>
      (data?.transacoesEVencimentos ?? [])
        .filter((item) => !item.vencido && item.diasParaVencimento >= 0)
        .map((item) => ({
          source: item,
          remaining: Math.max(0, item.valorDevedor - item.valorPago),
        }))
        .filter(({ remaining }) => remaining > 0.01)
        .sort((first, second) => first.source.diasParaVencimento - second.source.diasParaVencimento)
        .slice(0, 4)
        .map(({ source }) => ({
          id: source.integranteCompromissoToken,
          imageUrl: resolveCommitmentImageUrl(source.imagemCompromissoUrl),
          initials: initialsFromName(source.nomeCompromisso),
          name: source.nomeCompromisso,
          group: source.nomeGrupo,
          value: formatCurrency(source.valorDevedor),
          date: isoToBR(source.dataVencimento) || source.dataVencimento,
          daysToDue: source.diasParaVencimento,
        })),
    [data],
  );

  const handleNewPayment = useCallback(() => {
    navigation.navigate('NewPayment');
  }, [navigation]);

  const handleViewOverdue = useCallback(() => {
    navigation.navigate('Main', { screen: 'Commitments', params: { filter: 'vencidos' } });
  }, [navigation]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFB' }} edges={['top']}>
      <Box flex={1} width="100%" maxWidth={430} alignSelf="center" bg="background">
        <TopBar
          initials={user?.initials ?? ''}
          imageUrl={user?.imageUrl ? `${environment.mediaUrl}/${user.imageUrl}` : undefined}
          notificationCount={unreadCount}
          onOpenMenu={topBar.openMenu}
          onOpenNotifications={topBar.openNotifications}
          onOpenProfile={topBar.openProfile}
        />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 110 }}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Box width="100%" px={isSmallPhone ? 'sm' : 'md'} pt="md">
            <Box mb="md">
              <Text variant="captionStrong" color="primary">
                {greeting.toUpperCase()}
              </Text>
              <Text variant="h1">{user?.name?.split(' ')[0] || 'Olá'}</Text>
              <Text variant="bodySmall" color="textSecondary">
                Sua visão geral financeira em um só lugar.
              </Text>
            </Box>

            {dashboardError ? (
              <Box bg="dangerLight" borderRadius="md" p="md" mb="md">
                <Text variant="bodyStrong" color="danger">
                  Não foi possível carregar seus dados
                </Text>
                <Text variant="caption" color="textSecondary" mb="sm">
                  {dashboardError ?? 'Verifique se a API está rodando.'}
                </Text>
                <Button title="Tentar novamente" onPress={refetch} size="sm" />
              </Box>
            ) : null}

            {isLoading ? (
              <Box mb="md">
                <Loading label="Carregando seus dados..." />
              </Box>
            ) : null}

            <Box flexDirection="row" flexWrap="wrap" gap="sm" mb="md">
              {statCards.map((stat) => (
                <Box key={stat.id} width="47%">
                  <StatCard stat={stat} />
                </Box>
              ))}
            </Box>

            {data && data.compromissosVencidosCount > 0 ? (
              <Box mb="md">
                <AlertBanner
                  title={`${data.compromissosVencidosCount} compromisso${data.compromissosVencidosCount === 1 ? '' : 's'} vencido${data.compromissosVencidosCount === 1 ? '' : 's'}`}
                  description="Regularize os valores em aberto para evitar pendências no grupo."
                  onPressView={handleViewOverdue}
                />
              </Box>
            ) : data ? (
              <Box
                bg="successLight"
                borderRadius="md"
                p="md"
                mb="md"
                flexDirection="row"
                alignItems="center"
                gap="sm"
              >
                <Box
                  width={36}
                  height={36}
                  borderRadius="full"
                  bg="surface"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text variant="bodyStrong" color="success">✓</Text>
                </Box>
                <Box flex={1}>
                  <Text variant="bodyStrong" color="success">
                    Tudo em dia
                  </Text>
                  <Text variant="caption" color="textSecondary">
                    Sem compromissos vencidos neste momento.
                  </Text>
                </Box>
              </Box>
            ) : null}

            <Button
              title="Novo pagamento"
              onPress={handleNewPayment}
              fullWidth
              size="md"
            />

            <SectionCard title="Últimas transações">
              {transactions.length === 0 ? (
                <Text variant="caption" color="textSecondary">
                  Nenhuma transação para exibir.
                </Text>
              ) : (
                transactions.map((transaction, index) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    showDivider={index > 0}
                  />
                ))
              )}
            </SectionCard>

            <Box mt="md">
              <SectionCard title="Próximos vencimentos">
                {upcomingCommitments.length === 0 ? (
                  <Text variant="caption" color="textSecondary">
                    Nenhum vencimento próximo.
                  </Text>
                ) : (
                  upcomingCommitments.map((item, index) => (
                    <Box key={item.id}>
                      {index > 0 && <Box height={1} bg="border" mb="sm" />}
                      <UpcomingItem upcoming={item} />
                    </Box>
                  ))
                )}
              </SectionCard>
            </Box>
          </Box>
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
}

export default DashboardScreen;
