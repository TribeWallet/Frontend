import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../../../components/Modal';
import { Input } from '../../../../components/Input';
import { Button } from '../../../../components/Button';
import { Select, SelectOption } from '../../../../components/Select';
import { Box, Text, PressableBox } from '../../../../theme';
import {
  useAppCommitments,
  useAppGroups,
  useAppPayments,
} from '../../../../contexts/AppContext';
import { getErrorMessage } from '../../../../services/api/apiClient';
import { formatCurrency } from '../../../../utils/currency';
import { todayBR } from '../../../../utils/date';
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
  /** Pré-seleciona o compromisso. */
  commitmentId?: string;
  /** Pré-seleciona a fatia (integranteCompromissoToken). */
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

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
    const share = shareId
      ? initialCommitment?.splits.find((entry) => entry.shareId === shareId)
      : undefined;
    reset({
      ...defaultPaymentFormValues,
      groupId: initialCommitment?.groupId ?? '',
      commitmentId: initialCommitment?.id ?? '',
      shareId: share?.shareId ?? '',
      amount: share ? Math.max(0, share.amount - share.paidAmount).toFixed(2).replace('.', ',') : '',
      date: todayBR(),
    });
  }, [visible, initialCommitment, shareId, reset]);

  const handleClose = useCallback(() => {
    reset(defaultPaymentFormValues);
    setSubmitError(null);
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
  const selectedShare = selectedCommitment?.splits.find(
    (split) => split.shareId === watched.shareId,
  );

  const groupOptions = useMemo<SelectOption[]>(
    () => groups.map((group) => ({ id: group.id, label: group.name })),
    [groups],
  );

  const commitmentOptions = useMemo<SelectOption[]>(
    () =>
      availableCommitments.map((commitment) => ({
        id: commitment.id,
        label: commitment.name,
        description: `Vence ${commitment.dueDate} • ${formatCurrency(commitment.amount)}`,
      })),
    [availableCommitments],
  );

  const shareOptions = useMemo<SelectOption[]>(
    () =>
      (selectedCommitment?.splits ?? []).map((split) => ({
        id: split.shareId,
        label: split.name,
        description: `Deve ${formatCurrency(split.amount)} • pago ${formatCurrency(split.paidAmount)}`,
        leading: (
          <Box
            width={22}
            height={22}
            borderRadius="full"
            bg={split.paid ? 'success' : 'primary'}
            alignItems="center"
            justifyContent="center"
          >
            <Text variant="captionStrong" color="white" style={{ fontSize: 10 }}>
              {split.name.slice(0, 1).toUpperCase()}
            </Text>
          </Box>
        ),
      })),
    [selectedCommitment],
  );

  const onValidSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await addPayment({
        shareId: values.shareId,
        amount: Number(values.amount.replace(',', '.')) || 0,
        date: values.date,
        method: values.method,
      });
      onCreated?.();
      handleClose();
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Modal
      visible={visible}
      onClose={handleClose}
      title="Registrar pagamento"
      subtitle="Todo pagamento quita a fatia de um integrante"
      showCloseButton
      footer={
        <Box flexDirection="row" gap="sm">
          <Box flex={1}>
            <Button title="Cancelar" onPress={handleClose} variant="outline" fullWidth />
          </Box>
          <Box flex={1}>
            <Button
              title="Registrar"
              onPress={onValidSubmit}
              loading={submitting}
              disabled={!isValid}
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
              label="Grupo"
              placeholder="Selecione um grupo"
              value={value}
              onChange={(next) => {
                onChange(next);
                setValue('commitmentId', '', { shouldValidate: true });
                setValue('shareId', '', { shouldValidate: true });
              }}
              options={groupOptions}
              emptyText="Nenhum grupo disponível"
              error={errors.groupId?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="commitmentId"
          render={({ field: { onChange, value } }) => (
            <Select
              label="Compromisso"
              placeholder={
                watched.groupId ? 'Selecione o compromisso' : 'Selecione um grupo primeiro'
              }
              value={value}
              onChange={(next) => {
                onChange(next);
                setValue('shareId', '', { shouldValidate: true });
              }}
              options={commitmentOptions}
              disabled={!watched.groupId}
              emptyText="Nenhum compromisso neste grupo"
              error={errors.commitmentId?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="shareId"
          render={({ field: { onChange, value } }) => (
            <Select
              label="Integrante"
              placeholder={
                watched.commitmentId
                  ? 'Quem está pagando'
                  : 'Selecione um compromisso primeiro'
              }
              value={value}
              onChange={onChange}
              options={shareOptions}
              disabled={!watched.commitmentId}
              emptyText="Este compromisso não tem integrantes"
              error={errors.shareId?.message}
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
                  label="Valor"
                  value={value}
                  onChangeText={(text) => onChange(text.replace(/[^0-9.,]/g, ''))}
                  onBlur={onBlur}
                  placeholder="0,00"
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
              render={({ field: { onChange, value, onBlur } }) => (
                <Input
                  label="Data"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="DD/MM/AAAA"
                  keyboardType="numeric"
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
              <Text variant="label" marginBottom="xs">Forma de pagamento</Text>
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
                          {option.label}
                        </Text>
                      </Box>
                    </PressableBox>
                  );
                })}
              </Box>
            </Box>
          )}
        />

        {selectedShare ? (
          <Box bg="background" borderRadius="md" borderWidth={1} borderColor="border" p="md">
            <Text variant="captionStrong" color="textSecondary">FATIA SELECIONADA</Text>
            <Text variant="bodyStrong" mt="xxs">{selectedShare.name}</Text>
            <Text variant="caption" color="textSecondary">
              Em aberto:{' '}
              {formatCurrency(Math.max(0, selectedShare.amount - selectedShare.paidAmount))}
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
