import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '../../../../components/Button';
import { EmptyState } from '../../../../components/EmptyState';
import { ScreenHeader } from '../../../../components/ScreenHeader';
import { Select, SelectOption } from '../../../../components/Select';
import { TopBar } from '../../../../components/TopBar';
import { CommitmentCard } from '../../components/CommitmentCard/CommitmentCard';
import { useCommitments } from '../../../../hooks/useCommitments';
import { useNotifications } from '../../../../hooks/useNotifications';
import { useUserStore } from '../../../usuario/stores/userStore';
import { useTopBarActions } from '../../../../hooks/useTopBarActions';
import type { CommitmentStatus } from '../../types/Commitment';
import type { RootStackParamList } from '../../../../navigation/types';
import { Box, Text, PressableBox } from '../../../../theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type FilterKey = 'todos' | CommitmentStatus;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'pending', label: 'Pendentes' },
  { key: 'partial', label: 'Parcial' },
  { key: 'paid', label: 'Pagos' },
];

export function CompromissosScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { commitments } = useCommitments();
  const { unreadCount } = useNotifications();
  const profile = useUserStore((state) => state.profile);
  const topBar = useTopBarActions();
  const { width } = useWindowDimensions();
  const isSmallPhone = width < 360;
  const [filter, setFilter] = useState<FilterKey>('todos');
  const [groupFilter, setGroupFilter] = useState<string>('all');

  const groups = useMemo(() => {
    const set = new Map<string, string>();
    commitments.forEach((c) => set.set(c.groupId, c.groupName));
    return Array.from(set.entries()).map(([id, name]) => ({ id, name }));
  }, [commitments]);

  const groupOptions = useMemo<SelectOption[]>(
    () => [
      { id: 'all', label: 'Todos os grupos' },
      ...groups.map((group) => ({ id: group.id, label: group.name })),
    ],
    [groups],
  );

  const filtered = useMemo(() => {
    return commitments.filter((c) => {
      const matchesStatus = filter === 'todos' || c.status === filter;
      const matchesGroup = groupFilter === 'all' || c.groupId === groupFilter;
      return matchesStatus && matchesGroup;
    });
  }, [commitments, filter, groupFilter]);

  const handleNew = useCallback(() => {
    navigation.navigate('NewCommitment');
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
              title="Compromissos"
              subtitle="Despesas, contas e compromissos do grupo"
            >
              <Button
                title="Novo compromisso"
                onPress={handleNew}
                fullWidth
              />
            </ScreenHeader>

            <Box flexDirection="row" gap="xs" mb="sm" flexWrap="wrap">
              {FILTERS.map((option) => {
                const active = option.key === filter;
                return (
                  <PressableBox
                    key={option.key}
                    onPress={() => setFilter(option.key)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <Box
                      px="md"
                      py="xs"
                      borderRadius="full"
                      bg={active ? 'primary' : 'surface'}
                      borderWidth={1}
                      borderColor={active ? 'primary' : 'border'}
                    >
                      <Text variant="captionStrong" color={active ? 'white' : 'textSecondary'}>
                        {option.label}
                      </Text>
                    </Box>
                  </PressableBox>
                );
              })}
            </Box>

            <Select
              label="Filtrar por grupo"
              placeholder="Todos os grupos"
              value={groupFilter}
              onChange={setGroupFilter}
              options={groupOptions}
            />

            {filtered.length === 0 ? (
              <EmptyState
                title="Nenhum compromisso"
                description="Crie o primeiro compromisso para começar a dividir."
                actionLabel="Criar compromisso"
                onAction={handleNew}
              />
            ) : (
              filtered.map((commitment) => (
                <CommitmentCard
                  key={commitment.id}
                  commitment={commitment}
                  onPress={(id) => navigation.navigate('CommitmentDetail', { id })}
                />
              ))
            )}
          </Box>
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
}

export default CompromissosScreen;
