import React, { useMemo, useState } from 'react';
import { ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TopBar } from '../../../components/TopBar';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { Pill } from '../../../components/Pill';
import { Select, SelectOption } from '../../../components/Select';
import { Button } from '../../../components/Button';
import { Box, Text } from '../../../theme';
import {
  useAppCommitments,
  useAppGroups,
  useAppPayments,
} from '../../../contexts/AppContext';
import { buildReport } from '../services/reportBuilder';
import { shareReport } from '../services/reportSharing';
import { useTopBarActions } from '../../../hooks/useTopBarActions';
import { useUserStore } from '../../usuario/stores/userStore';
import { formatCurrency } from '../../../utils/currency';

const formatOptions = [
  { id: 'pdf', label: 'Exportar como PDF' },
  { id: 'docx', label: 'Exportar como DOCX' },
];

export function ReportsScreen() {
  const { width } = useWindowDimensions();
  const topBar = useTopBarActions();
  const profile = useUserStore((state) => state.profile);
  const groups = useAppGroups().groups;
  const commitments = useAppCommitments().commitments;
  const payments = useAppPayments().payments;

  const [groupFilter, setGroupFilter] = useState<string>('all');

  const groupOptions = useMemo<SelectOption[]>(
    () => [
      { id: 'all', label: 'Todos os grupos' },
      ...groups.map((group) => ({ id: group.id, label: group.name })),
    ],
    [groups],
  );

  const isSmallPhone = width < 360;

  const summary = useMemo(() => {
    const filteredCommitments = groupFilter === 'all'
      ? commitments
      : commitments.filter((c) => c.groupId === groupFilter);
    const filteredPayments = groupFilter === 'all'
      ? payments
      : payments.filter((p) => p.groupId === groupFilter);
    return buildReport(groups, filteredCommitments, filteredPayments);
  }, [groupFilter, groups, commitments, payments]);

  const handleShare = () => {
    shareReport(summary);
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
          <Box width="100%" px={isSmallPhone ? 'sm' : 'md'} pt="md">
            <ScreenHeader
              title="Relatórios"
              subtitle="Exporte um resumo financeiro completo"
            >
              <Button
                title="Exportar relatório"
                onPress={handleShare}
                fullWidth
              />
            </ScreenHeader>

            <Select
              label="Filtrar por grupo"
              placeholder="Todos os grupos"
              value={groupFilter}
              onChange={setGroupFilter}
              options={groupOptions}
            />

            <Box
              flexDirection="row"
              justifyContent="space-between"
              bg="primaryLight"
              borderRadius="md"
              p="md"
              mb="md"
            >
              <Box>
                <Text variant="captionStrong" color="primary">PAGO</Text>
                <Text variant="h2" color="primary">{formatCurrency(summary.totalPaid)}</Text>
              </Box>
              <Box alignItems="flex-end">
                <Text variant="captionStrong" color="danger">EM ABERTO</Text>
                <Text variant="h2" color="danger">{formatCurrency(summary.totalOpen)}</Text>
              </Box>
            </Box>

            <Box
              bg="surface"
              borderRadius="md"
              borderWidth={1}
              borderColor="cardBorder"
              p="md"
              mb="md"
            >
              <Text variant="bodyStrong" mb="sm">Pagamentos por categoria</Text>
              {summary.byCategory.length === 0 ? (
                <Text variant="caption" color="textSecondary">Nenhum pagamento registrado.</Text>
              ) : (
                summary.byCategory.map(({ label, total }) => (
                  <Box
                    key={label}
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-between"
                    py="xs"
                    borderTopWidth={1}
                    borderColor="border"
                  >
                    <Text variant="body">{label}</Text>
                    <Text variant="bodyStrong">{formatCurrency(total)}</Text>
                  </Box>
                ))
              )}
            </Box>

            <Box
              bg="surface"
              borderRadius="md"
              borderWidth={1}
              borderColor="cardBorder"
              p="md"
              mb="md"
            >
              <Text variant="bodyStrong" mb="sm">Pagamentos por grupo</Text>
              {summary.byGroup.length === 0 ? (
                <Text variant="caption" color="textSecondary">Nenhum pagamento registrado.</Text>
              ) : (
                summary.byGroup.map(({ groupName, total }) => (
                  <Box
                    key={groupName}
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-between"
                    py="xs"
                    borderTopWidth={1}
                    borderColor="border"
                  >
                    <Text variant="body">{groupName}</Text>
                    <Text variant="bodyStrong">{formatCurrency(total)}</Text>
                  </Box>
                ))
              )}
            </Box>

            <Box
              bg="surface"
              borderRadius="md"
              borderWidth={1}
              borderColor="cardBorder"
              p="md"
              mb="md"
            >
              <Text variant="bodyStrong" mb="sm">Próximos vencimentos</Text>
              {summary.upcoming.length === 0 ? (
                <Text variant="caption" color="textSecondary">Sem vencimentos previstos.</Text>
              ) : (
                summary.upcoming.map((item, index) => (
                  <Box
                    key={`${item.name}-${index}`}
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-between"
                    py="xs"
                    borderTopWidth={index === 0 ? 0 : 1}
                    borderColor="border"
                  >
                    <Box flex={1} pr="sm">
                      <Text variant="bodyStrong">{item.name}</Text>
                      <Text variant="caption" color="textSecondary">
                        {item.groupName} • {item.dueDate}
                      </Text>
                    </Box>
                    <Pill label={formatCurrency(item.amount)} tone="primary" />
                  </Box>
                ))
              )}
            </Box>

            <Box flexDirection="row" gap="sm" mb="md">
              {formatOptions.map((option) => (
                <Box key={option.id} flex={1}>
                  <Button
                    title={option.label}
                    variant="outline"
                    fullWidth
                    onPress={handleShare}
                  />
                </Box>
              ))}
            </Box>

            <Text variant="caption" color="textSecondary" mb="md">
              O relatório é compartilhado como arquivo HTML/texto via apps
              instalados (e-mail, mensageria, drive). Você pode salvá-lo como PDF
              ou DOCX usando o destino de sua preferência.
            </Text>
          </Box>
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
}

export default ReportsScreen;
