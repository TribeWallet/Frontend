import React, { useCallback, useState } from 'react';
import { Switch } from 'react-native';
import { Modal } from '../../../../components/Modal';
import { Button } from '../../../../components/Button';
import { Box, Text, PressableBox, useTheme } from '../../../../theme';
import { useTranslation } from '../../../../hooks/useTranslation';
import { NotificationItemView } from '../NotificationItem/NotificationItem';
import type { NotificationItem } from '../../types/Notification';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  unreadCount: number;
  onMarkAllRead?: () => void;
  onMarkRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  settings: NotificationSettings;
  onConfigureChange?: (settings: NotificationSettings) => void;
}

export interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  overdueAlerts: boolean;
  weeklyDigest: boolean;
}

type FilterKey = 'all' | 'unread' | 'pending';

export function NotificationsModal({
  visible,
  onClose,
  notifications,
  unreadCount,
  onMarkAllRead,
  onMarkRead,
  onDelete,
  settings,
  onConfigureChange,
}: NotificationsModalProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  const FILTER_LABELS: Record<FilterKey, string> = {
    all: t('notifications.all'),
    unread: t('notifications.unread'),
    pending: t('notifications.pending'),
  };

  const SETTINGS_LABELS: Record<keyof NotificationSettings, string> = {
    pushEnabled: t('settings.pushNotifications'),
    emailEnabled: t('settings.emailNotifications'),
    overdueAlerts: t('settings.overdueAlerts'),
    weeklyDigest: t('settings.weeklyDigest'),
  };

  const [filter, setFilter] = useState<FilterKey>('all');

  const filtered = (() => {
    if (filter === 'unread') {
      return notifications.filter((n) => !n.read);
    }
    if (filter === 'pending') {
      return notifications.filter((n) => n.type === 'pending_charge');
    }
    return notifications;
  })();

  const handleToggle = useCallback(
    (key: keyof NotificationSettings) => {
      onConfigureChange?.({ ...settings, [key]: !settings[key] });
    },
    [settings, onConfigureChange],
  );

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={t('notificationsModal.title')}
      subtitle={unreadCount > 0 ? t('notificationsModal.subtitleUnread', { count: unreadCount }) : t('notificationsModal.subtitleAllRead')}
      showCloseButton
      variant="bottom"
      footer={
        <Button title={t('notificationsModal.close')} onPress={onClose} variant="outline" fullWidth />
      }
    >
      <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="sm">
        <PressableBox onPress={onMarkAllRead} accessibilityRole="button">
          <Text variant="bodySmallStrong" color="primary">
            {t('notifications.markAllRead')}
          </Text>
        </PressableBox>
        <Box flexDirection="row" alignItems="center" gap="xs">
          <Box
            minWidth={22}
            height={22}
            borderRadius="full"
            bg="primary"
            alignItems="center"
            justifyContent="center"
            px="xxs"
          >
            <Text variant="caption" color="white" style={{ fontSize: 11, fontWeight: '700' }}>
              {unreadCount}
            </Text>
          </Box>
          <Text variant="caption" color="textSecondary">
            {t('notifications.unreadLabel')}
          </Text>
        </Box>
      </Box>

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

      {/* Sem ScrollView próprio: o Modal já rola o conteúdo, e rolagem aninhada trava no Android. */}
      <Box pb="sm">
        {filtered.length === 0 ? (
          <Box py="lg" alignItems="center">
            <Text variant="body" color="textSecondary">
              {t('notifications.noNotificationsFilter')}
            </Text>
          </Box>
        ) : (
          filtered.map((item) => (
            <NotificationItemView
              key={item.id}
              item={item}
              onCheck={onMarkRead}
              onDelete={onDelete}
            />
          ))
        )}
      </Box>

      <Box mt="md" pt="md" borderTopWidth={1} borderColor="border">
        <Text variant="bodyStrong" mb="sm">{t('settings.title')}</Text>
        {(Object.keys(SETTINGS_LABELS) as (keyof NotificationSettings)[]).map((key) => (
          <Box
            key={key}
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            py="xs"
          >
            <Text variant="body" color="text">{SETTINGS_LABELS[key]}</Text>
            <Switch
              value={settings[key]}
              onValueChange={() => handleToggle(key)}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.white}
            />
          </Box>
        ))}
      </Box>
    </Modal>
  );
}
