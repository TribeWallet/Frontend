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
} from 'react-native';
import { useKeyboardScroll } from '../../../../hooks/useKeyboardScroll';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';

// 1. IMPORTAÇÃO DOS ESTILOS SEPARADOS
import { createStyles } from './RegisterScreen.styles';

// 2. IMPORTAÇÃO DOS COMPONENTES
import { TribeWalletLogo } from '../../components/TribeWalletLogo';
import { useAuthStore } from '../../stores/authStore';
import * as authService from '../../services/authService';
import { getErrorMessage } from '../../../../services/api/apiClient';
import { useTheme } from '../../../../theme';
import { isValidEmail } from '../../../../utils/formatters';
import { useTranslation } from '../../../../hooks/useTranslation';

export interface RegisterScreenProps {
  onLogin?: () => void;
}

export function RegisterScreen({ onLogin }: RegisterScreenProps) {
  const { width, height } = useWindowDimensions();
  const theme = useTheme();
  const styles = createStyles(theme);
  const { t } = useTranslation();

  /*
   * ==========================================================
   * ESTADOS (Com tipagem explícita)
   * ==========================================================
   */
  const [nome, setNome] = useState<string>('');
  const [sobrenome, setSobrenome] = useState<string>('');
  const [usuario, setUsuario] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [confirmarSenha, setConfirmarSenha] = useState<string>('');
  const [senhaVisible, setSenhaVisible] = useState<boolean>(false);
  const [confirmarSenhaVisible, setConfirmarSenhaVisible] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const setSession = useAuthStore((state) => state.login);

  const { scrollRef, handleFocusCapture, handleContentSizeChange } =
    useKeyboardScroll();

  /*
   * ==========================================================
   * VALIDAÇÃO EM TEMPO REAL (REGEX)
   * ==========================================================
   */
  
  // Nome e Sobrenome: Remove QUALQUER coisa que NÃO seja letra (incluindo acentos), espaço ou hífen.
  // Isso bloqueia números (0-9) e símbolos (@, #, $, etc.) automaticamente.
  const handleNomeChange = (text: string) => {
    setNome(text.replace(/[^a-zA-ZÀ-ÿ\s-]/g, ''));
  };

  const handleSobrenomeChange = (text: string) => {
    setSobrenome(text.replace(/[^a-zA-ZÀ-ÿ\s-]/g, ''));
  };

  // Usuário e Email: Permite alfanuméricos e especiais, mas remove espaços em branco.
  const handleUsuarioChange = (text: string) => {
    setUsuario(text.replace(/\s/g, ''));
  };

  const handleEmailChange = (text: string) => {
    setEmail(text.replace(/\s/g, ''));
  };

  /*
   * ==========================================================
   * RESPONSIVIDADE (Com tipagem explícita)
   * ==========================================================
   */
  const isSmallPhone: boolean = width < 360;
  const isTablet: boolean = width >= 768;

  const horizontalPadding: number = isTablet ? 32 : isSmallPhone ? 16 : 20;
  const maxContentWidth: number = isTablet ? 460 : 420;

  const contentWidth: number = Math.min(
    width - horizontalPadding * 2,
    maxContentWidth,
  );

  const topSpacing: number =
    height <= 640
      ? 24
      : height <= 720
        ? 40
        : height <= 850
          ? 58
          : 76;

  /*
   * ==========================================================
   * AÇÕES
   * ==========================================================
   */
  const handleRegister = async (): Promise<void> => {
    if (submitting) return;
    const normalizedEmail = email.trim().toLowerCase();

    if (!nome.trim()) {
      setError(t('auth.fillName'));
      return;
    }
    if (!sobrenome.trim()) {
      setError(t('auth.fillSurname'));
      return;
    }
    if (!usuario.trim()) {
      setError(t('auth.fillUsername'));
      return;
    }
    if (!isValidEmail(normalizedEmail)) {
      setError(t('auth.fillValidEmail'));
      return;
    }
    if (senha.length < 6) {
      setError(t('auth.passwordMinLength'));
      return;
    }
    if (senha !== confirmarSenha) {
      setError(t('auth.passwordsDontMatch'));
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await authService.register({
        nome: nome.trim(),
        sobrenome: sobrenome.trim(),
        username: usuario.trim(),
        email: normalizedEmail,
        senha,
      });
      // Cadastro criado: já entra na conta com as mesmas credenciais.
      const session = await authService.login({ email: normalizedEmail, senha });
      setSession(session.user, session.token);
    } catch (registerError) {
      setError(getErrorMessage(registerError));
      setSubmitting(false);
    }
  };

  const handleLogin = (): void => {
    if (onLogin) {
      onLogin();
      return;
    }
    console.log('Fazer login');
  };

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle={theme.colors.background === '#0B1120' ? 'light-content' : 'dark-content'} />

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: horizontalPadding,
              paddingTop: topSpacing,
              paddingBottom: 36,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={handleContentSizeChange}
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
              <Text style={styles.title}>{t('auth.createAccountTitle')}</Text>
              <Text style={styles.subtitle}>
                {t('auth.createAccountSubtitle')}
              </Text>

              {/* FORMULÁRIO */}
              <View style={styles.form}>
                
                {/* NOME */}
                <View style={styles.field}>
                  <Text style={styles.label}>{t('auth.name')}</Text>
                  <TextInput
                    value={nome}
                    onChangeText={handleNomeChange}
                    onFocusCapture={handleFocusCapture}
                    // Aplica filtro em tempo real
                    style={styles.input}
                    placeholder={t('auth.yourName')}
                    placeholderTextColor="#9AA0A6"
                    autoCapitalize="words"
                    autoCorrect={false}
                    autoComplete="given-name"
                    textContentType="givenName"
                    returnKeyType="next"
                    selectionColor="#087BE5"
                  />
                </View>

                {/* SOBRENOME */}
                <View style={styles.field}>
                  <Text style={styles.label}>{t('auth.surname')}</Text>
                  <TextInput
                    value={sobrenome}
                    onChangeText={handleSobrenomeChange}
                    onFocusCapture={handleFocusCapture}
                    // Aplica filtro em tempo real
                    style={styles.input}
                    placeholder={t('auth.yourSurname')}
                    placeholderTextColor="#9AA0A6"
                    autoCapitalize="words"
                    autoCorrect={false}
                    autoComplete="family-name"
                    textContentType="familyName"
                    returnKeyType="next"
                    selectionColor="#087BE5"
                  />
                </View>

                {/* USUÁRIO */}
                <View style={styles.field}>
                  <Text style={styles.label}>{t('auth.username')}</Text>
                  <TextInput
                    value={usuario}
                    onChangeText={handleUsuarioChange}
                    onFocusCapture={handleFocusCapture}
                    // Remove espaços
                    style={styles.input}
                    placeholder={t('auth.yourUsername')}
                    placeholderTextColor="#9AA0A6"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="username"
                    textContentType="username"
                    returnKeyType="next"
                    selectionColor="#087BE5"
                  />
                </View>

                {/* EMAIL */}
                <View style={styles.field}>
                  <Text style={styles.label}>{t('auth.email')}</Text>
                  <TextInput
                    value={email}
                    onChangeText={handleEmailChange}
                    onFocusCapture={handleFocusCapture}
                    // Remove espaços
                    style={styles.input}
                    placeholder={t('auth.emailPlaceholder')}
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
                  <Text style={styles.label}>{t('auth.password')}</Text>
                  <View style={styles.passwordWrapper}>
                    <TextInput
                      value={senha}
                      onChangeText={setSenha}
                      onFocusCapture={handleFocusCapture}
                      // Aceita tudo (alfanumérico e especiais)
                      style={[styles.input, styles.passwordInput]}
                      placeholder={t('auth.passwordMin6')}
                      placeholderTextColor="#9AA0A6"
                      secureTextEntry={!senhaVisible}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="new-password"
                      textContentType="newPassword"
                      returnKeyType="next"
                      selectionColor="#087BE5"
                    />
                    <Pressable
                      onPress={() => setSenhaVisible((current) => !current)}
                      style={({ pressed }) => [
                        styles.eyeButton,
                        pressed && styles.eyeButtonPressed,
                      ]}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={
                        senhaVisible ? t('auth.hidePassword') : t('auth.showPassword')
                      }
                    >
                      <PasswordEye visible={senhaVisible} />
                    </Pressable>
                  </View>
                </View>

                {/* CONFIRMAR SENHA */}
                <View style={styles.field}>
                  <Text style={styles.label}>{t('auth.confirmPassword')}</Text>
                  <View style={styles.passwordWrapper}>
                    <TextInput
                      value={confirmarSenha}
                      onChangeText={setConfirmarSenha}
                      onFocusCapture={handleFocusCapture}
                      // Aceita tudo
                      style={[styles.input, styles.passwordInput]}
                      placeholder={t('auth.repeatPassword')}
                      placeholderTextColor="#9AA0A6"
                      secureTextEntry={!confirmarSenhaVisible}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="new-password"
                      textContentType="newPassword"
                      returnKeyType="done"
                      selectionColor="#087BE5"
                      onSubmitEditing={handleRegister}
                    />
                    <Pressable
                      onPress={() => setConfirmarSenhaVisible((current) => !current)}
                      style={({ pressed }) => [
                        styles.eyeButton,
                        pressed && styles.eyeButtonPressed,
                      ]}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={
                        confirmarSenhaVisible
                          ? t('auth.hidePassword')
                          : t('auth.showPassword')
                      }
                    >
                      <PasswordEye visible={confirmarSenhaVisible} />
                    </Pressable>
                  </View>
                </View>

                {error ? (
                  <View
                    style={{
                      backgroundColor: theme.colors.dangerLight,
                      borderRadius: 8,
                      padding: 10,
                      marginBottom: 12,
                    }}
                  >
                    <Text
                      style={{
                        color: theme.colors.danger,
                        fontSize: 13,
                        fontWeight: '500',
                      }}
                    >
                      {error}
                    </Text>
                  </View>
                ) : null}

                {/* BOTÃO CADASTRAR */}
                <Pressable
                  onPress={handleRegister}
                  disabled={submitting}
                  style={({ pressed }) => [
                    styles.registerButton,
                    pressed && styles.registerButtonPressed,
                    submitting && { opacity: 0.7 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={t('auth.createAccount')}
                >
                  <Text style={styles.registerButtonText}>
                    {submitting
                      ? t('auth.creatingAccount')
                      : t('auth.createAccount')}
                  </Text>
                </Pressable>
              </View>

              {/* LOGIN FOOTER */}
              <View style={styles.loginFooter}>
                <Text style={styles.loginText}>{t('auth.haveAccount')}</Text>
                <Pressable onPress={handleLogin} hitSlop={8}>
                  <Text style={styles.loginLink}>{t('auth.backToLogin')}</Text>
                </Pressable>
              </View>

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
  const theme = useTheme();
  return (
    <Feather
      name={visible ? 'eye' : 'eye-off'}
      size={22}
      color={theme.colors.textSecondary}
    />
  );
}
