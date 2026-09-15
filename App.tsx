import React, { useCallback, useEffect } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import { ThemeProvider } from '@shopify/restyle';
import {
  NavigationContainer,
  NavigationContainerRef,
  useNavigationContainerRef,
} from '@react-navigation/native';

import AppNavigator, { navTheme } from './src/navigation/AppNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';
import { AppProvider } from './src/contexts/AppContext';
import { useUserStore } from './src/features/usuario/stores/userStore';
import { useAuthStore } from './src/features/auth/stores/authStore';
import { lightTheme } from './src/theme';
import type { RootStackParamList } from './src/navigation/types';
import type { SideMenuAction } from './src/components/SideMenu/SideMenu';

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

const TAB_NAVIGATION: Record<SideMenuAction, string | null> = {
  home: 'Home',
  groups: 'Groups',
  commitments: 'Commitments',
  payments: 'Payments',
  reports: 'Reports',
  alerts: null,
  profile: null,
  'edit-profile': null,
  history: null,
  support: null,
  settings: null,
  logout: null,
};

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
  const authLogout = useAuthStore((state) => state.logout);
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const [activeTab, setActiveTab] = React.useState<string | undefined>(undefined);
  const navRef = React.useRef<NavigationContainerRef<RootStackParamList> | null>(null);

  React.useEffect(() => {
    navRef.current = navigationRef as unknown as NavigationContainerRef<RootStackParamList> | null;
    const unsubscribe = navigationRef.addListener('state', () => {
      const route = navigationRef.getCurrentRoute();
      if (!route) return;
      const params = (route as { name?: string; params?: unknown }).params as
        | { screen?: string }
        | undefined;
      const name = (route as { name?: string }).name;
      if (name === 'Main' && params?.screen) {
        setActiveTab(params.screen);
      } else {
        setActiveTab(undefined);
      }
    });
    return unsubscribe;
  }, [navigationRef]);

  const openProfile = useCallback(() => {
    const nav = navRef.current;
    if (nav?.isReady()) {
      nav.navigate('Profile');
    }
  }, []);

  const handleNavigate = useCallback(
    (action: SideMenuAction) => {
      const nav = navRef.current;
      if (!nav?.isReady()) return;
      if (action === 'logout') {
        authLogout();
        return;
      }
      const tab = TAB_NAVIGATION[action];
      if (tab) {
        nav.navigate('Main', { screen: tab } as never);
        return;
      }
      switch (action) {
        case 'profile':
          nav.navigate('Profile');
          break;
        case 'edit-profile':
          nav.navigate('EditProfile');
          break;
        case 'history':
          nav.navigate('History');
          break;
        case 'support':
          nav.navigate('Support');
          break;
        case 'settings':
          nav.navigate('Settings');
          break;
        case 'alerts':
          nav.navigate('Main', { screen: 'Home' } as never);
          break;
      }
    },
    [authLogout],
  );

  const handleLogout = useCallback(() => {
    authLogout();
  }, [authLogout]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={lightTheme}>
          <SafeAreaProvider>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
              <AppProvider
                onOpenProfile={openProfile}
                onNavigate={handleNavigate}
                onLogout={handleLogout}
                activeTab={activeTab}
              >
                <NavigationContainer ref={navigationRef} theme={navTheme}>
                  <RootNavigator />
                </NavigationContainer>
              </AppProvider>
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