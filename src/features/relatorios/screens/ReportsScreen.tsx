import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';

import { TopBar } from '../../../components/TopBar';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { Pill } from '../../../components/Pill';
import { Select, SelectOption } from '../../../components/Select';
import { Button } from '../../../components/Button';
import { Loading } from '../../../components/Loading';
import { Box, Text } from '../../../theme';
import { getErrorMessage } from '../../../services/api/apiClient';
import { MetodoPagamento } from '../../../types/ApiResponse';
import { paymentMethodLabels } from '../../pagamentos/types/Payment';
import { shareReport } from '../services/reportSharing';
import { getGroupReport, getUserReport } from '../services/reportService';
import { useTopBarActions } from '../../../hooks/useTopBarActions';
import { useAuthStore } from '../../auth/stores/authStore';
import { useUserStore } from '../../usuario/stores/userStore';
import { formatCurrency } from '../../../utils/currency';
import { isoToBR } from '../../../utils/date';

const paymentMethodLabelsById: Record<number, string> = {
  [MetodoPagamento.pix]: paymentMethodLabels.pix,
  [MetodoPagamento.dinheiro]: paymentMethodLabels.dinheiro,
  [MetodoPagamento.cartaoCredito]: paymentMethodLabels.credito,
  [MetodoPagamento.cartaoDebito]: paymentMethodLabels.debito,
  [MetodoPagamento.transferenciaBancaria]: paymentMethodLabels.transferencia,
  [MetodoPagamento.boleto]: paymentMethodLabels.boleto,
};

