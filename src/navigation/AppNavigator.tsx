import React from 'react';
import { DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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

import type { MainTabParamList, RootStackParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// O NavigationContainer fica na raiz (App.tsx), compartilhado com o fluxo de login.
export const navTheme = {
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

export default function AppNavigator() {
  return (
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
  );
}
