import React, { useCallback, useState } from 'react';
import { ScrollView, TextInput, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '../../../../components/Button';
import { ScreenHeader } from '../../../../components/ScreenHeader';
import { TopBar } from '../../../../components/TopBar';
import { EmptyState } from '../../../../components/EmptyState';
import { Select, SelectOption } from '../../../../components/Select';
import { GroupCard } from '../../components/GroupCard/GroupCard';
import { Box } from '../../../../theme';
import { useGroups } from '../../../../hooks/useGroups';
import { useNotifications } from '../../../../hooks/useNotifications';
import { useUserStore } from '../../../usuario/stores/userStore';
import { useTopBarActions } from '../../../../hooks/useTopBarActions';
import type { RootStackParamList } from '../../../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const TONE_FILTERS: SelectOption[] = [
  { id: 'all', label: 'Todas categorias' },
  { id: 'blue', label: 'Casa' },
  { id: 'green', label: 'Viagem' },
  { id: 'family', label: 'Família' },
];

export function GruposScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { groups } = useGroups();
  const { unreadCount } = useNotifications();
  const profile = useUserStore((state) => state.profile);
  const topBar = useTopBarActions();
  const { width } = useWindowDimensions();
  const isSmallPhone = width < 360;
  const [search, setSearch] = useState('');
  const [toneFilter, setToneFilter] = useState('all');

  const filteredGroups = groups.filter((group) => {
    const matchesSearch = group.name.toLowerCase().includes(search.toLowerCase());
    const matchesTone = toneFilter === 'all' || group.tone === toneFilter;
    return matchesSearch && matchesTone;
  });

  const handleCreate = useCallback(() => {
    navigation.navigate('NewGroup');
  }, [navigation]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFB' }} edges={['top']}>
      <Box flex={1} width="100%" maxWidth={430} alignSelf="center" bg="background">
        <TopBar
          initials={profile?.initials ?? 'G'}
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
              title="Grupos"
              subtitle="Gerencie seus grupos financeiros"
            >
              <Button
                title="Criar grupo"
                onPress={handleCreate}
                fullWidth
              />
            </ScreenHeader>

            <Box gap="sm" mb="md">
              <TextInput
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#DFE4E7',
                  paddingHorizontal: 16,
                  height: 48,
                  fontSize: 16,
                  color: '#171717',
                }}
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar grupos..."
                placeholderTextColor="#8E969B"
              />

              <Select
                label="Categoria"
                placeholder="Todas categorias"
                value={toneFilter}
                onChange={setToneFilter}
                options={TONE_FILTERS}
              />
            </Box>

            {filteredGroups.length === 0 ? (
              <EmptyState
                title="Nenhum grupo encontrado"
                description="Ajuste a busca ou crie um novo grupo."
                actionLabel="Criar grupo"
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
