import React, { useCallback, useState } from 'react';
import { ScrollView, TextInput, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '../../../../components/Button';
import { ScreenHeader } from '../../../../components/ScreenHeader';
import { TopBar } from '../../../../components/TopBar';
import { EmptyState } from '../../../../components/EmptyState';
import { Loading } from '../../../../components/Loading';
import { Select, SelectOption } from '../../../../components/Select';
import { GroupCard } from '../../components/GroupCard/GroupCard';
import { Box, useTheme } from '../../../../theme';
import { useGroups } from '../../../../hooks/useGroups';
import { useNotifications } from '../../../../hooks/useNotifications';
import { useUserStore } from '../../../usuario/stores/userStore';
import { useTopBarActions } from '../../../../hooks/useTopBarActions';
import { useTranslation } from '../../../../hooks/useTranslation';
import type { RootStackParamList } from '../../../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function GruposScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { groups, groupsLoading, groupsError, refetchGroups } = useGroups();
  const { unreadCount } = useNotifications();
  const profile = useUserStore((state) => state.profile);
  const topBar = useTopBarActions();
  const { width } = useWindowDimensions();
  const isSmallPhone = width < 360;
  const [search, setSearch] = useState('');
  const [toneFilter, setToneFilter] = useState('all');
  const { t } = useTranslation();

  const TONE_FILTERS: SelectOption[] = [
    { id: 'all', label: t('grupos.filterAll') },
    { id: 'blue', label: t('grupos.filterCasa') },
    { id: 'green', label: t('grupos.filterViagem') },
    { id: 'family', label: t('grupos.filterFamilia') },
  ];
  const theme = useTheme();

  const filteredGroups = groups.filter((group) => {
    const matchesSearch = group.name.toLowerCase().includes(search.toLowerCase());
    const matchesTone = toneFilter === 'all' || group.tone === toneFilter;
    return matchesSearch && matchesTone;
  });

  const handleCreate = useCallback(() => {
    navigation.navigate('NewGroup');
  }, [navigation]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <Box flex={1} width="100%" maxWidth={430} alignSelf="center" bg="background">
        <TopBar
          initials={profile?.initials ?? ''}
          notificationCount={unreadCount}
          onOpenMenu={topBar.openMenu}
          onOpenNotifications={topBar.openNotifications}
          onOpenProfile={topBar.openProfile}
        />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 110 }}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Box width="100%" px={isSmallPhone ? 'sm' : 'md'} pt="md">
            <ScreenHeader
              title={t('grupos.title')}
              subtitle={t('grupos.subtitle')}
            >
              <Button
                title={t('grupos.createGroup')}
                onPress={handleCreate}
                fullWidth
              />
            </ScreenHeader>

            <Box gap="sm" mb="md">
              <TextInput
                style={{
                  backgroundColor: theme.colors.surface,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  paddingHorizontal: 16,
                  height: 48,
                  fontSize: 16,
                  color: theme.colors.text,
                }}
                value={search}
                onChangeText={setSearch}
                placeholder={t('grupos.searchGroups')}
                placeholderTextColor={theme.colors.textMuted}
              />

              <Select
                label={t('grupos.category')}
                placeholder={t('grupos.allCategories')}
                value={toneFilter}
                onChange={setToneFilter}
                options={TONE_FILTERS}
              />
            </Box>

            {groupsLoading ? (
              <Loading label={t('grupos.loading')} />
            ) : groupsError ? (
              <EmptyState
                title={t('grupos.errorTitle')}
                description={groupsError}
                actionLabel={t('common.tryAgain')}
                onAction={refetchGroups}
              />
            ) : filteredGroups.length === 0 ? (
              <EmptyState
                title={t('grupos.noGroups')}
                description={t('grupos.noGroupsDesc')}
                actionLabel={t('grupos.createGroup')}
                onAction={handleCreate}
              />
            ) : (
              filteredGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onPress={(id) => navigation.navigate('GroupDetail', { id })}
                />
              ))
            )}
          </Box>
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
}

export default GruposScreen;
