import React, { useMemo, useState } from 'react';
import { ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TopBar } from '../../../components/TopBar';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { EmptyState } from '../../../components/EmptyState';
import { Loading } from '../../../components/Loading';
import { Select, SelectOption } from '../../../components/Select';
import { Button } from '../../../components/Button';
import { PaymentCard } from '../components/PaymentCard/PaymentCard';
import { NewPaymentModal } from '../components/NewPaymentModal/NewPaymentModal';
import { EditPaymentModal } from '../components/EditPaymentModal/EditPaymentModal';
import { Box, Text, PressableBox } from '../../../theme';
import {
  useAppCommitments,
  useAppGroups,
  useAppPayments,
} from '../../../contexts/AppContext';
import { useTopBarActions } from '../../../hooks/useTopBarActions';
import { useUserStore } from '../../usuario/stores/userStore';
import { formatCurrency } from '../../../utils/currency';
import { paymentMethodLabels } from '../types/Payment';
import type { Payment, PaymentMethod } from '../types/Payment';

type Filter = 'all' | 'paid' | 'partial';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'paid', label: 'Fatias quitadas' },
  { key: 'partial', label: 'Fatias parciais' },
];

export function PaymentsScreen() {
  const topBar = useTopBarActions();
  const { width } = useWindowDimensions();
  const profile = useUserStore((state) => state.profile);
  const { payments } = useAppPayments();
  const { groups } = useAppGroups();
  const { commitmentsLoading, commitmentsError, refetchCommitments } = useAppCommitments();

  const [filter, setFilter] = useState<Filter>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [creating, setCreating] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

  const isSmallPhone = width < 360;

  const filtered = useMemo(
    () =>
      payments.filter((payment) => {
        if (filter !== 'all' && payment.status !== filter) return false;
        if (groupFilter !== 'all' && payment.groupId !== groupFilter) return false;
        if (methodFilter !== 'all' && payment.method !== methodFilter) return false;
        return true;
      }),
    [payments, filter, groupFilter, methodFilter],
  );

  const groupOptions = useMemo<SelectOption[]>(
    () => [
      { id: 'all', label: 'Todos os grupos' },
      ...groups.map((group) => ({ id: group.id, label: group.name })),
    ],
    [groups],
  );

  const methodOptions = useMemo<SelectOption[]>(() => {
    const used = Array.from(new Set(payments.map((payment) => payment.method)));
    return [
      { id: 'all', label: 'Todas as formas' },
      ...used.map((method) => ({
        id: method,
        label: paymentMethodLabels[method as PaymentMethod],
      })),
    ];
  }, [payments]);

  const total = useMemo(
    () => filtered.reduce((sum, payment) => sum + payment.amount, 0),
    [filtered],
  );

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
            <ScreenHeader
              title="Pagamentos"
              subtitle="Registre, edite e exclua pagamentos"
            >
              <Button
                title="Novo pagamento"
                onPress={() => setCreating(true)}
                fullWidth
              />
            </ScreenHeader>

            <Box
              bg="primaryLight"
              borderRadius="md"
              p="md"
              mb="md"
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Text variant="captionStrong" color="primary">FILTRADO</Text>
                <Text variant="h2" color="primary">{formatCurrency(total)}</Text>
                <Text variant="caption" color="textSecondary">
                  {filtered.length} pagamento{filtered.length === 1 ? '' : 's'}
                </Text>
              </Box>
            </Box>

            <Box flexDirection="row" gap="xs" mb="sm" flexWrap="wrap">
              {FILTERS.map((option) => {
                const active = option.key === filter;
                return (
                  <PressableBox
                    key={option.key}
                    onPress={() => setFilter(option.key)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <Box
                      px="md"
                      py="xs"
                      borderRadius="full"
                      bg={active ? 'primary' : 'surface'}
                      borderWidth={1}
                      borderColor={active ? 'primary' : 'border'}
                    >
                      <Text variant="captionStrong" color={active ? 'white' : 'textSecondary'}>
                        {option.label}
                      </Text>
                    </Box>
                  </PressableBox>
                );
              })}
            </Box>

            <Select
              label="Filtrar por grupo"
              placeholder="Todos os grupos"
              value={groupFilter}
              onChange={setGroupFilter}
              options={groupOptions}
            />

            <Select
              label="Forma de pagamento"
              placeholder="Todas as formas"
              value={methodFilter}
              onChange={setMethodFilter}
              options={methodOptions}
            />

            {commitmentsLoading ? (
              <Loading label="Carregando pagamentos..." />
            ) : commitmentsError ? (
              <EmptyState
                title="Não foi possível carregar os pagamentos"
                description={commitmentsError}
                actionLabel="Tentar novamente"
                onAction={refetchCommitments}
              />
            ) : filtered.length === 0 ? (
              <EmptyState
                title="Sem pagamentos"
                description="Use o botão acima para registrar o primeiro pagamento."
                actionLabel="Novo pagamento"
                onAction={() => setCreating(true)}
              />
            ) : (
              filtered.map((payment) => (
                <PaymentCard
                  key={payment.id}
                  payment={payment}
                  onPress={(id) =>
                    setEditingPayment(payments.find((item) => item.id === id) ?? null)
                  }
                />
              ))
            )}
          </Box>
        </ScrollView>
      </Box>
      <NewPaymentModal visible={creating} onClose={() => setCreating(false)} />
      <EditPaymentModal
        visible={editingPayment !== null}
        payment={editingPayment}
        onClose={() => setEditingPayment(null)}
      />
    </SafeAreaView>
  );
}

export default PaymentsScreen;
