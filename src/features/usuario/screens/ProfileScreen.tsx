import React, { useCallback, useMemo, useState } from 'react';
import { Image, ScrollView, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { TopBar } from '../../../components/TopBar';
import { Button } from '../../../components/Button';
import { Pill } from '../../../components/Pill';
import { Box, Text, useTheme } from '../../../theme';
import { ProfileModal } from '../components/ProfileModal/ProfileModal';
import { useUserStore } from '../stores/userStore';
import { useSaveProfile } from '../hooks/useSaveProfile';
import { useAuthStore } from '../../auth/stores/authStore';
import {
  useAppCommitments,
  useAppGroups,
  useAppPayments,
} from '../../../contexts/AppContext';
import { useTopBarActions } from '../../../hooks/useTopBarActions';
import { useTranslation } from '../../../hooks/useTranslation';
import type { RootStackParamList } from '../../../navigation/types';
import { MoneyValue } from '../../../components/MoneyValue';
import { environment } from '../../../config/environment';
import { useFormatMoney } from '../../../hooks/useFormatMoney';
import { useAppDashboard } from '../../dashboard/hooks/useDashboard';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

export function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const user = useAuthStore((state) => state.user);
  const setStats = useUserStore((state) => state.setStats);
  const saveProfile = useSaveProfile();
  const clearProfile = useUserStore((state) => state.logout);
  const authLogout = useAuthStore((state) => state.logout);
  const { groups } = useAppGroups();
  const { commitments } = useAppCommitments();
  const { payments } = useAppPayments();
  const topBar = useTopBarActions();
  const [editing, setEditing] = useState(false);
  const theme = useTheme();
  const { t } = useTranslation();
  const formatMoney = useFormatMoney();
  const { data, isLoading, isError: dashboardError, refetch } = useAppDashboard();

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const totalPaid = data?.valorTotalPago ?? payments.reduce((sum, p) => sum + p.amount, 0);
  const punctuality = data?.taxaDePontualidade? (data.taxaDePontualidade)*100 : 0;
  const totalGroups = data?.gruposAtivosCount ?? groups.length;
  const dynamicStats = useMemo(
    () => [
      { value: String(data?.gruposAtivosCount ?? 0), label: t('common.groups') },
      { value: String(data?.compromissosCountTotal ?? 0), label: t('commitments.title') },
      { value: String(data?.pagamentosCountTotal ?? 0), label: t('payments.title') },
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
    async (data: { name: string; email: string }) => {
      await saveProfile(data);
      setEditing(false);
    },
    [saveProfile],
  );

  const handleEdit = () => {
    setEditing(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <Box flex={1} width="100%" maxWidth={430} alignSelf="center" bg="background">
        <TopBar
          initials={user?.initials ?? ''}
          onOpenMenu={topBar.openMenu}
          onOpenNotifications={topBar.openNotifications}
          onOpenProfile={topBar.openProfile}
          imageUrl={user?.imageUrl ? `${environment.mediaUrl}/${user.imageUrl}` : undefined}
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
              overflow="hidden"
            >
              {user?.imageUrl ? (
                <Image
                  source={{ uri: `${environment.mediaUrl}/${user.imageUrl}` }}
                  resizeMode="cover"
                  style={{ width: 96, height: 96 }}
                />
              ) : (
                <Text variant="display" color="white">
                  {user?.initials ?? ''}
                </Text>
              )}
            </Box>
            <Box alignItems="center">
              <Text variant="h2">{user?.name ?? ''}</Text>
              <Text variant="caption" color="textSecondary">
                {user?.email ?? ''}
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
                <Text variant="bodyStrong">{t('profile.totalPaid')}</Text>
                <Pill label={formatMoney(totalPaid)} tone="success" />
              </Box>
              <Box flexDirection="row" alignItems="center" justifyContent="space-between">
                <Text variant="bodyStrong">{t('profile.punctuality')}</Text>
                <Pill
                  label={`${punctuality}%`}
                  tone={punctuality >= 80 ? 'success' : punctuality >= 60 ? 'warning' : 'danger'}
                />
              </Box>
              <Box flexDirection="row" alignItems="center" justifyContent="space-between">
                <Text variant="bodyStrong">{t('common.groups')}</Text>
                <Pill label={String(totalGroups)} tone="primary" />
              </Box>
            </Box>

            <Box width="100%" gap="sm">
              <Button title={t('profile.editProfile')} onPress={handleEdit} variant="outline" fullWidth />
              <Button
                title={t('profile.history')}
                onPress={() => navigation.navigate('History')}
                variant="outline"
                fullWidth
              />
              <Button
                title={t('profile.support')}
                onPress={() => navigation.navigate('Support')}
                variant="outline"
                fullWidth
              />
              <Button title={t('profile.logout')} onPress={handleLogout} variant="danger" fullWidth />
            </Box>
          </Box>
        </ScrollView>
      </Box>
      <ProfileModal
        visible={editing}
        name={user?.name ?? ''}
        email={user?.email ?? ''}
        stats={dynamicStats}
        emailEditable={false}
        onClose={() => setEditing(false)}
        onSave={handleSave}
      />
    </SafeAreaView>
  );
}

export default ProfileScreen;
