import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { TopBar } from '../../../components/TopBar';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { Box, Text } from '../../../theme';
import { ProfileModal } from '../components/ProfileModal/ProfileModal';
import { useUserStore } from '../stores/userStore';
import { useTopBarActions } from '../../../hooks/useTopBarActions';
import type { RootStackParamList } from '../../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditProfile'>;

export function EditProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const profile = useUserStore((state) => state.profile);
  const setProfile = useUserStore((state) => state.setProfile);
  const topBar = useTopBarActions();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFB' }} edges={['top']}>
      <Box flex={1} width="100%" maxWidth={430} alignSelf="center" bg="background">
        <TopBar
          initials={profile?.initials ?? 'G'}
          onOpenMenu={topBar.openMenu}
          onOpenNotifications={topBar.openNotifications}
          onOpenProfile={topBar.openProfile}
        />
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text variant="h2" mb="sm">Editar perfil</Text>
          <Text variant="bodySmall" color="textSecondary" mb="md">
            Atualize seus dados pessoais. Eles aparecem no menu lateral e nos relatórios.
          </Text>
          <ProfileModal
            visible
            initials={profile?.initials ?? 'G'}
            name={profile?.name ?? 'Gabriel'}
            email={profile?.email ?? 'dev@dev.com'}
            stats={[]}
            onClose={() => navigation.goBack()}
            onSave={(data) => {
              setProfile({
                id: profile?.id ?? 'user-1',
                initials: data.initials,
                name: data.name,
                email: data.email,
                notificationCount: profile?.notificationCount ?? 0,
              });
              navigation.goBack();
            }}
          />
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
}

export default EditProfileScreen;
