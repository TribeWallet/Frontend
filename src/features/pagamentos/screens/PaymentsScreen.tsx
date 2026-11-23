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
import { Box, Text, PressableBox, useTheme } from '../../../theme';
import {
  useAppCommitments,
  useAppGroups,
  useAppPayments,
} from '../../../contexts/AppContext';
import { useTopBarActions } from '../../../hooks/useTopBarActions';
import { useTranslation } from '../../../hooks/useTranslation';
import { useUserStore } from '../../usuario/stores/userStore';
import { MoneyValue } from '../../../components/MoneyValue';
import { paymentMethodLabels } from '../types/Payment';
import type { Payment, PaymentMethod } from '../types/Payment';

type Filter = 'all' | 'paid' | 'partial';

export function PaymentsScreen() {
  const topBar = useTopBarActions();
  const { width } = useWindowDimensions();
  const profile = useUserStore((state) => state.profile);
  const { payments } = useAppPayments();
  const { groups } = useAppGroups();
  const { commitmentsLoading, commitmentsError, refetchCommitments } = useAppCommitments();
  const { t } = useTranslation();

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: t('common.all') },
    { key: 'paid', label: t('common.paid') },
    { key: 'partial', label: t('common.partial') },
  ];

  const [filter, setFilter] = useState<Filter>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [creating, setCreating] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

  const isSmallPhone = width < 360;
  const theme = useTheme();

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
      { id: 'all', label: t('common.allGroups') },
      ...groups.map((group) => ({ id: group.id, label: group.name })),
    ],
    [groups],
  );

  const methodOptions = useMemo<SelectOption[]>(() => {
    const used = Array.from(new Set(payments.map((payment) => payment.method)));
    return [
      { id: 'all', label: t('payments.filterAll') },
      ...used.map((method) => ({
        id: method,
        label: t(paymentMethodLabels[method as PaymentMethod]),
      })),
    ];
  }, [payments]);

  const total = useMemo(
    () => filtered.reduce((sum, payment) => sum + payment.amount, 0),
    [filtered],
  );

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
            <ScreenHeader
              title={t('payments.title')}
              subtitle={t('payments.subtitle')}
            >
              <Button
                title={t('payments.newPayment')}
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
                <Text variant="captionStrong" color="primary">{t('payments.filtered')}</Text>
                <MoneyValue amount={total} variant="h2" />
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
              label={t('reports.filterGroup')}
              placeholder={t('common.allGroups')}
              value={groupFilter}
              onChange={setGroupFilter}
              options={groupOptions}
            />

            <Select
              label={t('payments.paymentMethod')}
              placeholder={t('payments.allMethods')}
              value={methodFilter}
              onChange={setMethodFilter}
              options={methodOptions}
            />

            {commitmentsLoading ? (
              <Loading label={t('payments.loading')} />
            ) : commitmentsError ? (
              <EmptyState
                title={t('payments.errorTitle')}
                description={commitmentsError}
                actionLabel={t('payments.tryAgain')}
                onAction={refetchCommitments}
              />
            ) : filtered.length === 0 ? (
              <EmptyState
                title={t('payments.noPayments')}
                description={t('payments.noPaymentsDesc')}
                actionLabel={t('payments.newPayment')}
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
      <NewPaymentModal
        visible={creating}
        onClose={() => setCreating(false)}
        onCreated={() => {
          refetchCommitments();
          setCreating(false);
        }}
      />
      <EditPaymentModal
        visible={editingPayment !== null}
        payment={editingPayment}
        onClose={() => setEditingPayment(null)}
        onSaved={() => refetchCommitments()}
      />
    </SafeAreaView>
  );
}

export default PaymentsScreen;
