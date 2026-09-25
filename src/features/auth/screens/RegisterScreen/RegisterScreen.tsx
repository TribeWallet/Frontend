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


import { styles } from './RegisterScreen.styles';


import { TribeWalletLogo } from '../../components/TribeWalletLogo';

export interface RegisterScreenProps {
  onLogin?: () => void;
}

export function RegisterScreen({ onLogin }: RegisterScreenProps) {
  const { width, height } = useWindowDimensions();


  const [nome, setNome] = useState<string>('');
  const [sobrenome, setSobrenome] = useState<string>('');
  const [usuario, setUsuario] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [senha, setSenha] = useState<string>('');
  const [confirmarSenha, setConfirmarSenha] = useState<string>('');
  const [senhaVisible, setSenhaVisible] = useState<boolean>(false);
  const [confirmarSenhaVisible, setConfirmarSenhaVisible] = useState<boolean>(false);




  const handleNomeChange = (text: string) => {
    setNome(text.replace(/[^a-zA-ZÀ-ÿ\s-]/g, ''));
  };

  const handleSobrenomeChange = (text: string) => {
    setSobrenome(text.replace(/[^a-zA-ZÀ-ÿ\s-]/g, ''));
  };


  const handleUsuarioChange = (text: string) => {
    setUsuario(text.replace(/\s/g, ''));
  };

  const handleEmailChange = (text: string) => {
    setEmail(text.replace(/\s/g, ''));
  };


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


  const handleRegister = (): void => {
    if (!nome.trim()) {
      console.log('Informe o nome');
      return;
    }
    if (!sobrenome.trim()) {
      console.log('Informe o sobrenome');
      return;
    }
    if (!usuario.trim()) {
      console.log('Informe o nome de usuário');
      return;
    }
    if (!email.trim()) {
      console.log('Informe o e-mail');
      return;
    }
    if (senha.length < 6) {
      console.log('A senha precisa ter pelo menos 6 caracteres');
      return;
    }
    if (senha !== confirmarSenha) {
      console.log('As senhas não coincidem');
      return;
    }

    console.log('Cadastro:', { nome, sobrenome, usuario, email, senha });
  };

  const handleLogin = (): void => {
    if (onLogin) {
      onLogin();
      return;
    }
    console.log('Fazer login');
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
              paddingBottom: 36,
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
              <Text style={styles.title}>Criar conta</Text>
              <Text style={styles.subtitle}>
                Preencha os dados abaixo para criar sua conta
              </Text>


              <View style={styles.form}>


                <View style={styles.field}>
                  <Text style={styles.label}>Nome</Text>
                  <TextInput
                    value={nome}
                    onChangeText={handleNomeChange}
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


                <View style={styles.field}>
                  <Text style={styles.label}>Sobrenome</Text>
                  <TextInput
                    value={sobrenome}
                    onChangeText={handleSobrenomeChange}
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


                <View style={styles.field}>
                  <Text style={styles.label}>Nome de usuário</Text>
                  <TextInput
                    value={usuario}
                    onChangeText={handleUsuarioChange}
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


                <View style={styles.field}>
                  <Text style={styles.label}>E-mail</Text>
                  <TextInput
                    value={email}
                    onChangeText={handleEmailChange}
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


                <View style={styles.field}>
                  <Text style={styles.label}>Senha</Text>
                  <View style={styles.passwordWrapper}>
                    <TextInput
                      value={senha}
                      onChangeText={setSenha}
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


                <View style={styles.field}>
                  <Text style={styles.label}>Confirmar senha</Text>
                  <View style={styles.passwordWrapper}>
                    <TextInput
                      value={confirmarSenha}
                      onChangeText={setConfirmarSenha}
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


                <Pressable
                  onPress={handleRegister}
                  style={({ pressed }) => [
                    styles.registerButton,
                    pressed && styles.registerButtonPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Criar conta"
                >
                  <Text style={styles.registerButtonText}>Criar conta</Text>
                </Pressable>
              </View>


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
