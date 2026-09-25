import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  PressableStateCallbackType,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


import { styles } from './ForgotPasswordScreen.styles';


import { TribeWalletLogo } from '../../components/TribeWalletLogo';

export interface ForgotPasswordScreenProps {
  onBackToLogin: () => void;
}

export function ForgotPasswordScreen({
  onBackToLogin,
}: ForgotPasswordScreenProps) {
  const { width, height } = useWindowDimensions();

  const [email, setEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);


  const isSmallPhone: boolean = width < 360;
  const isTablet: boolean = width >= 768;

  const horizontalPadding: number = isTablet
    ? 32
    : isSmallPhone
      ? 16
      : 20;

  const maxContentWidth: number = isTablet ? 440 : 420;

  const contentWidth: number = Math.min(
    width - horizontalPadding * 2,
    maxContentWidth,
  );


  const topSpacing: number =
    height <= 640
      ? 28
      : height <= 720
        ? 48
        : height <= 850
          ? 68
          : 90;


  const handleRecoverPassword = (): void => {
    const emailClean: string = email.trim();

    if (!emailClean) {
      return;
    }

    const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(emailClean)) {
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      console.log('Solicitação de recuperação:', emailClean);
      onBackToLogin();
    }, 700);
  };


  const handleBackToLogin = (): void => {
    onBackToLogin();
  };


  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: horizontalPadding,
              paddingTop: topSpacing,
              paddingBottom: 32,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={[styles.content, { width: contentWidth }]}>


            <View style={styles.logoContainer}>
              <TribeWalletLogo />
            </View>


            <View style={styles.card}>


              <Text style={styles.title}>Esqueceu a senha?</Text>


              <Text style={styles.subtitle}>
                Digite seu e-mail para receber as instruções para redefinir sua senha
              </Text>


              <View style={styles.form}>


                <View style={styles.field}>
                  <Text style={styles.label}>E-mail</Text>
                  <TextInput
                    value={email}
                    onChangeText={(text: string) => setEmail(text)}
                    style={styles.input}
                    placeholder="seu@email.com"
                    placeholderTextColor="#9AA0A6"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="emailAddress"
                    returnKeyType="done"
                    selectionColor="#087BE5"
                    editable={!loading}
                    onSubmitEditing={handleRecoverPassword}
                  />
                </View>


                <Pressable
                  onPress={handleRecoverPassword}
                  disabled={loading}
                  style={({ pressed }: PressableStateCallbackType) => [
                    styles.submitButton,
                    pressed && !loading && styles.submitButtonPressed,
                    loading && styles.submitButtonDisabled,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Enviar instruções"
                >
                  <Text style={styles.submitButtonText}>
                    {loading ? 'Enviando...' : 'Enviar instruções'}
                  </Text>
                </Pressable>
              </View>


              <Pressable
                onPress={handleBackToLogin}
                hitSlop={8}
                style={styles.backButton}
                accessibilityRole="button"
                accessibilityLabel="Voltar para o login"
              >
                <Text style={styles.backText}>← Voltar para o login</Text>
              </Pressable>

            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
