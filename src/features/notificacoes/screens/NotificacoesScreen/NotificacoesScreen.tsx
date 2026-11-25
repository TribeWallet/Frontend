import React, { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '../../../../components/EmptyState';
import { ScreenHeader } from '../../../../components/ScreenHeader';
import { TopBar } from '../../../../components/TopBar';
import { NotificationItemView } from '../../components/NotificationItem/NotificationItem';
import { useNotifications } from '../../../../hooks/useNotifications';
import { Box, Text, PressableBox, useTheme } from '../../../../theme';
import { useTopBarActions } from '../../../../hooks/useTopBarActions';
import { useTranslation } from '../../../../hooks/useTranslation';
import { useUserStore } from '../../../usuario/stores/userStore';

type FilterKey = 'all' | 'unread' | 'pending';

export function NotificacoesScreen() {
  const { width } = useWindowDimensions();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  } = useNotifications();
  const profile = useUserStore((state) => state.profile);
  const topBar = useTopBarActions();
  const [filter, setFilter] = useState<FilterKey>('all');

  const isSmallPhone = width < 360;
  const theme = useTheme();
  const { t } = useTranslation();

  const FILTER_LABELS: Record<FilterKey, string> = {
    all: t('notifications.filterAll'),
    unread: t('notifications.unread'),
    pending: t('notifications.pending'),
  };

  // Sem push, a lista só é atualizada quando a pessoa abre a tela.
  useFocusEffect(
    useCallback(() => {
      refreshNotifications();
    }, [refreshNotifications]),
  );

  const filtered = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((n) => !n.read);
    }
    if (filter === 'pending') {
      return notifications.filter((n) => n.type === 'pending_charge');
    }
    return notifications;
  }, [filter, notifications]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <Box flex={1} width="100%" maxWidth={430} alignSelf="center" bg="background">
        <TopBar
          initials={profile?.initials ?? ''}
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
              title={t('notifications.title')}
              subtitle={
                unreadCount > 0
                  ? t('notifications.unread', { count: unreadCount })
                  : t('notifications.allRead')
              }
            >
              <Box flexDirection="row" justifyContent="space-between" mb="sm">
                <PressableBox
                  onPress={markAllAsRead}
                  accessibilityRole="button"
                  hitSlop={4}
                >
                  <Text variant="bodySmallStrong" color="primary">
                    {t('notifications.markAllRead')}
                  </Text>
                </PressableBox>

                <PressableBox
                  onPress={topBar.openNotifications}
                  accessibilityRole="button"
                  hitSlop={4}
                >
                  <Text variant="bodySmallStrong" color="primary">
                    {t('notifications.configure')}
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
                title={t('notifications.noNotifications')}
                description={t('notifications.noNotificationsDesc')}
                actionLabel={t('notifications.refresh')}
                onAction={refreshNotifications}
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
