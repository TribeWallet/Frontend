import React, { useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { NewPaymentModal } from '../components/NewPaymentModal/NewPaymentModal';
import { useAppCommitments } from '../../../contexts/AppContext';
import { useTranslation } from '../../../hooks/useTranslation';
import type { RootStackParamList } from '../../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'NewPayment'>;
type Route = RouteProp<RootStackParamList, 'NewPayment'>;

export function NewPaymentScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<Route>();
  const commitmentId = route.params?.commitmentId;
  const { refetchCommitments } = useAppCommitments();
  const { t } = useTranslation();

  const handleCreated = useCallback(() => {
    Alert.alert(t('newPayment.savedTitle'), t('newPayment.savedMsg'));
    refetchCommitments();
  }, [refetchCommitments]);

  return (
    <NewPaymentModal
      visible
      onClose={() => navigation.goBack()}
      onCreated={handleCreated}
      commitmentId={commitmentId}
    />
  );
}

export default NewPaymentScreen;
