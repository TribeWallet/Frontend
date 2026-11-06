import React, { useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { NewCommitmentModal } from '../components/NewCommitmentModal/NewCommitmentModal';
import type { RootStackParamList } from '../../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'NewCommitment'>;
type Route = RouteProp<RootStackParamList, 'NewCommitment'>;

export function NewCommitmentScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<Route>();
  const lockedGroupId = route.params?.groupId;

  const handleCreated = useCallback(() => {
    Alert.alert('Compromisso salvo', 'As alterações foram aplicadas.');
  }, []);

  return (
    <NewCommitmentModal
      visible
      lockedGroupId={lockedGroupId}
      onClose={() => navigation.goBack()}
      onCreated={handleCreated}
    />
  );
}

export default NewCommitmentScreen;
