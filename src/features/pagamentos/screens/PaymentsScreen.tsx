import React, { useMemo, useState } from 'react';
import { ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TopBar } from '../../../components/TopBar';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { EmptyState } from '../../../components/EmptyState';
import { Select, SelectOption } from '../../../components/Select';
import { Button } from '../../../components/Button';
import { PaymentCard } from '../components/PaymentCard/PaymentCard';
import { NewPaymentModal } from '../components/NewPaymentModal/NewPaymentModal';
import { EditPaymentModal } from '../components/EditPaymentModal/EditPaymentModal';
import { Box, Text, PressableBox } from '../../../theme';
import {
  useAppGroups,
  useAppPayments,
} from '../../../contexts/AppContext';
import { useTopBarActions } from '../../../hooks/useTopBarActions';
import { useUserStore } from '../../usuario/stores/userStore';
import { formatCurrency } from '../../../utils/currency';
import type { Payment } from '../types/Payment';

type Filter = 'all' | 'paid' | 'partial' | 'pending';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'paid', label: 'Pagos' },
  { key: 'partial', label: 'Parciais' },
  { key: 'pending', label: 'Pendentes' },
];

export function PaymentsScreen() {
  const topBar = useTopBarActions();
  const { width } = useWindowDimensions();
  const profile = useUserStore((state) => state.profile);
  const { payments } = useAppPayments();
  const { groups } = useAppGroups();

  const [filter, setFilter] = useState<Filter>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [creating, setCreating] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

  const isSmallPhone = width < 360;

  const filtered = useMemo(() => {
    return payments.filter((payment) => {
      if (filter !== 'all' && payment.status !== filter) return false;
      if (groupFilter !== 'all' && payment.groupId !== groupFilter) return false;
      return true;
    });
  }, [payments, filter, groupFilter]);

  const groupOptions = useMemo<SelectOption[]>(
    () => [
      { id: 'all', label: 'Todos os grupos' },
      ...groups.map((group) => ({ id: group.id, label: group.name })),
    ],
    [groups],
  );

  const total = useMemo(
    () => filtered.reduce((sum, payment) => sum + payment.amount, 0),
    [filtered],
  );

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

            {filtered.length === 0 ? (
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
                  onPress={(id) => {
                    const next = payments.find((p) => p.id === id) ?? null;
                    setEditingPayment(next);
                  }}
                />
              ))
            )}
          </Box>
        </ScrollView>
      </Box>
      <NewPaymentModal
        visible={creating}
        onClose={() => setCreating(false)}
      />
      <EditPaymentModal
        visible={editingPayment !== null}
        payment={editingPayment}
        onClose={() => setEditingPayment(null)}
      />
    </SafeAreaView>
  );
}

export default PaymentsScreen;
