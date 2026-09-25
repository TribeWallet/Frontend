import React, { useCallback, useEffect } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import { ThemeProvider } from '@shopify/restyle';

import AppNavigator from './src/navigation/AppNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';
import { useUserStore } from './src/features/usuario/stores/userStore';
import { useAuthStore } from './src/features/auth/stores/authStore';
import { lightTheme } from './src/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60,
      refetchOnWindowFocus: true,
    },
  },
});

focusManager.setEventListener(() => {
  return () => {};
});

function RootNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const setProfile = useUserStore((state) => state.setProfile);
  const setStats = useUserStore((state) => state.setStats);

  useEffect(() => {
    if (isAuthenticated && user) {
      setProfile({
        id: user.id,
        initials: user.initials,
        name: user.name,
        email: user.email,
        notificationCount: user.notificationCount ?? 0,
      });
      setStats([
        { value: '4', label: 'Grupos' },
        { value: '12', label: 'Pagamentos' },
        { value: '87%', label: 'Pontualidade' },
      ]);
    }
  }, [isAuthenticated, user, setProfile, setStats]);

  return isAuthenticated ? (
    <AppNavigator />
  ) : (
    <AuthNavigator />
  );
}

function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={lightTheme}>
          <SafeAreaProvider>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
              <RootNavigator />
            </View>
          </SafeAreaProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
});

export default App;