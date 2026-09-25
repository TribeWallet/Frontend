import React, { useCallback, useEffect, useRef, useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  NavigationContainerRef,
  useNavigationContainerRef,
} from '@react-navigation/native';

import { DashboardScreen } from '../features/dashboard/screens/DashboardScreen';
import { GruposScreen } from '../features/grupos/screens/GruposScreen';
import { CompromissosScreen } from '../features/compromissos/screens/CompromissosScreen';
import { PaymentsScreen } from '../features/pagamentos/screens/PaymentsScreen';
import { ReportsScreen } from '../features/relatorios/screens/ReportsScreen';

import { NewPaymentScreen } from '../features/pagamentos/screens/NewPaymentScreen';
import { NewGroupScreen } from '../features/grupos/screens/NewGroupScreen';
import { NewCommitmentScreen } from '../features/compromissos/screens/NewCommitmentScreen';
import { GroupDetailScreen } from '../features/grupos/screens/GroupDetailScreen';
import { CommitmentDetailScreen } from '../features/compromissos/screens/CommitmentDetailScreen';
import { ProfileScreen } from '../features/usuario/screens/ProfileScreen';
import { EditProfileScreen } from '../features/usuario/screens/EditProfileScreen';
import { HistoryScreen } from '../features/usuario/screens/HistoryScreen';
import { SupportScreen } from '../features/usuario/screens/SupportScreen';
import { SettingsScreen } from '../features/configuracoes/screens/SettingsScreen';
import { TabBar } from './TabBar';
import { AppProvider } from '../contexts/AppContext';

import type { MainTabParamList, RootStackParamList } from './types';
import type { SideMenuAction } from '../components/SideMenu/SideMenu';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#F8FAFB',
    card: '#FFFFFF',
    primary: '#0071DF',
    text: '#171717',
    border: '#DFE4E7',
    notification: '#EF5067',
  },
};

function renderTabBar(props: any) {
  return <TabBar {...props} />;
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
        lazy: true,
      }}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Groups" component={GruposScreen} />
      <Tab.Screen name="Commitments" component={CompromissosScreen} />
      <Tab.Screen name="Payments" component={PaymentsScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
    </Tab.Navigator>
  );
}

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

interface AppNavigatorProps {
  onOpenProfile: () => void;
  onNavigate: (action: SideMenuAction) => void;
  onLogout: () => void;
  activeTab?: string;
}

export default function AppNavigator({
  onOpenProfile,
  onNavigate,
  onLogout,
  activeTab,
}: AppNavigatorProps) {
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const navRef = useRef<NavigationContainerRef<RootStackParamList> | null>(null);
  const [activeTabState, setActiveTabState] = useState<string | undefined>(activeTab);

  useEffect(() => {
    navRef.current = navigationRef;
    const unsubscribe = navigationRef.addListener('state', () => {
      const route = navigationRef.getCurrentRoute();
      if (!route) return;
      const params = (route as { name?: string; params?: unknown }).params as
        | { screen?: string }
        | undefined;
      const name = (route as { name?: string }).name;
      if (name === 'Main' && params?.screen) {
        setActiveTabState(params.screen);
      } else {
        setActiveTabState(undefined);
      }
    });
    return unsubscribe;
  }, [navigationRef]);

  const handleOpenProfile = useCallback(() => {
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
        onLogout();
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
    [onLogout],
  );

  return (
    <NavigationContainer theme={navTheme} ref={navigationRef}>
      <AppProvider
        onOpenProfile={handleOpenProfile}
        onNavigate={handleNavigate}
        onLogout={onLogout}
        activeTab={activeTabState}
      >
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="NewPayment"
            component={NewPaymentScreen}
            options={{ presentation: 'transparentModal', animation: 'fade' }}
          />
          <Stack.Screen
            name="NewGroup"
            component={NewGroupScreen}
            options={{ presentation: 'transparentModal', animation: 'fade' }}
          />
          <Stack.Screen
            name="EditGroup"
            component={NewGroupScreen}
            options={{ presentation: 'transparentModal', animation: 'fade' }}
          />
          <Stack.Screen
            name="NewCommitment"
            component={NewCommitmentScreen}
            options={{ presentation: 'transparentModal', animation: 'fade' }}
          />
          <Stack.Screen
            name="CommitmentDetail"
            component={CommitmentDetailScreen}
            options={{ presentation: 'transparentModal', animation: 'fade' }}
          />
          <Stack.Screen
            name="GroupDetail"
            component={GroupDetailScreen}
            options={{ presentation: 'transparentModal', animation: 'fade' }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ presentation: 'transparentModal', animation: 'fade' }}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={{ presentation: 'transparentModal', animation: 'fade' }}
          />
          <Stack.Screen
            name="History"
            component={HistoryScreen}
            options={{ presentation: 'transparentModal', animation: 'fade' }}
          />
          <Stack.Screen
            name="Support"
            component={SupportScreen}
            options={{ presentation: 'transparentModal', animation: 'fade' }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ presentation: 'transparentModal', animation: 'fade' }}
          />
        </Stack.Navigator>
      </AppProvider>
    </NavigationContainer>
  );
}
