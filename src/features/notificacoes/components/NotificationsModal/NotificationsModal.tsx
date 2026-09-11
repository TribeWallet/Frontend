import React, { useCallback, useState } from 'react';
import { ScrollView, Switch } from 'react-native';
import { Modal } from '../../../../components/Modal';
import { Button } from '../../../../components/Button';
import { Box, Text, PressableBox } from '../../../../theme';
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
  onConfigureChange?: (settings: NotificationSettings) => void;
}

export interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  overdueAlerts: boolean;
  weeklyDigest: boolean;
}

type FilterKey = 'all' | 'unread' | 'pending';

const FILTER_LABELS: Record<FilterKey, string> = {
  all: 'Todas',
  unread: 'Não lidas',
  pending: 'Pendentes',
};

const SETTINGS_LABELS: Record<keyof NotificationSettings, string> = {
  pushEnabled: 'Notificações push',
  emailEnabled: 'Notificações por e-mail',
  overdueAlerts: 'Alertas de vencimento',
  weeklyDigest: 'Resumo semanal',
};

const DEFAULT_SETTINGS: NotificationSettings = {
  pushEnabled: true,
  emailEnabled: false,
  overdueAlerts: true,
  weeklyDigest: false,
};

export function NotificationsModal({
  visible,
  onClose,
  notifications,
  unreadCount,
  onMarkAllRead,
  onMarkRead,
  onDelete,
  onConfigureChange,
}: NotificationsModalProps) {
  const [filter, setFilter] = useState<FilterKey>('all');
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);

  const filtered = (() => {
    if (filter === 'unread') {
      return notifications.filter((n) => n.status !== 'paid');
    }
    if (filter === 'pending') {
      return notifications.filter((n) => n.status === 'pending');
    }
    return notifications;
  })();

  const handleToggle = useCallback(
    (key: keyof NotificationSettings) => {
      setSettings((prev) => {
        const next = { ...prev, [key]: !prev[key] };
        onConfigureChange?.(next);
        return next;
      });
    },
    [onConfigureChange],
  );

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Notificações"
      subtitle={`${unreadCount} não lidas`}
      showCloseButton
      variant="bottom"
      footer={
        <Button title="Fechar" onPress={onClose} variant="outline" fullWidth />
      }
    >
      <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="sm">
        <PressableBox onPress={onMarkAllRead} accessibilityRole="button">
          <Text variant="bodySmallStrong" color="primary">
            Marcar todas como lidas
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
          <Text variant="caption" color="textSecondary">não lidas</Text>
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

      <ScrollView
        style={{ maxHeight: 320 }}
        contentContainerStyle={{ paddingBottom: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <Box py="lg" alignItems="center">
            <Text variant="body" color="textSecondary">Nenhuma notificação neste filtro.</Text>
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
      </ScrollView>

      <Box mt="md" pt="md" borderTopWidth={1} borderColor="border">
        <Text variant="bodyStrong" mb="sm">Configurações</Text>
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
              trackColor={{ false: '#DFE4E7', true: '#0071DF' }}
              thumbColor="#FFFFFF"
            />
          </Box>
        ))}
      </Box>
    </Modal>
  );
}
