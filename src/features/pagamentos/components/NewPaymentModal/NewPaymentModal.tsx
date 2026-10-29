import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as DocumentPicker from 'expo-document-picker';
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
        description: `Vence ${commitment.dueDate} • ${formatCurrency(commitment.amount)}`,
      })),
    [availableCommitments],
  );

  const pickComprovante = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    const file = result.assets[0];
    setComprovante({
      uri: file.uri,
      name: file.name || 'comprovante.pdf',
      type: file.mimeType || 'application/pdf',
    });
  }, []);

  const onValidSubmit = handleSubmit(async (values) => {
    if (!activeShare) {
      setSubmitError('Você não participa deste compromisso.');
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
              label="Grupo"
              placeholder="Selecione um grupo"
              value={value}
              onChange={(next) => {
                onChange(next);
                setValue('commitmentId', '', { shouldValidate: true });
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
              onChange={onChange}
              options={commitmentOptions}
              disabled={!watched.groupId}
              emptyText="Nenhum compromisso neste grupo"
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
                  label="Valor"
                  value={value}
                  onChangeText={(text) => onChange(maskMoney(text))}
                  onBlur={onBlur}
                  placeholder={
                    activeShare && remainingAmount > 0
                      ? formatCurrency(remainingAmount)
                      : '0,00'
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
              render={({ field: { onChange, value, onBlur } }) => (
                <Input
                  label="Data"
                  value={value}
                  onChangeText={(text) => onChange(maskDateBR(text))}
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

        <Box>
          <Text variant="label" marginBottom="xs">Comprovante (PDF, opcional)</Text>
          <Box flexDirection="row" gap="xs" alignItems="center">
            <Button
              title={comprovante ? 'Trocar arquivo' : 'Anexar PDF'}
              variant="outline"
              size="sm"
              onPress={pickComprovante}
            />
            {comprovante ? (
              <Box flex={1} flexDirection="row" alignItems="center" gap="xs">
                <Text variant="caption" numberOfLines={1} flex={1} color="primary">
                  {comprovante.name}
                </Text>
                <PressableBox onPress={() => setComprovante(null)} hitSlop={8}>
                  <Text variant="captionStrong" color="danger">Remover</Text>
                </PressableBox>
              </Box>
            ) : null}
          </Box>
        </Box>

        {selectedCommitment && !fixedShare && !activeShare ? (
          <Text variant="caption" color="danger">
            Você não tem fatia neste compromisso.
          </Text>
        ) : null}

        {activeShare ? (
          <Box bg="background" borderRadius="md" borderWidth={1} borderColor="border" p="md">
            <Text variant="captionStrong" color="textSecondary">FATIA SELECIONADA</Text>
            <Text variant="bodyStrong" mt="xxs">{activeShare.name}</Text>
            <Text variant="caption" color="textSecondary">
              Em aberto: {formatCurrency(remainingAmount)}
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
