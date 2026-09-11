import React, { useCallback } from 'react';
import { RegisterScreen as RegisterScreenBase } from './RegisterScreen';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../../../navigation/types';

export function RegisterScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return <RegisterScreenBase onLogin={handleBack} />;
}