import React, { useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { NewCommitmentModal } from '../components/NewCommitmentModal/NewCommitmentModal';
import type { RootStackParamList } from '../../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'NewCommitment'>;

export function NewCommitmentScreen() {
  const navigation = useNavigation<NavigationProp>();

  const handleCreated = useCallback(() => {
    Alert.alert('Compromisso salvo', 'As alterações foram aplicadas.');
  }, []);

  return (
    <NewCommitmentModal
      visible
      onClose={() => navigation.goBack()}
      onCreated={handleCreated}
    />
  );
}

export default NewCommitmentScreen;
