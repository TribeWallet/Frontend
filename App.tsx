import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

import { SafeAreaProvider } from 'react-native-safe-area-context';

import * as LoginScreenModule from './src/features/auth/screens/LoginScreen/LoginScreen';
import * as RegisterScreenModule from './src/features/auth/screens/RegisterScreen/RegisterScreen';
import * as ForgotPasswordScreenModule from './src/features/auth/screens/ForgotPasswordScreen/ForgotPasswordScreen';

const LoginScreen =
  (LoginScreenModule.default ??
    (LoginScreenModule as any).LoginScreen) as React.ComponentType<any>;

const RegisterScreen =
  (RegisterScreenModule.default ??
    (RegisterScreenModule as any).RegisterScreen) as React.ComponentType<any>;

const ForgotPasswordScreen =
  (ForgotPasswordScreenModule.default ??
    (ForgotPasswordScreenModule as any).ForgotPasswordScreen) as React.ComponentType<any>;

type Screen =
  | 'login'
  | 'register'
  | 'forgot-password';

function App() {
  const [screen, setScreen] = useState<Screen>('login');

  return (
    <SafeAreaProvider>
      <View style={styles.container}>

        {screen === 'login' && (
          <LoginScreen
            onCreateAccount={() => {
              setScreen('register');
            }}
            onForgotPassword={() => {
              setScreen('forgot-password');
            }}
          />
        )}

        {screen === 'register' && (
          <RegisterScreen
            onLogin={() => {
              setScreen('login');
            }}
          />
        )}

        {screen === 'forgot-password' && (
          <ForgotPasswordScreen
            onBackToLogin={() => {
              setScreen('login');
            }}
          />
        )}

      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
