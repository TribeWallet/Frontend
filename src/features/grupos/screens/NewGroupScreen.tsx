import React, { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { NewGroupModal } from '../components/NewGroupModal/NewGroupModal';
import { useAppGroups } from '../../../contexts/AppContext';
import { useTranslation } from '../../../hooks/useTranslation';
import type { RootStackParamList } from '../../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'NewGroup'>;
type GroupRoute = RouteProp<RootStackParamList, 'NewGroup'>;

export function NewGroupScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<GroupRoute>();
  const { getGroup, refetchGroups } = useAppGroups();
  const { t } = useTranslation();
  const group = route.params?.id ? getGroup(route.params.id) : undefined;

  const handleCreated = useCallback(() => {
    Alert.alert(t('newGroup.groupSavedTitle'), t('newGroup.savedMsg'));
    refetchGroups();
  }, [refetchGroups]);

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
