import React, { useEffect, useState } from 'react';
import { Image, Pressable } from 'react-native';
import { Box, Text, useTheme } from '../../theme';
import { environment } from '../../config/environment';
import { useAuthStore } from '../../features/auth/stores/authStore';
import { useTranslation } from '../../hooks/useTranslation';
import { BellIcon, MenuIcon } from './icons';

export type TopBarSize = 'standard' | 'compact';

interface TopBarProps {
  initials: string;
  imageUrl?: string | null;
  notificationCount?: number;
  size?: TopBarSize;
  onOpenMenu?: () => void;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
}

export function TopBar({
  initials,
  imageUrl,
  notificationCount = 0,
  size = 'standard',
  onOpenMenu,
  onOpenNotifications,
  onOpenProfile,
}: TopBarProps) {
  const compact = size === 'compact';
  const theme = useTheme();
  const { t } = useTranslation();
  const authImageUrl = useAuthStore((state) => state.user?.imageUrl);
  const resolvedImageUrl = imageUrl ?? (authImageUrl
    ?`${environment.mediaUrl}/${authImageUrl}`
    : undefined);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [resolvedImageUrl]);

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
        accessibilityLabel={t('common.openMenu')}
        onPress={onOpenMenu}
        hitSlop={12}
        style={({ pressed }) => ({
          padding: 8,
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <MenuIcon color={theme.colors.text} />
      </Pressable>

      <Box flexDirection="row" alignItems="center" gap="sm">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.notifications')}
          onPress={onOpenNotifications}
          hitSlop={12}
          style={({ pressed }) => ({
            padding: 8,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Box position="relative">
            <BellIcon color={theme.colors.text} />
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
          accessibilityLabel={t('common.openProfile')}
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
            overflow="hidden"
          >
            {resolvedImageUrl && !imageFailed ? (
              <Image
                source={{ uri: resolvedImageUrl }}
                onError={() => setImageFailed(true)}
                resizeMode="cover"
                style={{
                  width: compact ? 40 : 44,
                  height: compact ? 40 : 44,
                  borderRadius: compact ? 20 : 22,
                }}
                accessible={false}
              />
            ) : (
              <Text variant="bodyStrong" color="white" style={{ fontSize: compact ? 14 : 16 }}>
                {initials}
              </Text>
            )}
          </Box>
        </Pressable>
      </Box>
    </Box>
  );
}