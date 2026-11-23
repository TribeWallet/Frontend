import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { TopBar } from '../../../components/TopBar';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { Box, Text, useTheme } from '../../../theme';
import { ProfileModal } from '../components/ProfileModal/ProfileModal';
import { useUserStore } from '../stores/userStore';
import { useSaveProfile } from '../hooks/useSaveProfile';
import { useTopBarActions } from '../../../hooks/useTopBarActions';
import { useTranslation } from '../../../hooks/useTranslation';
import type { RootStackParamList } from '../../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditProfile'>;

export function EditProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const profile = useUserStore((state) => state.profile);
  const saveProfile = useSaveProfile();
  const topBar = useTopBarActions();
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <Box flex={1} width="100%" maxWidth={430} alignSelf="center" bg="background">
        <TopBar
          initials={profile?.initials ?? ''}
          onOpenMenu={topBar.openMenu}
          onOpenNotifications={topBar.openNotifications}
          onOpenProfile={topBar.openProfile}
        />
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text variant="h2" mb="sm">{t('settings.editProfile')}</Text>
          <Text variant="bodySmall" color="textSecondary" mb="md">
            {t('editProfile.subtitle')}
          </Text>
          <ProfileModal
            visible
            name={profile?.name ?? ''}
            email={profile?.email ?? ''}
            stats={[]}
            emailEditable={false}
            onClose={() => navigation.goBack()}
            onSave={async (data) => {
              await saveProfile(data);
              navigation.goBack();
            }}
          />
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
}

export default EditProfileScreen;
