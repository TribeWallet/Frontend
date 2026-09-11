import React from 'react';
import { Pressable } from 'react-native';
import { Box, Text } from '../../theme';
import { BellIcon, MenuIcon } from './icons';

export type TopBarSize = 'standard' | 'compact';

interface TopBarProps {
  initials: string;
  notificationCount?: number;
  size?: TopBarSize;
  onOpenMenu?: () => void;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
}

export function TopBar({
  initials,
  notificationCount = 0,
  size = 'standard',
  onOpenMenu,
  onOpenNotifications,
  onOpenProfile,
}: TopBarProps) {
  const compact = size === 'compact';

  return (
    <Box
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      px="md"
      py="sm"
      bg="background"
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Abrir menu"
        onPress={onOpenMenu}
        hitSlop={12}
        style={({ pressed }) => ({
          padding: 8,
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <MenuIcon color="#1F2A33" />
      </Pressable>

      <Box flexDirection="row" alignItems="center" gap="sm">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Notificações"
          onPress={onOpenNotifications}
          hitSlop={12}
          style={({ pressed }) => ({
            padding: 8,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Box position="relative">
            <BellIcon color="#1F2A33" />
            {notificationCount > 0 && (
              <Box
                position="absolute"
                top={-2}
                right={-2}
                minWidth={18}
                height={18}
                borderRadius="full"
                bg="danger"
                alignItems="center"
                justifyContent="center"
                px="xxs"
              >
                <Text variant="caption" color="white" style={{ fontSize: 11, fontWeight: '700' }}>
                  {notificationCount}
                </Text>
              </Box>
            )}
          </Box>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Abrir perfil"
          onPress={onOpenProfile}
          hitSlop={10}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <Box
            width={compact ? 40 : 44}
            height={compact ? 40 : 44}
            borderRadius="full"
            bg="primary"
            alignItems="center"
            justifyContent="center"
          >
            <Text variant="bodyStrong" color="white" style={{ fontSize: compact ? 14 : 16 }}>
              {initials}
            </Text>
          </Box>
        </Pressable>
      </Box>
    </Box>
  );
}