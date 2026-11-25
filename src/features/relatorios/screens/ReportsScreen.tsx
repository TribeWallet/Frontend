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
import { Box, Text, useTheme } from '../../../theme';
import { getErrorMessage } from '../../../services/api/apiClient';
import { MetodoPagamento } from '../../../types/ApiResponse';
import { shareReport } from '../services/reportSharing';
import { getGroupReport, getUserReport } from '../services/reportService';
import { useTopBarActions } from '../../../hooks/useTopBarActions';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAuthStore } from '../../auth/stores/authStore';
import { useUserStore } from '../../usuario/stores/userStore';
import { MoneyValue } from '../../../components/MoneyValue';
import { MaskedText } from '../../../components/MaskedText';
import { useFormatMoney } from '../../../hooks/useFormatMoney';
import { isoToBR } from '../../../utils/date';

const paymentMethodLabelKeys: Record<number, string> = {
  [MetodoPagamento.pix]: 'payments.methodPix',
  [MetodoPagamento.dinheiro]: 'payments.methodDinheiro',
  [MetodoPagamento.cartaoCredito]: 'payments.methodCredito',
  [MetodoPagamento.cartaoDebito]: 'payments.methodDebito',
  [MetodoPagamento.transferenciaBancaria]: 'payments.methodTransferencia',
  [MetodoPagamento.boleto]: 'payments.methodBoleto',
};

export function ReportsScreen() {
  const { width } = useWindowDimensions();
  const topBar = useTopBarActions();
  const profile = useUserStore((state) => state.profile);
  const usuarioToken = useAuthStore((state) => state.user?.id);
  const theme = useTheme();
  const { t } = useTranslation();
  const formatMoney = useFormatMoney();

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
      { id: 'all', label: t('common.allGroups') },
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
      Alert.alert(t('common.errorTitle'), t('reports.sessionUserError'));
      return;
    }

    setExporting(true);
    try {
      await shareReport(usuarioToken, groupFilter === 'all' ? undefined : groupFilter);
    } catch (error) {
      Alert.alert(
        t('common.errorTitle'),
        error instanceof Error ? error.message : t('reports.exportError'),
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
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
              title={t('reports.title')}
              subtitle={t('reports.subtitle')}
            >
              <Button
                title={t('reports.export')}
                onPress={handleShare}
                loading={exporting}
                fullWidth
              />
            </ScreenHeader>

            <Box mb="md">
              <Select
                label={t('reports.filterGroup')}
                placeholder={t('common.allGroups')}
                value={groupFilter}
                onChange={setGroupFilter}
                options={groupOptions}
              />
            </Box>

            {reportLoading ? (
              <Box alignItems="center" py="xl">
                <Loading label={t('common.loading')} />
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
                <Text variant="captionStrong" color="primary">{t('reports.paid')}</Text>
                <MoneyValue amount={report.totalPago} variant="h2" />
              </Box>
              <Box alignItems="flex-end">
                <Text variant="captionStrong" color="danger">{t('reports.open')}</Text>
                <MoneyValue amount={report.totalDevido} variant="h2" />
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
              <Text variant="bodyStrong" mb="sm">{t('reports.paymentsByCategory')}</Text>
              {report.totaisPagosPorCategorias.length === 0 ? (
                <Text variant="caption" color="textSecondary">{t('reports.noPaymentsRegistered')}</Text>
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
                    <MoneyValue amount={valorPagoTotal} />
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
              <Text variant="bodyStrong" mb="sm">{t('reports.paymentsByGroup')}</Text>
              {(userReportQuery.data?.grupos.length ?? 0) === 0 ? (
                <Text variant="caption" color="textSecondary">{t('reports.noPaymentsRegistered')}</Text>
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
                    <MoneyValue amount={totalPago} />
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
              <Text variant="bodyStrong" mb="sm">{t('reports.commitmentsOpen')}</Text>
              {report.compromissosEmAberto.length === 0 ? (
                <Text variant="caption" color="textSecondary">{t('reports.nothingOpen')}</Text>
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
                    <Pill label={formatMoney(item.valorEmAberto)} tone="primary" />
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
              <Text variant="bodyStrong" mb="sm">{t('reports.paymentsByMethod')}</Text>
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
                      {t(paymentMethodLabelKeys[metodoPagamento] ?? 'payments.methodPix')}
                    </Text>
                    <Text variant="bodyStrong">
                      <MoneyValue amount={totalPago} />
                    </Text>
                  </Box>
                ))
              )}
            </Box>

            <Text variant="caption" color="textSecondary" mb="md">
              {t('reports.sharedAsPDF')}
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
