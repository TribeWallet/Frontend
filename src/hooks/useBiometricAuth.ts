import { useState, useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import { Alert } from 'react-native';

export type BiometricType = 'fingerprint' | 'facial' | 'unknown' | null;

export function useBiometricAuth() {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [biometricType, setBiometricType] = useState<BiometricType>(null);

  const checkSupport = useCallback(async () => {
    if (Platform.OS === 'web') {
      setSupported(false);
      setBiometricType(null);
      return false;
    }

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const isSupported = hasHardware && isEnrolled;
      setSupported(isSupported);

      if (isSupported) {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('facial');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('fingerprint');
        } else {
          setBiometricType('unknown');
        }
      } else {
        setBiometricType(null);
      }

      return isSupported;
    } catch {
      setSupported(false);
      setBiometricType(null);
      return false;
    }
  }, []);

  const authenticate = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web') return true;

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autentique para acessar o Tribe Wallet',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: true,
      });

      if (result.success) {
        return true;
      }

      Alert.alert('Autenticação', 'Não foi possível autenticar biometricamente.');
      return false;
    } catch {
      Alert.alert('Autenticação', 'Erro ao tentar autenticar biometricamente.');
      return false;
    }
  }, []);

  return {
    supported: supported ?? false,
    checking: supported === null,
    biometricType,
    checkSupport,
    authenticate,
  };
}
