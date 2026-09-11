import React from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { GroupDetailModal } from '../components/GroupDetailModal/GroupDetailModal';
import { useAppGroups } from '../../../contexts/AppContext';
import type { RootStackParamList } from '../../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'GroupDetail'>;
type GroupDetailRoute = RouteProp<RootStackParamList, 'GroupDetail'>;

export function GroupDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<GroupDetailRoute>();
  const { getGroup } = useAppGroups();

  const group = getGroup(route.params.id);

  return (
    <GroupDetailModal
      visible
      group={group}
      onClose={() => navigation.goBack()}
    />
  );
}

export default GroupDetailScreen;
