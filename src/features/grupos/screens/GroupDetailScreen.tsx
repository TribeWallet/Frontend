import React, { useMemo } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';

import { GroupDetailModal } from '../components/GroupDetailModal/GroupDetailModal';
import { useAppGroups } from '../../../contexts/AppContext';
import { getGrupo, toGroup } from '../services/grupoService';
import type { RootStackParamList } from '../../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'GroupDetail'>;
type GroupDetailRoute = RouteProp<RootStackParamList, 'GroupDetail'>;

export function GroupDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<GroupDetailRoute>();
  const { getGroup } = useAppGroups();

  const cached = getGroup(route.params.id);

  const detailQuery = useQuery({
    queryKey: ['grupo', route.params.id],
    queryFn: async () => toGroup(await getGrupo(route.params.id)),
    enabled: !cached,
  });

  const group = cached ?? detailQuery.data;

  return (
    <GroupDetailModal visible group={group} onClose={() => navigation.goBack()} />
  );
}

export default GroupDetailScreen;
