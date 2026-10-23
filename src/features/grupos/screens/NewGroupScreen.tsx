import React, { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { NewGroupModal } from '../components/NewGroupModal/NewGroupModal';
import { useAppGroups } from '../../../contexts/AppContext';
import type { RootStackParamList } from '../../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'NewGroup'>;
type GroupRoute = RouteProp<RootStackParamList, 'NewGroup'>;

export function NewGroupScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<GroupRoute>();
  const { getGroup } = useAppGroups();
  const group = route.params?.id ? getGroup(route.params.id) : undefined;

  const handleCreated = useCallback(() => {
    Alert.alert('Grupo salvo', 'As alterações foram aplicadas.');
  }, []);

  return (
    <NewGroupModal
      visible
      group={group}
      onClose={() => navigation.goBack()}
      onCreated={handleCreated}
    />
  );
}

export default NewGroupScreen;
