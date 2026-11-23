import React, { useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { NewCommitmentModal } from '../components/NewCommitmentModal/NewCommitmentModal';
import { useAppCommitments } from '../../../contexts/AppContext';
import { useTranslation } from '../../../hooks/useTranslation';
import type { RootStackParamList } from '../../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'NewCommitment'>;
type Route = RouteProp<RootStackParamList, 'NewCommitment'>;

export function NewCommitmentScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<Route>();
  const lockedGroupId = route.params?.groupId;
  const { refetchCommitments } = useAppCommitments();
  const { t } = useTranslation();

  const handleCreated = useCallback(() => {
    Alert.alert(t('newCommitment.savedTitle'), t('newCommitment.savedMsg'));
    // Atualiza a lista de compromissos para o novo item aparecer na tela
    refetchCommitments();
  }, [refetchCommitments]);

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
