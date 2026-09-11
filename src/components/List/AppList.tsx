import React from 'react';
import { FlashList } from '@shopify/flash-list';
import { Box } from '../../theme';

interface ListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactElement | null;
  keyExtractor: (item: T, index: number) => string;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
  contentContainerStyle?: any;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function AppList<T>({
  data,
  renderItem,
  keyExtractor,
  ListHeaderComponent,
  ListEmptyComponent,
  contentContainerStyle,
  onRefresh,
  refreshing,
}: ListProps<T>) {
  return (
    <Box flex={1}>
      <FlashList
        data={data}
        renderItem={({ item, index }) => renderItem(item as T, index)}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent as any}
        ListEmptyComponent={ListEmptyComponent as any}
        contentContainerStyle={contentContainerStyle}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />
    </Box>
  );
}