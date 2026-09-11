import React from 'react';
import { Pressable } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Box, Text } from '../../../../theme';
import type { NotificationItem } from '../../types/Notification';

interface NotificationItemProps {
  item: NotificationItem;
  onPress?: (id: string) => void;
  onCheck?: (id: string) => void;
  onDelete?: (id: string) => void;
}

function BellIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18.3 9.5c0-3.44-2.05-5.78-5.3-6.16V2.5a1 1 0 1 0-2 0v.84C7.75 3.72 5.7 6.06 5.7 9.5c0 4.02-1.57 4.77-2.1 5.72-.37.66.1 1.49.87 1.49h15.06c.77 0 1.24-.83.87-1.49-.53-.95-2.1-1.7-2.1-5.72Z"
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <Path
        d="M9.5 19c.42 1.03 1.22 1.55 2.4 1.55s1.98-.52 2.4-1.55"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function CheckIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="m4 12.5 5 5L20 6.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function TrashIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 7h14M10 7V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function NotificationItemView({
  item,
  onCheck,
  onDelete,
}: NotificationItemProps) {
  const isOverdue = item.type === 'overdue_commitment';

  return (
    <Box
      flexDirection="row"
      bg="surface"
      borderRadius="md"
      borderWidth={1}
      borderColor="cardBorder"
      p="md"
      mb="sm"
    >
      <Box
        width={40}
        height={40}
        borderRadius="full"
        bg={isOverdue ? 'dangerLight' : 'primaryLight'}
        alignItems="center"
        justifyContent="center"
        mr="sm"
      >
        <BellIcon color={isOverdue ? '#EF5067' : '#0071DF'} />
      </Box>

      <Box flex={1}>
        <Box flexDirection="row" alignItems="center" justifyContent="space-between">
          <Text variant="bodyStrong" numberOfLines={1} flex={1} mr="xs">
            {item.title}
          </Text>
          <Text variant="caption" color="textMuted">{item.time}</Text>
        </Box>

        <Text variant="caption" color="textSecondary" numberOfLines={2} mt="xxs">
          {item.description}
        </Text>

        <Box mt="xs">
          <Text variant="caption" color="textSecondary">{item.group}</Text>
        </Box>

        <Box flexDirection="row" gap="xs" mt="sm">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Marcar como lida"
            onPress={() => onCheck?.(item.id)}
            hitSlop={4}
          >
            {({ pressed }) => (
              <Box
                width={32}
                height={32}
                borderRadius="full"
                bg="successLight"
                alignItems="center"
                justifyContent="center"
                opacity={pressed ? 0.6 : 1}
              >
                <CheckIcon color="#16AF7E" />
              </Box>
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Excluir notificação"
            onPress={() => onDelete?.(item.id)}
            hitSlop={4}
          >
            {({ pressed }) => (
              <Box
                width={32}
                height={32}
                borderRadius="full"
                bg="border"
                alignItems="center"
                justifyContent="center"
                opacity={pressed ? 0.6 : 1}
              >
                <TrashIcon color="#5D666D" />
              </Box>
            )}
          </Pressable>
        </Box>
      </Box>
    </Box>
  );
}