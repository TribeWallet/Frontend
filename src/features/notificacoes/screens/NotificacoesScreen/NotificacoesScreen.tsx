import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '../../../../components/EmptyState';
import { ScreenHeader } from '../../../../components/ScreenHeader';
import { TopBar } from '../../../../components/TopBar';
import { Button } from '../../../../components/Button';
import { NotificationItemView } from '../../components/NotificationItem/NotificationItem';
import { useNotifications } from '../../../../hooks/useNotifications';
import { Box, Text, PressableBox } from '../../../../theme';
import { useTopBarActions } from '../../../../hooks/useTopBarActions';
import { useUserStore } from '../../../usuario/stores/userStore';
import { useAppCommitments, useAppPayments } from '../../../../contexts/AppContext';

type FilterKey = 'all' | 'unread' | 'pending';

const FILTER_LABELS: Record<FilterKey, string> = {
  all: 'Todas',
  unread: 'Não lidas',
  pending: 'Pendentes',
};

export function NotificacoesScreen() {
  const { width } = useWindowDimensions();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshDueNotifications,
  } = useNotifications();
  const profile = useUserStore((state) => state.profile);
  const topBar = useTopBarActions();
  const { commitments } = useAppCommitments();
  const { payments } = useAppPayments();
  const [filter, setFilter] = useState<FilterKey>('all');

  const isSmallPhone = width < 360;

  useEffect(() => {
    refreshDueNotifications();
  }, [commitments, payments, refreshDueNotifications]);

  const filtered = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((n) => n.status !== 'paid');
    }
    if (filter === 'pending') {
      return notifications.filter((n) => n.status === 'pending');
    }
    return notifications;
  }, [filter, notifications]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFB' }} edges={['top']}>
      <Box flex={1} width="100%" maxWidth={430} alignSelf="center" bg="background">
        <TopBar
          initials={profile?.initials ?? 'G'}
          notificationCount={unreadCount}
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
              title="Notificações"
              subtitle={
                unreadCount > 0
                  ? `Você tem ${unreadCount} notificações não lidas`
                  : 'Você está em dia com tudo'
              }
            >
              <Box flexDirection="row" justifyContent="space-between" mb="sm">
                <PressableBox
                  onPress={markAllAsRead}
                  accessibilityRole="button"
                  hitSlop={4}
                >
                  <Text variant="bodySmallStrong" color="primary">
                    Marcar todas como lidas
                  </Text>
                </PressableBox>

                <PressableBox
                  onPress={topBar.openNotifications}
                  accessibilityRole="button"
                  hitSlop={4}
                >
                  <Text variant="bodySmallStrong" color="primary">
                    Configurar
                  </Text>
                </PressableBox>
              </Box>
            </ScreenHeader>

            <Box flexDirection="row" gap="xs" mb="md" flexWrap="wrap">
              {(['all', 'unread', 'pending'] as FilterKey[]).map((key) => {
                const active = filter === key;
                return (
                  <PressableBox
                    key={key}
                    onPress={() => setFilter(key)}
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
                        {FILTER_LABELS[key]}
                      </Text>
                    </Box>
                  </PressableBox>
                );
              })}
            </Box>

            {filtered.length === 0 ? (
              <EmptyState
                title="Nenhuma notificação"
                description="Você está em dia com tudo."
                actionLabel="Atualizar"
                onAction={refreshDueNotifications}
              />
            ) : (
              filtered.map((item) => (
                <NotificationItemView
                  key={item.id}
                  item={item}
                  onCheck={markAsRead}
                  onDelete={deleteNotification}
                />
              ))
            )}
          </Box>
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
}

export default NotificacoesScreen;
