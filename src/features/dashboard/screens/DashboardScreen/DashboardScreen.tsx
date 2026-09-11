import React, { useCallback, useMemo } from 'react';
import { ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { TopBar } from '../../../../components/TopBar';
import { Button } from '../../../../components/Button';
import { Pill } from '../../../../components/Pill';
import { Box, Text } from '../../../../theme';
import { useDashboardOverview } from '../../hooks/useDashboardOverview';
import { StatCard } from '../../components/StatCard/StatCard';
import { SectionCard } from '../../components/SectionCard/SectionCard';
import { TransactionItem } from '../../components/TransactionItem/TransactionItem';
import { UpcomingItem } from '../../components/UpcomingItem/UpcomingItem';
import { AlertBanner } from '../../components/AlertBanner/AlertBanner';
import {
  BarChart,
  DonutChart,
  HorizontalBarList,
  LineChart,
} from '../../components/DashboardCharts';
import { useTopBarActions } from '../../../../hooks/useTopBarActions';
import { useAppNotifications } from '../../../../hooks/useNotifications';
import { formatCurrency } from '../../../../utils/currency';
import type { RootStackParamList } from '../../../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const METHOD_LABEL: Record<string, string> = {
  pix: 'PIX',
  card: 'Cartão',
  boleto: 'Boleto',
  other: 'Outro',
};

