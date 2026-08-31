import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

// 1. IMPORTAÇÃO DOS ESTILOS SEPARADOS
import { styles } from './LoginScreen.styles';

// 2. IMPORTAÇÃO DOS COMPONENTES
import { TribeWalletLogo } from '../../components/TribeWalletLogo';

export interface LoginScreenProps {
  onCreateAccount: () => void;
  onForgotPassword: () => void;
}

export function LoginScreen({
  onCreateAccount,
  onForgotPassword,
}: LoginScreenProps) {
  const { width, height } = useWindowDimensions();

  // Tipagem explícita dos estados
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

  /*
   * ==========================================================
   * RESPONSIVIDADE
   * ==========================================================
   */
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

  /*
   * ==========================================================
   * HANDLERS
   * ==========================================================
   */
  const handleLogin = (): void => {
    console.log('Login:', { email, password });
  };

  const handleForgotPassword = (): void => {
    onForgotPassword();
  };

  const handleCreateAccount = (): void => {
    onCreateAccount();
  };

  const handleTerms = (): void => {
    console.log('Termos de Uso');
  };

  const handlePrivacy = (): void => {
    console.log('Política de Privacidade');
  };

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

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
            
            {/* LOGO */}
            <View style={styles.logoContainer}>
              <TribeWalletLogo />
            </View>

            {/* CARD */}
            <View style={styles.card}>
              
              <Text style={styles.title}>Bem-vindo de volta</Text>
              <Text style={styles.subtitle}>
                Entre com suas credenciais para acessar
              </Text>

              {/* FORM */}
              <View style={styles.form}>
                
                {/* E-MAIL */}
                <View style={styles.field}>
                  <Text style={styles.label}>E-mail</Text>
                  <TextInput
                    value={email}
                    // Remove espaços em branco em tempo real (boa prática para e-mail)
                    onChangeText={(text: string) => setEmail(text.replace(/\s/g, ''))}
                    style={styles.input}
                    placeholder="seu@email.com"
                    placeholderTextColor="#9AA0A6"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="emailAddress"
                    returnKeyType="next"
                    selectionColor="#087BE5"
                  />
                </View>

                {/* SENHA */}
                <View style={styles.field}>
                  <View style={styles.labelRow}>
                    <Text style={styles.label}>Senha</Text>
                    <TouchableOpacity
                      onPress={handleForgotPassword}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.forgotPassword}>Esqueceu a senha?</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.passwordWrapper}>
                    <TextInput
                      value={password}
                      onChangeText={setPassword} // Senha aceita todos os caracteres (alfanuméricos e especiais)
                      style={[styles.input, styles.passwordInput]}
                      placeholder="Digite sua senha"
                      placeholderTextColor="#9AA0A6"
                      secureTextEntry={!passwordVisible}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="password"
                      textContentType="password"
                      returnKeyType="done"
                      selectionColor="#087BE5"
                      onSubmitEditing={handleLogin}
                    />

                    <Pressable
                      style={({ pressed }) => [
                        styles.eyeButton,
                        pressed && styles.eyeButtonPressed,
                      ]}
                      onPress={() => setPasswordVisible((current) => !current)}
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

                {/* ENTRAR */}
                <Pressable
                  onPress={handleLogin}
                  style={({ pressed }) => [
                    styles.loginButton,
                    pressed && styles.loginButtonPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Entrar"
                >
                  <Text style={styles.loginButtonText}>Entrar</Text>
                </Pressable>
              </View>

              {/* CRIAR CONTA */}
              <View style={styles.createAccount}>
                <Text style={styles.createAccountText}>Não tem uma conta?</Text>
                <Pressable onPress={handleCreateAccount} hitSlop={8}>
                  <Text style={styles.createAccountLink}>Criar conta</Text>
                </Pressable>
              </View>
            </View>

            {/* TERMOS */}
            <View style={styles.terms}>
              <Text style={styles.termsText}>
                Ao entrar, você concorda com nossos{' '}
              </Text>
              <Pressable onPress={handleTerms} hitSlop={5}>
                <Text style={styles.termsLink}>Termos de Uso</Text>
              </Pressable>
              <Text style={styles.termsText}> e </Text>
              <Pressable onPress={handlePrivacy} hitSlop={5}>
                <Text style={styles.termsLink}>Política de Privacidade</Text>
              </Pressable>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ============================================================ */
/* ÍCONE DO OLHO */
/* ============================================================ */

interface PasswordEyeProps {
  visible: boolean;
}

function PasswordEye({ visible }: PasswordEyeProps) {
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
          <Circle cx="12" cy="12" r="2.5" stroke="#6F747A" strokeWidth={1.5} />
        </>
      )}
    </Svg>
  );
}