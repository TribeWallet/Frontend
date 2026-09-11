import React, { useCallback } from 'react';
import { LoginScreen as LoginScreenBase } from './LoginScreen';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../../../navigation/types';

export function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const handleCreateAccount = useCallback(() => {
    navigation.navigate('Cadastro');
  }, [navigation]);

  const handleForgot = useCallback(() => {
    navigation.navigate('ForgotPassword');
  }, [navigation]);

  const handleLogin = useCallback(() => {
    // Login is handled inside LoginScreenBase, just notify navigation
  }, []);

  return (
    <LoginScreenBase
      onCreateAccount={handleCreateAccount}
      onForgotPassword={handleForgot}
      onLogin={handleLogin}
    />
  );
}