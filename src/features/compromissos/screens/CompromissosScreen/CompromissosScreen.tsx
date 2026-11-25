import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, useWindowDimensions, TextInput } from 'react-native';
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
import { useCommitmentSummaries } from '../../hooks/useCommitmentSummaries';
import { useGroups } from '../../../../hooks/useGroups';
import { useNotifications } from '../../../../hooks/useNotifications';
import { useUserStore } from '../../../usuario/stores/userStore';
import { useTopBarActions } from '../../../../hooks/useTopBarActions';
import { isCommitmentOverdue } from '../../../../utils/date';
import type { CommitmentStatus } from '../../types/Commitment';
import type { MainTabParamList, RootStackParamList } from '../../../../navigation/types';
import { Box, Text, PressableBox, useTheme } from '../../../../theme';
import { Input } from '../../../../components/Input';
import { useTranslation } from '../../../../hooks/useTranslation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type CommitmentsRoute = RouteProp<MainTabParamList, 'Commitments'>;

type FilterKey = 'todos' | CommitmentStatus | 'vencidos';

export function CompromissosScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CommitmentsRoute>();
  const { commitments, commitmentsLoading, commitmentsError, refetchCommitments } =
    useCommitmentSummaries();
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
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useTheme();
  const { t } = useTranslation();

  const filters = useMemo<{ key: FilterKey; label: string }[]>(
    () => [
      { key: 'todos', label: t('commitments.filterAll') },
      { key: 'pending', label: t('commitments.filterPending') },
      { key: 'partial', label: t('commitments.filterPartial') },
      { key: 'paid', label: t('commitments.filterPaid') },
      { key: 'vencidos', label: t('commitments.filterOverdue') },
    ],
    [t],
  );

  useEffect(() => {
    if (route.params?.filter === 'vencidos') {
      setFilter('vencidos');
    }
  }, [route.params?.filter]);

  const groupOptions = useMemo<SelectOption[]>(
    () => [
      { id: 'all', label: t('common.allGroups') },
      ...groups.map((group) => ({ id: group.id, label: group.name })),
    ],
    [groups],
  );

  const isVencido = useCallback(
    (commitment: (typeof commitments)[number]) => isCommitmentOverdue(commitment),
    [],
  );

  const filtered = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return commitments.filter((c) => {
      const matchesStatus =
        filter === 'todos' ||
        (filter === 'vencidos' ? isVencido(c) : c.status === filter);
      const matchesGroup = groupFilter === 'all' || c.groupId === groupFilter;
      const matchesSearch =
        !query ||
        c.name.toLowerCase().includes(query) ||
        c.groupName.toLowerCase().includes(query) ||
        c.category?.toLowerCase().includes(query);
      return matchesStatus && matchesGroup && matchesSearch;
    });
  }, [commitments, filter, groupFilter, isVencido, searchQuery]);

  const overdueCount = useMemo(
    () => commitments.filter((c) => isVencido(c)).length,
    [commitments, isVencido],
  );

  const handleNew = useCallback(() => {
    navigation.navigate('NewCommitment', {
      groupId: groupFilter !== 'all' ? groupFilter : undefined,
    });
  }, [navigation, groupFilter]);

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
              title={t('commitments.title')}
              subtitle={t('commitments.subtitle')}
            >
              <Button
                title={t('commitments.newCommitment')}
                onPress={handleNew}
                fullWidth
              />
            </ScreenHeader>

            <Box flexDirection="row" gap="xs" mb="sm" flexWrap="wrap" alignItems="center">
              {filters.map((option) => {
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

            <Box mb="md">
              <Input
                label={t('commitments.searchLabel')}
                placeholder={t('commitments.searchPlaceholder')}
                value={searchQuery}
                onChangeText={setSearchQuery}
                helperText={
                  searchQuery.length > 0
                    ? t('commitments.searchHelper', { query: searchQuery })
                    : undefined
                }
              />
            </Box>

            <Box mb="md">
              <Select
                label={t('commitments.filterGroup')}
                placeholder={t('commitments.placeholderGroup')}
                value={groupFilter}
                onChange={setGroupFilter}
                options={groupOptions}
              />
            </Box>

            {commitmentsLoading ? (
              <Loading label={t('loading.commitments')} />
            ) : commitmentsError ? (
              <EmptyState
                title={t('common.errorTitle')}
                description={commitmentsError}
                actionLabel={t('common.tryAgain')}
                onAction={refetchCommitments}
              />
            ) : filtered.length === 0 ? (
              <EmptyState
                title={
                  filter === 'vencidos'
                    ? t('commitments.noOverdueCommitments')
                    : t('commitments.noCommitments')
                }
                description={
                  filter === 'vencidos'
                    ? t('commitments.noOverdueCommitmentsDesc')
                    : t('commitments.noCommitmentsDesc')
                }
                actionLabel={t('commitments.createCommitment')}
                onAction={handleNew}
              />
            ) : (
              filtered.map((commitment) => (
                <CommitmentCard
                  key={commitment.id}
                  commitment={commitment}
                  onPress={(id) => {
                    const selected = commitments.find((item) => item.id === id);
                    navigation.navigate('CommitmentDetail', {
                      id,
                      groupId: selected?.groupId,
                      groupName: selected?.groupName,
                    });
                  }}
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
