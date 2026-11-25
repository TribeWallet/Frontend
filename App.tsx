import React, { useCallback, useEffect, useMemo } from 'react';
import { StatusBar, StyleSheet, View, useColorScheme, Appearance } from 'react-native';
import * as Font from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import { ThemeProvider } from '@shopify/restyle';

import i18n from './src/i18n';
import {
  getStoredLanguageRaw,
  getDetectedLanguage,
  Language,
} from './src/hooks/useTranslation';
import {
  NavigationContainer,
  NavigationContainerRef,
  useNavigationContainerRef,
} from '@react-navigation/native';

import AppNavigator, { navTheme, darkNavTheme } from './src/navigation/AppNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';
import { AppProvider } from './src/contexts/AppContext';
import { ConviteLinkHandler } from './src/features/grupos/components/ConviteLinkHandler/ConviteLinkHandler';
import { Loading } from './src/components/Loading';
import { BiometricLockOverlay } from './src/components/BiometricLock/BiometricLockOverlay';
import { useUserStore } from './src/features/usuario/stores/userStore';
import { useAuthStore } from './src/features/auth/stores/authStore';
import { usePreferencesStore } from './src/features/configuracoes/stores/preferencesStore';
import { lightTheme, darkTheme } from './src/theme';
import type { RootStackParamList } from './src/navigation/types';
import type { SideMenuAction } from './src/components/SideMenu/SideMenu';

import FeatherFont from './src/assets/fonts/Feather.ttf';

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
  const [storesHydrated, setStoresHydrated] = React.useState(
    () =>
      useAuthStore.persist.hasHydrated() &&
      useUserStore.persist.hasHydrated() &&
      usePreferencesStore.persist.hasHydrated(),
  );
  const [languageReady, setLanguageReady] = React.useState(false);
  const [fontsLoaded, setFontsLoaded] = React.useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const setProfile = useUserStore((state) => state.setProfile);

  React.useEffect(() => {
    const updateHydration = () => {
      if (
        useAuthStore.persist.hasHydrated() &&
        useUserStore.persist.hasHydrated() &&
        usePreferencesStore.persist.hasHydrated()
      ) {
        setStoresHydrated(true);
      }
    };
    const unsubscribeAuth = useAuthStore.persist.onFinishHydration(updateHydration);
    const unsubscribeUser = useUserStore.persist.onFinishHydration(updateHydration);
    const unsubscribePreferences = usePreferencesStore.persist.onFinishHydration(updateHydration);
    updateHydration();
    return () => {
      unsubscribeAuth();
      unsubscribeUser();
      unsubscribePreferences();
    };
  }, []);

  React.useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          Feather: FeatherFont,
        });
      } catch {
        // Fonte não carregada: segue mesmo assim para não travar o app.
      }
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  useEffect(() => {
    const loadLanguage = async () => {
      const saved = await getStoredLanguageRaw();
      let language: Language = 'pt-BR';

      if (saved) {
        // Usuário já escolheu antes: mantém a escolha gravada.
        language = saved;
      } else {
        // Nenhuma escolha salva: detecta idioma do dispositivo (iOS/Android).
        language = getDetectedLanguage();
      }

      await i18n.changeLanguage(language);
      setLanguageReady(true);
    };
    loadLanguage();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      setProfile({
        id: user.id,
        initials: user.initials,
        name: user.name,
        email: user.email,
        imageUrl: user.imageUrl ?? null,
        notificationCount: user.notificationCount ?? 0,
      });
    }
  }, [isAuthenticated, user, setProfile]);

  if (!storesHydrated || !languageReady || !fontsLoaded) return <Loading fullScreen />;

  return (
    <>
      {!isAuthenticated ? <AuthNavigator /> : <AppNavigator />}
      <ConviteLinkHandler isAuthenticated={isAuthenticated} />
    </>
  );
}

function App() {
  const authLogout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const [activeTab, setActiveTab] = React.useState<string | undefined>(undefined);
  const navRef = React.useRef<NavigationContainerRef<RootStackParamList> | null>(null);
  const systemColorScheme = useColorScheme();
  const [systemScheme, setSystemScheme] = React.useState<'light' | 'dark' | null>(systemColorScheme);
  const { appearance } = usePreferencesStore();
  const biometricLock = usePreferencesStore((state) => state.biometricLock);
  const [biometricUnlocked, setBiometricUnlocked] = React.useState(false);

  React.useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });
    return () => subscription.remove();
  }, []);

  const effectiveAppearance = useMemo(() => {
    if (appearance === 'system') return systemScheme ?? 'light';
    return appearance;
  }, [appearance, systemScheme]);

  const theme = useMemo(() => (effectiveAppearance === 'dark' ? darkTheme : lightTheme), [effectiveAppearance]);

  const effectiveTheme = effectiveAppearance;

  const showBiometricLock = isAuthenticated && biometricLock && !biometricUnlocked;

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
      if (nav.getCurrentRoute()?.name === 'Profile') {
        nav.navigate('Main', { screen: 'Home' } as never);
      } else {
        nav.navigate('Profile');
      }
    }
  }, []);

  const handleNavigate = useCallback(
    (action: SideMenuAction) => {
      const nav = navRef.current;
      if (!nav?.isReady()) return;
      if (action === 'logout') {
        authLogout();
        setBiometricUnlocked(false);
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
    setBiometricUnlocked(false);
  }, [authLogout]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <StatusBar barStyle={effectiveTheme === 'dark' ? 'light-content' : 'dark-content'} />
          <ThemeProvider theme={theme}>
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
              <BiometricLockOverlay
                visible={showBiometricLock}
                onUnlocked={() => setBiometricUnlocked(true)}
              />
              <AppProvider
                onOpenProfile={openProfile}
                onNavigate={handleNavigate}
                onLogout={handleLogout}
                activeTab={activeTab}
              >
                <NavigationContainer ref={navigationRef} theme={effectiveTheme === 'dark' ? darkNavTheme : navTheme}>
                  <RootNavigator />
                </NavigationContainer>
              </AppProvider>
            </View>
          </ThemeProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: {
    flex: 1,
  },
});

export default App;