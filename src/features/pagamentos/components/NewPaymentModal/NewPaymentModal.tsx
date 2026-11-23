import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { File as ExpoFile, Paths } from 'expo-file-system';
import { Modal } from '../../../../components/Modal';
import { Input } from '../../../../components/Input';
import { DatePicker } from '../../../../components/DatePicker/DatePicker';
import { Button } from '../../../../components/Button';
import { Select, SelectOption } from '../../../../components/Select';
import { Box, Text, PressableBox } from '../../../../theme';
import { useTranslation } from '../../../../hooks/useTranslation';
import {
  useAppCommitments,
  useAppGroups,
  useAppPayments,
} from '../../../../contexts/AppContext';
import { getErrorMessage } from '../../../../services/api/apiClient';
import { todayBR } from '../../../../utils/date';
import { MoneyValue } from '../../../../components/MoneyValue';
import { useFormatMoney } from '../../../../hooks/useFormatMoney';
import { maskDateBR, maskMoney, parseMoney } from '../../../../utils/masks';
import { useAuthStore } from '../../../auth/stores/authStore';
import type { AttachedFile } from '../../../../types/file';
import { paymentMethodOptions } from '../../services/paymentOptions';
import type { PaymentMethod } from '../../types/Payment';
import {
  defaultPaymentFormValues,
  paymentFormSchema,
  type PaymentFormValues,
} from '../../validations/paymentSchema';

interface NewPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated?: () => void;
  commitmentId?: string;
  shareId?: string;
}

