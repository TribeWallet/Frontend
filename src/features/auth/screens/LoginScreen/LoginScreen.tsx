import React, { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { styles } from './LoginScreen.styles';
import { TribeWalletLogo } from '../../components/TribeWalletLogo';
import { useAuthStore, AuthUser } from '../../stores/authStore';

export interface LoginScreenProps {
  onCreateAccount: () => void;
  onForgotPassword: () => void;
  onLogin?: () => void;
}

const DEV_EMAIL = 'dev@dev.com';
const DEV_PASSWORD = 'admin';

function initialsFromName(name: string): string {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .slice(0, 2)
      .join('') || 'NV'
  );
}

export function LoginScreen({
  onCreateAccount,
  onForgotPassword,
  onLogin,
}: LoginScreenProps) {
  const { width, height } = useWindowDimensions();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleLogin = useCallback((): void => {
    if (submitting) return;
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!normalizedEmail || !normalizedPassword) {
      setError('Preencha e-mail e senha para continuar.');
      return;
    }
    if (
      normalizedEmail !== DEV_EMAIL.toLowerCase() ||
      normalizedPassword !== DEV_PASSWORD
    ) {
      setError('E-mail ou senha inválidos.');
      return;
    }

    setError(null);
    setSubmitting(true);

    const user: AuthUser = {
      id: 'user-dev',
      name: 'Gabriel',
      email: DEV_EMAIL,
      initials: initialsFromName('Gabriel'),
      notificationCount: 0,
    };

    login(user);
    onLogin?.();
  }, [email, password, submitting, login, onLogin]);

  const handleForgotPassword = useCallback((): void => {
    Alert.alert(
      'Recuperar senha',
      'Entre em contato com o suporte para redefinir a senha da sua conta.',
    );
    onForgotPassword();
  }, [onForgotPassword]);

  const handleCreateAccount = useCallback((): void => {
    Alert.alert(
      'Criar conta',
      'Cadastros são feitos pelo administrador. Fale com o suporte.',
    );
    onCreateAccount();
  }, [onCreateAccount]);

  const handleTerms = (): void => {
    Alert.alert('Termos de Uso', 'Conteúdo em breve.');
  };
  const handlePrivacy = (): void => {
    Alert.alert('Política de Privacidade', 'Conteúdo em breve.');
  };

  const canSubmit = email.trim().length > 0 && password.length > 0;

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
          keyboardDismissMode={
            Platform.OS === 'ios' ? 'interactive' : 'on-drag'
          }
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={[styles.content, { width: contentWidth }]}>
            <View style={styles.logoContainer}>
              <TribeWalletLogo />
            </View>

            <View style={styles.card}>
              <Text style={styles.title}>Bem-vindo de volta</Text>
              <Text style={styles.subtitle}>
                Entre com suas credenciais para acessar
              </Text>

              <View style={styles.form}>
                <View style={styles.field}>
                  <Text style={styles.label}>E-mail</Text>
                  <TextInput
                    value={email}
                    onChangeText={(text: string) => {
                      setEmail(text.replace(/\s/g, ''));
                      if (error) setError(null);
                    }}
                    style={styles.input}
                    placeholder="dev@dev.com"
                    placeholderTextColor="#9AA0A6"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="emailAddress"
                    returnKeyType="next"
                    selectionColor="#087BE5"
                    editable={!submitting}
                  />
                </View>

                <View style={styles.field}>
                  <View style={styles.labelRow}>
                    <Text style={styles.label}>Senha</Text>
                    <TouchableOpacity
                      onPress={handleForgotPassword}
                      activeOpacity={0.7}
                      hitSlop={6}
                    >
                      <Text style={styles.forgotPassword}>
                        Esqueceu a senha?
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.passwordWrapper}>
                    <TextInput
                      value={password}
                      onChangeText={(text: string) => {
                        setPassword(text);
                        if (error) setError(null);
                      }}
                      style={[styles.input, styles.passwordInput]}
                      placeholder="•••••"
                      placeholderTextColor="#9AA0A6"
                      secureTextEntry={!passwordVisible}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="password"
                      textContentType="password"
                      returnKeyType="done"
                      selectionColor="#087BE5"
                      onSubmitEditing={handleLogin}
                      editable={!submitting}
                    />

                    <Pressable
                      style={({ pressed }) => [
                        styles.eyeButton,
                        pressed && styles.eyeButtonPressed,
                      ]}
                      onPress={() =>
                        setPasswordVisible((current) => !current)
                      }
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={
                        passwordVisible ? 'Ocultar senha' : 'Mostrar senha'
                      }
                    >
                      <PasswordEye visible={passwordVisible} />
                    </Pressable>
                  </View>
                </View>

                {error ? (
                  <View
                    style={{
                      backgroundColor: '#FDE8EB',
                      borderRadius: 8,
                      padding: 10,
                      marginBottom: 12,
                    }}
                  >
                    <Text
                      style={{
                        color: '#B91C2C',
                        fontSize: 13,
                        fontWeight: '500',
                      }}
                    >
                      {error}
                    </Text>
                  </View>
                ) : null}

                <Pressable
                  onPress={handleLogin}
                  disabled={!canSubmit || submitting}
                  style={({ pressed }) => [
                    styles.loginButton,
                    (pressed || !canSubmit) && {
                      opacity: !canSubmit ? 0.55 : 0.88,
                    },
                    submitting && { opacity: 0.7 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Entrar"
                >
                  <Text style={styles.loginButtonText}>
                    {submitting ? 'Entrando...' : 'Entrar'}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.createAccount}>
                <Text style={styles.createAccountText}>
                  Não tem uma conta?
                </Text>
                <Pressable onPress={handleCreateAccount} hitSlop={8}>
                  <Text style={styles.createAccountLink}>Criar conta</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.terms}>
              <Text style={styles.termsText}>
                Ao entrar, você concorda com nossos{' '}
              </Text>
              <Pressable onPress={handleTerms} hitSlop={5}>
                <Text style={styles.termsLink}>Termos de Uso</Text>
              </Pressable>
              <Text style={styles.termsText}> e </Text>
              <Pressable onPress={handlePrivacy} hitSlop={5}>
                <Text style={styles.termsLink}>
                  Política de Privacidade
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function PasswordEye({ visible }: { visible: boolean }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      {visible ? (
        <>
          <Path
            d="M3 3L21 21"
            stroke="#6F747A"
            strokeWidth={1.7}
            strokeLinecap="round"
          />
          <Path
            d="M10.6 6.9C11.05 6.84 11.5 6.8 12 6.8C18.2 6.8 21.5 12 21.5 12C20.85 13 20.05 13.9 19.1 14.65"
            stroke="#6F747A"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
          <Path
            d="M6.2 9.15C4.05 10.4 2.5 12 2.5 12C2.5 12 5.8 17.2 12 17.2C13.15 17.2 14.2 17 15.15 16.7"
            stroke="#6F747A"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <Path
            d="M2.5 12C2.5 12 5.8 7 12 7C18.2 7 21.5 12 21.5 12C21.5 12 18.2 17 12 17C5.8 17 2.5 12 2.5 12Z"
            stroke="#6F747A"
            strokeWidth={1.5}
          />
          <Circle
            cx="12"
            cy="12"
            r="2.5"
            stroke="#6F747A"
            strokeWidth={1.5}
          />
        </>
      )}
    </Svg>
  );
}

export default LoginScreen;
