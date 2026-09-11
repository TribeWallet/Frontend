import React from 'react';
import { Box, Text } from '../../../../theme';
import type { DashboardOverviewData } from '../../hooks/useDashboardOverview';

type DashboardUpcoming = DashboardOverviewData['upcoming'][number];

interface UpcomingItemProps {
  upcoming: DashboardUpcoming;
}

export function UpcomingItem({ upcoming }: UpcomingItemProps) {
  return (
    <Box
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      py="sm"
    >
      <Box flex={1} pr="md">
        <Text variant="bodyStrong" numberOfLines={1}>
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
          bg={upcoming.danger ? 'dangerLight' : 'primaryLight'}
        >
          <Text
            variant="caption"
            style={{
              color: upcoming.danger ? '#EF5067' : '#0071DF',
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