export function DashboardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { width } = useWindowDimensions();
  const { data } = useDashboardOverview();
  const topBar = useTopBarActions();
  const { unreadCount } = useAppNotifications();
  const isSmallPhone = width < 360;

  const statCards = useMemo(() => data.stats, [data.stats]);

  const methodChartData = useMemo(
    () =>
      data.charts.byMethod.map((item) => ({
        label: METHOD_LABEL[item.label] ?? item.label,
        value: item.value,
      })),
    [data.charts.byMethod],
  );

  const handleNewPayment = useCallback(() => {
    navigation.navigate('NewPayment');
  }, [navigation]);

  const handleViewAlerts = useCallback(() => {
    navigation.navigate('Main', { screen: 'Alerts' } as never);
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
          initials={data.user.initials}
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
              <Text variant="h1">{data.user.name.split(' ')[0]}</Text>
              <Text variant="bodySmall" color="textSecondary">
                Sua visão geral financeira em um só lugar.
              </Text>
            </Box>

            <Box flexDirection="row" flexWrap="wrap" gap="sm" mb="md">
              {statCards.map((stat) => (
                <Box key={stat.id} width="48.5%">
                  <StatCard stat={stat} />
                </Box>
              ))}
            </Box>

            {data.alert.id !== 'alert-ok' ? (
              <Box mb="md">
                <AlertBanner
                  title={data.alert.title}
                  description={data.alert.description}
                  onPressView={handleViewAlerts}
                />
              </Box>
            ) : (
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
            )}

            <Button
              title="Novo pagamento"
              onPress={handleNewPayment}
              fullWidth
              size="md"
            />

            <Box mt="md" flexDirection="row" gap="sm">
              <Box flex={1}>
                <SectionCard title="Pagamentos por mês" headerCenter>
                  {data.charts.last6Months.length === 0 ? (
                    <Text variant="caption" color="textSecondary">
                      Sem pagamentos registrados.
                    </Text>
                  ) : (
                    <LineChart
                      data={data.charts.last6Months}
                      formatter={(value) =>
                        value >= 1000
                          ? `R$${Math.round(value / 100) / 10}k`
                          : `R$${Math.round(value)}`
                      }
                    />
                  )}
                </SectionCard>
              </Box>
            </Box>

            <Box mt="md" flexDirection="row" gap="sm">
              <Box flex={1}>
                <SectionCard title="Distribuição por categoria">
                  {data.charts.byCategory.length === 0 ? (
                    <Text variant="caption" color="textSecondary">
                      Sem pagamentos para exibir.
                    </Text>
                  ) : (
                    <BarChart
                      data={data.charts.byCategory.slice(0, 5)}
                      formatter={(value) =>
                        value >= 1000
                          ? `R$${Math.round(value / 100) / 10}k`
                          : `R$${Math.round(value)}`
                      }
                    />
                  )}
                </SectionCard>
              </Box>
            </Box>

            <Box mt="md" flexDirection="row" gap="sm">
              <Box flex={1}>
                <SectionCard title="Forma de pagamento">
                  {methodChartData.length === 0 ? (
                    <Text variant="caption" color="textSecondary">
                      Sem pagamentos para exibir.
                    </Text>
                  ) : (
                    <DonutChart
                      data={methodChartData}
                      centerLabel="pagamentos"
                      centerValue={String(
                        methodChartData.reduce((s, d) => s + d.value, 0),
                      )}
                    />
                  )}
                </SectionCard>
              </Box>
            </Box>

            <Box mt="md" flexDirection="row" gap="sm">
              <Box flex={1}>
                <SectionCard title="Top grupos por gasto">
                  {data.charts.topGroups.length === 0 ? (
                    <Text variant="caption" color="textSecondary">
                      Sem pagamentos para exibir.
                    </Text>
                  ) : (
                    <HorizontalBarList
                      data={data.charts.topGroups}
                      formatter={(value) =>
                        value.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                          maximumFractionDigits: 0,
                        })
                      }
                    />
                  )}
                </SectionCard>
              </Box>
            </Box>

            <Box mt="md" mb="md">
              <SectionCard title="Insights rápidos">
                <Box flexDirection="row" flexWrap="wrap" gap="sm">
                  {data.insights.map((insight) => (
                    <Box
                      key={insight.id}
                      width="48.5%"
                      bg="background"
                      borderRadius="md"
                      p="md"
                      borderWidth={1}
                      borderColor="border"
                    >
                      <Text variant="captionStrong" color="textSecondary">
                        {insight.title.toUpperCase()}
                      </Text>
                      <Text variant="h3" mt="xxs" numberOfLines={1}>
                        {insight.value}
                      </Text>
                      {insight.meta ? (
                        <Text variant="caption" color="textSecondary">
                          {insight.meta}
                        </Text>
                      ) : null}
                    </Box>
                  ))}
                </Box>
              </SectionCard>
            </Box>

            <SectionCard title="Últimas transações" showViewAll>
              {data.transactions.length === 0 ? (
                <Text variant="caption" color="textSecondary">
                  Nenhuma transação registrada.
                </Text>
              ) : (
                data.transactions.map((transaction, index) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    showDivider={index > 0}
                  />
                ))
              )}
            </SectionCard>

            <SectionCard title="Próximos vencimentos" headerCenter>
              {data.upcoming.length === 0 ? (
                <Text variant="caption" color="textSecondary">
                  Nada previsto para os próximos dias.
                </Text>
              ) : (
                data.upcoming.map((item, index) => (
                  <Box key={item.id}>
                    {index > 0 && (
                      <Box height={1} bg="border" mb="sm" />
                    )}
                    <UpcomingItem upcoming={item} />
                  </Box>
                ))
              )}
            </SectionCard>

            <Box
              mt="sm"
              mb="md"
              bg="primaryLight"
              borderRadius="md"
              p="md"
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box flex={1}>
                <Text variant="captionStrong" color="primary">
                  RESUMO DO MÊS
                </Text>
                <Text variant="bodyStrong" color="primary">
                  {data.transactions.length} pagamentos •
                  {' '}
                  {formatCurrency(
                    data.charts.byCategory.reduce((sum, item) => sum + item.value, 0),
                  )}
                </Text>
                <Text variant="caption" color="textSecondary">
                  {data.charts.last6Months.at(-1)?.label ?? '—'} em diante
                </Text>
              </Box>
              <Pill label="Atualizado agora" tone="primary" />
            </Box>
          </Box>
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
}

export default DashboardScreen;