export function ReportsScreen() {
  const { width } = useWindowDimensions();
  const topBar = useTopBarActions();
  const profile = useUserStore((state) => state.profile);
  const usuarioToken = useAuthStore((state) => state.user?.id);

  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [exporting, setExporting] = useState(false);

  const userReportQuery = useQuery({
    queryKey: ['relatorio', 'usuario', usuarioToken],
    queryFn: () => getUserReport(usuarioToken as string),
    enabled: Boolean(usuarioToken),
  });
  const groupReportQuery = useQuery({
    queryKey: ['relatorio', 'usuario', usuarioToken, 'grupo', groupFilter],
    queryFn: () => getGroupReport(usuarioToken as string, groupFilter),
    enabled: Boolean(usuarioToken) && groupFilter !== 'all',
  });

  const groupOptions = useMemo<SelectOption[]>(
    () => [
      { id: 'all', label: 'Todos os grupos' },
      ...(userReportQuery.data?.grupos ?? []).map((group) => ({
        id: group.grupoToken,
        label: group.nomeGrupo,
      })),
    ],
    [userReportQuery.data?.grupos],
  );

  const isSmallPhone = width < 360;
  const report = groupFilter === 'all' ? userReportQuery.data : groupReportQuery.data;
  const reportLoading = groupFilter === 'all'
    ? userReportQuery.isLoading
    : groupReportQuery.isLoading;
  const reportError = groupFilter === 'all'
    ? userReportQuery.error
    : groupReportQuery.error;

  const handleShare = async () => {
    if (!usuarioToken) {
      Alert.alert('Erro', 'Não foi possível identificar o usuário da sessão.');
      return;
    }

    setExporting(true);
    try {
      await shareReport(usuarioToken, groupFilter === 'all' ? undefined : groupFilter);
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof Error ? error.message : 'Não foi possível exportar o relatório.',
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFB' }} edges={['top']}>
      <Box flex={1} width="100%" maxWidth={430} alignSelf="center" bg="background">
        <TopBar
          initials={profile?.initials ?? ''}
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
                loading={exporting}
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

            {reportLoading ? (
              <Box alignItems="center" py="xl">
                <Loading label="Carregando relatório..." />
              </Box>
            ) : reportError ? (
              <Text variant="caption" color="danger" mb="md">
                {getErrorMessage(reportError)}
              </Text>
            ) : report ? (
              <>
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
                <Text variant="h2" color="primary">{formatCurrency(report.totalPago)}</Text>
              </Box>
              <Box alignItems="flex-end">
                <Text variant="captionStrong" color="danger">EM ABERTO</Text>
                <Text variant="h2" color="danger">{formatCurrency(report.totalDevido)}</Text>
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
              {report.totaisPagosPorCategorias.length === 0 ? (
                <Text variant="caption" color="textSecondary">Nenhum pagamento registrado.</Text>
              ) : (
                report.totaisPagosPorCategorias.map(({ categoria, valorPagoTotal }) => (
                  <Box
                    key={categoria}
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-between"
                    py="xs"
                    borderTopWidth={1}
                    borderColor="border"
                  >
                    <Text variant="body">{categoria}</Text>
                    <Text variant="bodyStrong">{formatCurrency(valorPagoTotal)}</Text>
                  </Box>
                ))
              )}
            </Box>

            {groupFilter === 'all' ? (
            <Box
              bg="surface"
              borderRadius="md"
              borderWidth={1}
              borderColor="cardBorder"
              p="md"
              mb="md"
            >
              <Text variant="bodyStrong" mb="sm">Pagamentos por grupo</Text>
              {(userReportQuery.data?.grupos.length ?? 0) === 0 ? (
                <Text variant="caption" color="textSecondary">Nenhum pagamento registrado.</Text>
              ) : (
                userReportQuery.data?.grupos.map(({ grupoToken, nomeGrupo, totalPago }) => (
                  <Box
                    key={grupoToken}
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-between"
                    py="xs"
                    borderTopWidth={1}
                    borderColor="border"
                  >
                    <Text variant="body">{nomeGrupo}</Text>
                    <Text variant="bodyStrong">{formatCurrency(totalPago)}</Text>
                  </Box>
                ))
              )}
            </Box>
            ) : null}

            <Box
              bg="surface"
              borderRadius="md"
              borderWidth={1}
              borderColor="cardBorder"
              p="md"
              mb="md"
            >
              <Text variant="bodyStrong" mb="sm">Compromissos em aberto</Text>
              {report.compromissosEmAberto.length === 0 ? (
                <Text variant="caption" color="textSecondary">Nada em aberto.</Text>
              ) : (
                report.compromissosEmAberto.map((item, index) => (
                  <Box
                    key={`${item.nome}-${index}`}
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-between"
                    py="xs"
                    borderTopWidth={index === 0 ? 0 : 1}
                    borderColor="border"
                  >
                    <Box flex={1} pr="sm">
                      <Text variant="bodyStrong">{item.nome}</Text>
                      <Text variant="caption" color="textSecondary">
                        {item.nomeGrupo} • {isoToBR(item.dataVencimento)}
                      </Text>
                    </Box>
                    <Pill label={formatCurrency(item.valorEmAberto)} tone="primary" />
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
              <Text variant="bodyStrong" mb="sm">Pagamentos por forma</Text>
              {report.totaisPagosPorMetodos.length === 0 ? (
                <Text variant="caption" color="textSecondary">Nenhum pagamento registrado.</Text>
              ) : (
                report.totaisPagosPorMetodos.map(({ metodoPagamento, totalPago }) => (
                  <Box
                    key={metodoPagamento}
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-between"
                    py="xs"
                    borderTopWidth={1}
                    borderColor="border"
                  >
                    <Text variant="body">
                      {paymentMethodLabelsById[metodoPagamento] ?? `Método ${metodoPagamento}`}
                    </Text>
                    <Text variant="bodyStrong">{formatCurrency(totalPago)}</Text>
                  </Box>
                ))
              )}
            </Box>

            <Text variant="caption" color="textSecondary" mb="md">
              O relatório é compartilhado como arquivo PDF pelos apps
              instalados (e-mail, mensageria, drive).
            </Text>
              </>
            ) : null}
          </Box>
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
}

export default ReportsScreen;
