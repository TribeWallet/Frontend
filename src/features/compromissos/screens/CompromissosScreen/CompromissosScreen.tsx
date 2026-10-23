import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '../../../../components/Button';
import { EmptyState } from '../../../../components/EmptyState';
import { ScreenHeader } from '../../../../components/ScreenHeader';
import { Loading } from '../../../../components/Loading';
import { Select, SelectOption } from '../../../../components/Select';
import { TopBar } from '../../../../components/TopBar';
import { CommitmentCard } from '../../components/CommitmentCard/CommitmentCard';
import { useCommitments } from '../../../../hooks/useCommitments';
import { useGroups } from '../../../../hooks/useGroups';
import { useNotifications } from '../../../../hooks/useNotifications';
import { useUserStore } from '../../../usuario/stores/userStore';
import { useTopBarActions } from '../../../../hooks/useTopBarActions';
import { diffDays } from '../../../../utils/date';
import type { CommitmentStatus } from '../../types/Commitment';
import type { MainTabParamList, RootStackParamList } from '../../../../navigation/types';
import { Box, Text, PressableBox } from '../../../../theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type CommitmentsRoute = RouteProp<MainTabParamList, 'Commitments'>;

type FilterKey = 'todos' | CommitmentStatus | 'vencidos';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'pending', label: 'Pendentes' },
  { key: 'partial', label: 'Parcial' },
  { key: 'paid', label: 'Pagos' },
  { key: 'vencidos', label: 'Vencidos' },
];

export function CompromissosScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CommitmentsRoute>();
  const { commitments, commitmentsLoading, commitmentsError, refetchCommitments } =
    useCommitments();
  const { groups } = useGroups();
  const { unreadCount } = useNotifications();
  const profile = useUserStore((state) => state.profile);
  const topBar = useTopBarActions();
  const { width } = useWindowDimensions();
  const isSmallPhone = width < 360;
  const [filter, setFilter] = useState<FilterKey>(
    route.params?.filter === 'vencidos' ? 'vencidos' : 'todos',
  );
  const [groupFilter, setGroupFilter] = useState<string>('all');

  useEffect(() => {
    if (route.params?.filter === 'vencidos') {
      setFilter('vencidos');
    }
  }, [route.params?.filter]);

  const groupOptions = useMemo<SelectOption[]>(
    () => [
      { id: 'all', label: 'Todos os grupos' },
      ...groups.map((group) => ({ id: group.id, label: group.name })),
    ],
    [groups],
  );

  const isVencido = useCallback(
    (commitment: (typeof commitments)[number]) => {
      const days = diffDays(commitment.dueDate);
      return (
        commitment.status !== 'paid' && days !== null && days < 0
      );
    },
    [],
  );

  const filtered = useMemo(() => {
    return commitments.filter((c) => {
      const matchesStatus =
        filter === 'todos' ||
        (filter === 'vencidos' ? isVencido(c) : c.status === filter);
      const matchesGroup = groupFilter === 'all' || c.groupId === groupFilter;
      return matchesStatus && matchesGroup;
    });
  }, [commitments, filter, groupFilter, isVencido]);

  const overdueCount = useMemo(
    () => commitments.filter((c) => isVencido(c)).length,
    [commitments, isVencido],
  );

  const handleNew = useCallback(() => {
    navigation.navigate('NewCommitment');
  }, [navigation]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFB' }} edges={['top']}>
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
              title="Compromissos"
              subtitle="Despesas, contas e compromissos do grupo"
            >
              <Button
                title="Novo compromisso"
                onPress={handleNew}
                fullWidth
              />
            </ScreenHeader>

            <Box flexDirection="row" gap="xs" mb="sm" flexWrap="wrap" alignItems="center">
              {FILTERS.map((option) => {
                const active = option.key === filter;
                const isOverdueChip = option.key === 'vencidos';
                const showCount = isOverdueChip && overdueCount > 0;
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
                      bg={active ? (isOverdueChip ? 'danger' : 'primary') : 'surface'}
                      borderWidth={1}
                      borderColor={
                        active
                          ? isOverdueChip
                            ? 'danger'
                            : 'primary'
                          : isOverdueChip && showCount
                            ? 'danger'
                            : 'border'
                      }
                    >
                      <Text
                        variant="captionStrong"
                        color={
                          active
                            ? 'white'
                            : isOverdueChip && showCount
                              ? 'danger'
                              : 'textSecondary'
                        }
                      >
                        {option.label}
                        {showCount ? ` (${overdueCount})` : ''}
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

            {commitmentsLoading ? (
              <Loading label="Carregando compromissos..." />
            ) : commitmentsError ? (
              <EmptyState
                title="Não foi possível carregar os compromissos"
                description={commitmentsError}
                actionLabel="Tentar novamente"
                onAction={refetchCommitments}
              />
            ) : filtered.length === 0 ? (
              <EmptyState
                title={filter === 'vencidos' ? 'Nenhum compromisso vencido' : 'Nenhum compromisso'}
                description={
                  filter === 'vencidos'
                    ? 'Tudo em dia: nenhum compromisso passou da data sem estar quitado.'
                    : 'Crie o primeiro compromisso para começar a dividir.'
                }
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