export function NewPaymentModal({
  visible,
  onClose,
  onCreated,
  commitmentId,
  shareId,
}: NewPaymentModalProps) {
  const { groups } = useAppGroups();
  const { commitments } = useAppCommitments();
  const { addPayment } = useAppPayments();
  const user = useAuthStore((state) => state.user);
  const { t } = useTranslation();
  const formatMoney = useFormatMoney();

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [comprovante, setComprovante] = useState<AttachedFile | null>(null);

  const initialCommitment = useMemo(
    () => commitments.find((commitment) => commitment.id === commitmentId) ?? null,
    [commitments, commitmentId],
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema) as any,
    defaultValues: defaultPaymentFormValues,
    mode: 'onChange',
  });

  useEffect(() => {
    if (!visible) return;
    setSubmitError(null);
    setComprovante(null);
    reset({
      ...defaultPaymentFormValues,
      groupId: initialCommitment?.groupId ?? '',
      commitmentId: initialCommitment?.id ?? '',
      amount: '',
      date: todayBR(),
    });
  }, [visible, initialCommitment, reset]);

  const handleClose = useCallback(() => {
    reset(defaultPaymentFormValues);
    setSubmitError(null);
    setComprovante(null);
    onClose();
  }, [reset, onClose]);

  const watched = watch();

  const availableCommitments = useMemo(
    () =>
      commitments.filter(
        (commitment) => !watched.groupId || commitment.groupId === watched.groupId,
      ),
    [commitments, watched.groupId],
  );

  const selectedCommitment = commitments.find(
    (commitment) => commitment.id === watched.commitmentId,
  );

  const fixedShare = useMemo(
    () =>
      shareId
        ? commitments
            .find((commitment) => commitment.id === (commitmentId ?? watched.commitmentId))
            ?.splits.find((split) => split.shareId === shareId)
        : undefined,
    [commitments, shareId, commitmentId, watched.commitmentId],
  );

  const activeShare = useMemo(() => {
    if (fixedShare) return fixedShare;
    if (!selectedCommitment || !user) return undefined;
    return selectedCommitment.splits.find((split) => split.memberId === user.id);
  }, [fixedShare, selectedCommitment, user]);

  const remainingAmount = activeShare
    ? Math.max(0, activeShare.amount - activeShare.paidAmount)
    : 0;

  const groupOptions = useMemo<SelectOption[]>(
    () => groups.map((group) => ({ id: group.id, label: group.name })),
    [groups],
  );

  const commitmentOptions = useMemo<SelectOption[]>(
    () =>
      availableCommitments.map((commitment) => ({
        id: commitment.id,
        label: commitment.name,
        description: `Vence ${commitment.dueDate} • ${formatMoney(commitment.amount)}`,
      })),
    [availableCommitments],
  );

  const pickComprovante = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: false,
    });
    if (result.canceled) return;
    const file = result.assets[0];
    const cachedFile = new ExpoFile(Paths.cache, `payment-receipt-${Date.now()}.pdf`);
    await new ExpoFile(file.uri).copy(cachedFile);
    setComprovante({
      uri: cachedFile.uri,
      name: file.name || 'comprovante.pdf',
      type: file.mimeType || 'application/pdf',
    });
  }, []);

  // Visualização de comprovante anexado localmente (arquivo no dispositivo).
  // Não depende do backend: usa expo-sharing.shareAsync diretamente no URI local.
  const viewReceipt = useCallback(
    async (uri: string) => {
      try {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf' });
      } catch {
        Alert.alert(t('common.errorTitle'), t('payments.receiptOpenError'));
      }
    },
    [t],
  );

  const onValidSubmit = handleSubmit(async (values) => {
    if (!activeShare) {
      setSubmitError(t('payments.notParticipating'));
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await addPayment({
        shareId: activeShare.shareId,
        amount: parseMoney(values.amount),
        date: values.date,
        method: values.method,
        comprovante: comprovante ?? undefined,
      });
      onCreated?.();
      handleClose();
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  });

  const canSubmit =
    isValid && Boolean(activeShare) && (fixedShare ? true : Boolean(selectedCommitment));

  return (
    <Modal
      visible={visible}
      onClose={handleClose}
      title={t('newPayment.modalTitle')}
      subtitle={t('newPayment.modalSubtitle')}
      showCloseButton
      footer={
        <Box flexDirection="row" gap="sm">
          <Box flex={1}>
            <Button title={t('newPayment.cancel')} onPress={handleClose} variant="outline" fullWidth />
          </Box>
          <Box flex={1}>
            <Button
              title={t('newPayment.register')}
              onPress={onValidSubmit}
              loading={submitting}
              disabled={!canSubmit}
              fullWidth
            />
          </Box>
        </Box>
      }
    >
      <Box gap="md">
        <Controller
          control={control}
          name="groupId"
          render={({ field: { onChange, value } }) => (
            <Select
              label={t('newPayment.group')}
              placeholder={t('payments.selectGroup')}
              value={value}
              onChange={(next) => {
                onChange(next);
                setValue('commitmentId', '', { shouldValidate: true });
              }}
              options={groupOptions}
              emptyText={t('payments.noGroupsAvailable')}
              error={errors.groupId?.message}
              disabled={Boolean(commitmentId)}
            />
          )}
        />

        <Controller
          control={control}
          name="commitmentId"
          render={({ field: { onChange, value } }) => (
            <Select
              label={t('payments.commitment')}
              placeholder={
                watched.groupId
                  ? t('payments.selectCommitment')
                  : t('payments.selectGroupFirst')
              }
              value={value}
              onChange={onChange}
              options={commitmentOptions}
              disabled={Boolean(commitmentId) || !watched.groupId}
              emptyText={t('payments.noCommitmentInGroup')}
              error={errors.commitmentId?.message}
            />
          )}
        />

        <Box flexDirection="row" gap="sm">
          <Box flex={1}>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, value, onBlur } }) => (
                <Input
                  label={t('newPayment.value')}
                  value={value}
                  onChangeText={(text) => onChange(maskMoney(text))}
                  onBlur={onBlur}
                  placeholder={
                    activeShare && remainingAmount > 0
                      ? formatMoney(remainingAmount)
                      : t('payments.amountPlaceholder')
                  }
                  keyboardType="decimal-pad"
                  error={errors.amount?.message}
                />
              )}
            />
          </Box>
          <Box flex={1}>
            <Controller
              control={control}
              name="date"
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  label={t('newPayment.date')}
                  value={value}
                  onChange={onChange}
                  placeholder={t('datePicker.placeholderDate')}
                  error={errors.date?.message}
                />
              )}
            />
          </Box>
        </Box>

        <Controller
          control={control}
          name="method"
          render={({ field: { onChange, value } }) => (
            <Box>
              <Text variant="label" marginBottom="xs">{t('payments.paymentMethod')}</Text>
              <Box flexDirection="row" gap="xs" flexWrap="wrap">
                {paymentMethodOptions.map((option) => {
                  const active = value === option.id;
                  return (
                    <PressableBox
                      key={option.id}
                      onPress={() => onChange(option.id as PaymentMethod)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                    >
                      <Box
                        px="md"
                        py="sm"
                        borderRadius="md"
                        bg={active ? 'primary' : 'surface'}
                        borderWidth={1}
                        borderColor={active ? 'primary' : 'border'}
                      >
                        <Text variant="captionStrong" color={active ? 'white' : 'text'}>
                          {t(option.label as any)}
                        </Text>
                      </Box>
                    </PressableBox>
                  );
                })}
              </Box>
            </Box>
          )}
        />

        <Box>
          <Text variant="label" marginBottom="xs">{t('payments.receipt')}</Text>
          <Box flexDirection="column" gap="xs">
            <Button
              title={comprovante ? t('payments.changeFile') : t('payments.attachFile')}
              variant="outline"
              size="sm"
              fullWidth
              onPress={pickComprovante}
            />
            {comprovante ? (
              <Box gap="xs">
                <Text variant="caption" numberOfLines={1} color="primary">
                  {comprovante.name}
                </Text>
                {/* <Button
                  title={t('payments.viewReceipt')}
                  variant="outline"
                  size="sm"
                  fullWidth
                  onPress={() => viewReceipt(comprovante.uri)}
                /> */}
                <PressableBox onPress={() => setComprovante(null)} hitSlop={8}>
                  <Text variant="captionStrong" color="danger">{t('commitments.remove')}</Text>
                </PressableBox>
              </Box>
            ) : null}
          </Box>
        </Box>

        {selectedCommitment && !fixedShare && !activeShare ? (
          <Text variant="caption" color="danger">
            {t('payments.noShare')}
          </Text>
        ) : null}

        {activeShare ? (
          <Box bg="background" borderRadius="md" borderWidth={1} borderColor="border" p="md">
            <Text variant="captionStrong" color="textSecondary">{t('payments.selectedShare')}</Text>
            <Text variant="bodyStrong" mt="xxs">{activeShare.name}</Text>
            <Text variant="caption" color="textSecondary">
              {t('payments.openAmount')} {formatMoney(remainingAmount)}
            </Text>
          </Box>
        ) : null}

        {submitError ? (
          <Text variant="caption" color="danger">
            {submitError}
          </Text>
        ) : null}
      </Box>
    </Modal>
  );
}

export default NewPaymentModal;
