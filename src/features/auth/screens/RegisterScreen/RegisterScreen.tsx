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
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

// 1. IMPORTAÇÃO DOS ESTILOS SEPARADOS
import { styles } from './RegisterScreen.styles';

// 2. IMPORTAÇÃO DOS COMPONENTES
import { TribeWalletLogo } from '../../components/TribeWalletLogo';
import { useAuthStore } from '../../stores/authStore';
import * as authService from '../../services/authService';
import { getErrorMessage } from '../../../../services/api/apiClient';
import { isValidEmail } from '../../../../utils/formatters';

export interface RegisterScreenProps {
  onLogin?: () => void;
}

export function RegisterScreen({ onLogin }: RegisterScreenProps) {
  const { width, height } = useWindowDimensions();

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
      setError('Informe o nome.');
      return;
    }
    if (!sobrenome.trim()) {
      setError('Informe o sobrenome.');
      return;
    }
    if (!usuario.trim()) {
      setError('Informe o nome de usuário.');
      return;
    }
    if (!isValidEmail(normalizedEmail)) {
      setError('Informe um e-mail válido.');
      return;
    }
    if (senha.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem.');
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
              paddingBottom: 36,
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
              <Text style={styles.title}>Criar conta</Text>
              <Text style={styles.subtitle}>
                Preencha os dados abaixo para criar sua conta
              </Text>

              {/* FORMULÁRIO */}
              <View style={styles.form}>
                
                {/* NOME */}
                <View style={styles.field}>
                  <Text style={styles.label}>Nome</Text>
                  <TextInput
                    value={nome}
                    onChangeText={handleNomeChange} // Aplica filtro em tempo real
                    style={styles.input}
                    placeholder="Seu nome"
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
                  <Text style={styles.label}>Sobrenome</Text>
                  <TextInput
                    value={sobrenome}
                    onChangeText={handleSobrenomeChange} // Aplica filtro em tempo real
                    style={styles.input}
                    placeholder="Seu sobrenome"
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
                  <Text style={styles.label}>Nome de usuário</Text>
                  <TextInput
                    value={usuario}
                    onChangeText={handleUsuarioChange} // Remove espaços
                    style={styles.input}
                    placeholder="Seu nome de usuário"
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
                  <Text style={styles.label}>E-mail</Text>
                  <TextInput
                    value={email}
                    onChangeText={handleEmailChange} // Remove espaços
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
                  <Text style={styles.label}>Senha</Text>
                  <View style={styles.passwordWrapper}>
                    <TextInput
                      value={senha}
                      onChangeText={setSenha} // Aceita tudo (alfanumérico e especiais)
                      style={[styles.input, styles.passwordInput]}
                      placeholder="Mínimo 6 caracteres"
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
                      accessibilityLabel={senhaVisible ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      <PasswordEye visible={senhaVisible} />
                    </Pressable>
                  </View>
                </View>

                {/* CONFIRMAR SENHA */}
                <View style={styles.field}>
                  <Text style={styles.label}>Confirmar senha</Text>
                  <View style={styles.passwordWrapper}>
                    <TextInput
                      value={confirmarSenha}
                      onChangeText={setConfirmarSenha} // Aceita tudo
                      style={[styles.input, styles.passwordInput]}
                      placeholder="Repita sua senha"
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
                      accessibilityLabel={confirmarSenhaVisible ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      <PasswordEye visible={confirmarSenhaVisible} />
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
                  accessibilityLabel="Criar conta"
                >
                  <Text style={styles.registerButtonText}>
                    {submitting ? 'Criando conta...' : 'Criar conta'}
                  </Text>
                </Pressable>
              </View>

              {/* LOGIN FOOTER */}
              <View style={styles.loginFooter}>
                <Text style={styles.loginText}>Já tem uma conta?</Text>
                <Pressable onPress={handleLogin} hitSlop={8}>
                  <Text style={styles.loginLink}>Fazer login</Text>
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
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      {visible ? (
        <>
          <Path
            d="M3 3L21 21"
            stroke="#6D7379"
            strokeWidth={1.7}
            strokeLinecap="round"
          />
          <Path
            d="M10.6 6.9C11.05 6.84 11.5 6.8 12 6.8C18.2 6.8 21.5 12 21.5 12C20.85 13 20.05 13.9 19.1 14.65"
            stroke="#6D7379"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
          <Path
            d="M6.2 9.15C4.05 10.4 2.5 12 2.5 12C2.5 12 5.8 17.2 12 17.2C13.15 17.2 14.2 17 15.15 16.7"
            stroke="#6D7379"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <Path
            d="M2.5 12C2.5 12 5.8 7 12 7C18.2 7 21.5 12 21.5 12C21.5 12 18.2 17 12 17C5.8 17 2.5 12 2.5 12Z"
            stroke="#6D7379"
            strokeWidth={1.5}
          />
          <Circle cx="12" cy="12" r="2.5" stroke="#6D7379" strokeWidth={1.5} />
        </>
      )}
    </Svg>
  );
}
