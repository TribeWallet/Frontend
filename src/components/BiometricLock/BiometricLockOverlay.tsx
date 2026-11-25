import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Box, Text, useTheme } from '../../theme';
import { useTranslation } from '../../hooks/useTranslation';
import { useBiometricAuth } from '../../hooks/useBiometricAuth';
import { usePreferencesStore } from '../../features/configuracoes/stores/preferencesStore';

interface BiometricLockOverlayProps {
  visible: boolean;
  onUnlocked: () => void;
}

export function BiometricLockOverlay({
  visible,
  onUnlocked,
}: BiometricLockOverlayProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { supported, authenticate, biometricType, checkSupport } =
    useBiometricAuth();
  const biometricLock = usePreferencesStore((state) => state.biometricLock);
  const [authenticating, setAuthenticating] = useState(false);

  const typeLabel = useCallback(() => {
    if (biometricType === 'facial') return t('biometric.facial');
    if (biometricType === 'fingerprint') return t('biometric.fingerprint');
    return t('biometric.generic');
  }, [biometricType, t]);

  useEffect(() => {
    if (visible && biometricLock) {
      checkSupport();
    }
  }, [visible, biometricLock, checkSupport]);

  const handleAuth = async () => {
    setAuthenticating(true);
    const ok = await authenticate();
    setAuthenticating(false);
    if (ok) {
      onUnlocked();
    }
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={() => {}}
      animationType="none"
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.center}>
          <View style={styles.card}>
            {authenticating ? (
              <ActivityIndicator
                size="large"
                color={theme.colors.primary}
                style={{ marginBottom: 16 }}
              />
            ) : null}

            <Text variant="h2" color="text" textAlign="center" mb="xs">
              {t('biometric.title')}
            </Text>

            <Text variant="bodySmall" color="textSecondary" textAlign="center" mb="md">
              {t('biometric.subtitle', { type: typeLabel() })}
            </Text>

            {supported ? (
              <Box
                bg="primary"
                borderRadius="md"
                p="md"
                alignItems="center"
                justifyContent="center"
                minHeight={56}
                style={{ opacity: authenticating ? 0.7 : 1 }}
                pointerEvents={authenticating ? 'none' : 'auto'}
              >
                <Text variant="button" color="white" textAlign="center">
                  {authenticating
                    ? t('biometric.authenticating')
                    : t('biometric.authenticate')}
                </Text>
              </Box>
            ) : (
              <Text variant="bodySmall" color="danger" textAlign="center" mt="md">
                {t('biometric.notSupported')}
              </Text>
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#1A1F2E',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    width: '80%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
});
