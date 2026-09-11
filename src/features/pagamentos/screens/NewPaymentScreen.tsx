import React, { useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { NewPaymentModal } from '../components/NewPaymentModal/NewPaymentModal';
import type { RootStackParamList } from '../../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'NewPayment'>;
type Route = RouteProp<RootStackParamList, 'NewPayment'>;

export function NewPaymentScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<Route>();
  const commitmentId = route.params?.commitmentId;

  const handleCreated = useCallback(() => {
    Alert.alert('Pagamento salvo', 'As alterações foram aplicadas.');
  }, []);

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
