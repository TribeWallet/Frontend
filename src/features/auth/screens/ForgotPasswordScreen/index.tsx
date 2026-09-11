import React, { useCallback } from 'react';
import { ForgotPasswordScreen as ForgotPasswordScreenBase } from './ForgotPasswordScreen';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../../../navigation/types';

export function ForgotPasswordScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return <ForgotPasswordScreenBase onBackToLogin={handleBack} />;
}