import React from 'react';
import { Box, Text } from '../../../../theme';
import { CommitmentAvatar } from '../CommitmentAvatar/CommitmentAvatar';

interface DashboardUpcoming {
  id: string;
  imageUrl: string | null;
  initials: string;
  name: string;
  group: string;
  value: string;
  date: string;
  daysToDue: number;
}

interface UpcomingItemProps {
  upcoming: DashboardUpcoming;
}

export function UpcomingItem({ upcoming }: UpcomingItemProps) {
  const soon = upcoming.daysToDue < 7;

  return (
    <Box
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      py="sm"
    >
      <CommitmentAvatar imageUrl={upcoming.imageUrl} initials={upcoming.initials} />
      <Box flex={1} px="md">
        <Text variant="h3" numberOfLines={1}>
          {upcoming.name}
        </Text>
        <Text variant="caption" color="textSecondary" numberOfLines={1} mt="xxs">
          {upcoming.group}
        </Text>
      </Box>

      <Box alignItems="flex-end">
        <Text variant="bodyStrong">{upcoming.value}</Text>
        <Box
          mt="xxs"
          px="sm"
          py="xxs"
          borderRadius="full"
          bg={soon ? 'warningLight' : 'primaryLight'}
        >
          <Text
            variant="caption"
            style={{
              color: soon ? '#E8A924' : '#0071DF',
              fontWeight: '600',
            }}
          >
            {upcoming.date}
          </Text>
        </Box>
      </Box>
    </Box>
  );
}