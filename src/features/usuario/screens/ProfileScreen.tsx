import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { TopBar } from '../../../components/TopBar';
import { Button } from '../../../components/Button';
import { Pill } from '../../../components/Pill';
import { Box, Text } from '../../../theme';
import { ProfileModal } from '../components/ProfileModal/ProfileModal';
import { useUserStore } from '../stores/userStore';
import { useAuthStore } from '../../auth/stores/authStore';
import {
  useAppCommitments,
  useAppGroups,
  useAppPayments,
} from '../../../contexts/AppContext';
import { useTopBarActions } from '../../../hooks/useTopBarActions';
import type { RootStackParamList } from '../../../navigation/types';
import { formatCurrency } from '../../../utils/currency';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

export function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const profile = useUserStore((state) => state.profile);
  const stats = useUserStore((state) => state.stats);
  const setStats = useUserStore((state) => state.setStats);
  const setProfile = useUserStore((state) => state.setProfile);
  const clearProfile = useUserStore((state) => state.logout);
  const authLogout = useAuthStore((state) => state.logout);
  const { groups } = useAppGroups();
  const { commitments } = useAppCommitments();
  const { payments } = useAppPayments();
  const topBar = useTopBarActions();
  const [editing, setEditing] = useState(false);

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const punctuality = commitments.length
    ? Math.round(
        (commitments.filter((c) => c.status === 'paid').length / commitments.length) * 100,
      )
    : 0;
  const dynamicStats = useMemo(
    () => [
      { value: String(groups.length), label: 'Grupos' },
      { value: String(payments.length), label: 'Pagamentos' },
      { value: `${punctuality}%`, label: 'Pontualidade' },
    ],
    [groups.length, payments.length, punctuality],
  );

  React.useEffect(() => {
    setStats(dynamicStats);
  }, [dynamicStats, setStats]);

  const handleLogout = useCallback(() => {
    clearProfile();
    authLogout();
    navigation.goBack();
  }, [clearProfile, authLogout, navigation]);

  const handleSave = useCallback(
    (data: { initials: string; name: string; email: string }) => {
      setProfile({
        id: profile?.id ?? 'user-1',
        initials: data.initials,
        name: data.name,
        email: data.email,
        notificationCount: profile?.notificationCount ?? 0,
      });
      setEditing(false);
    },
    [profile, setProfile],
  );

  const handleEdit = () => {
    setEditing(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFB' }} edges={['top']}>
      <Box flex={1} width="100%" maxWidth={430} alignSelf="center" bg="background">
        <TopBar
          initials={profile?.initials ?? 'G'}
          onOpenMenu={topBar.openMenu}
          onOpenNotifications={topBar.openNotifications}
          onOpenProfile={topBar.openProfile}
        />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 110 }}
          showsVerticalScrollIndicator={false}
        >
          <Box width="100%" px="md" pt="md" alignItems="center" gap="md">
            <Box
              width={96}
              height={96}
              borderRadius="full"
              bg="primary"
              alignItems="center"
              justifyContent="center"
            >
              <Text variant="display" color="white">
                {profile?.initials ?? 'G'}
              </Text>
            </Box>
            <Box alignItems="center">
              <Text variant="h2">{profile?.name ?? 'Gabriel'}</Text>
              <Text variant="caption" color="textSecondary">
                {profile?.email ?? 'dev@dev.com'}
              </Text>
            </Box>

            <Box flexDirection="row" gap="sm" width="100%">
              {dynamicStats.map((stat) => (
                <Box
                  key={stat.label}
                  flex={1}
                  bg="surface"
                  borderRadius="md"
                  borderWidth={1}
                  borderColor="cardBorder"
                  py="md"
                  alignItems="center"
                >
                  <Text variant="h3">{stat.value}</Text>
                  <Text variant="caption" color="textSecondary">
                    {stat.label}
                  </Text>
                </Box>
              ))}
            </Box>

            <Box
              bg="surface"
              borderRadius="md"
              borderWidth={1}
              borderColor="cardBorder"
              p="md"
              width="100%"
              gap="md"
            >
              <Box flexDirection="row" alignItems="center" justifyContent="space-between">
                <Text variant="bodyStrong">Total pago</Text>
                <Pill label={formatCurrency(totalPaid)} tone="success" />
              </Box>
              <Box flexDirection="row" alignItems="center" justifyContent="space-between">
                <Text variant="bodyStrong">Pontualidade</Text>
                <Pill
                  label={`${punctuality}%`}
                  tone={punctuality >= 80 ? 'success' : punctuality >= 60 ? 'warning' : 'danger'}
                />
              </Box>
              <Box flexDirection="row" alignItems="center" justifyContent="space-between">
                <Text variant="bodyStrong">Grupos</Text>
                <Pill label={String(groups.length)} tone="primary" />
              </Box>
            </Box>

            <Box width="100%" gap="sm">
              <Button title="Editar perfil" onPress={handleEdit} variant="outline" fullWidth />
              <Button
                title="Histórico de alterações"
                onPress={() => navigation.navigate('History')}
                variant="outline"
                fullWidth
              />
              <Button
                title="Suporte"
                onPress={() => navigation.navigate('Support')}
                variant="outline"
                fullWidth
              />
              <Button title="Sair" onPress={handleLogout} variant="danger" fullWidth />
            </Box>
          </Box>
        </ScrollView>
      </Box>
      <ProfileModal
        visible={editing}
        initials={profile?.initials ?? 'G'}
        name={profile?.name ?? 'Gabriel'}
        email={profile?.email ?? 'dev@dev.com'}
        stats={dynamicStats}
        onClose={() => setEditing(false)}
        onSave={handleSave}
      />
    </SafeAreaView>
  );
}

export default ProfileScreen;
