import React, { useCallback, useEffect, useMemo } from 'react';
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
import { useUserStore } from '../../../usuario/stores/userStore';
import type { Payment, PaymentDraft } from '../../types/Payment';
import type { Commitment } from '../../../compromissos/types/Commitment';
import {
  paymentCategoryOptionsMock,
  paymentMethodsMock,
  paymentCardBrandsMock,
  paymentRecurrenceMock,
} from '../../services/paymentOptions';
import {
  defaultPaymentFormValues,
  paymentDraftSchema,
  type PaymentFormValues,
} from '../../validations/paymentSchema';

interface NewPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated?: (payment: Payment) => void;
  commitmentId?: string;
}

function resolveMemberName(commitment: Commitment | null | undefined, memberId: string): string {
  if (commitment) {
    const split = commitment.splits.find((s) => s.memberId === memberId);
    if (split) return memberId;
  }
  return memberId;
}

export function NewPaymentModal({
  visible,
  onClose,
  onCreated,
  commitmentId,
}: NewPaymentModalProps) {
  const { groups } = useAppGroups();
  const { commitments } = useAppCommitments();
  const { addPayment } = useAppPayments();
  const profile = useUserStore((state) => state.profile);

  const initialCommitment = useMemo(
    () => commitments.find((c) => c.id === commitmentId) ?? null,
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
    resolver: zodResolver(paymentDraftSchema) as any,
    defaultValues: {
      ...defaultPaymentFormValues,
      groupId: initialCommitment?.groupId ?? '',
      commitmentId: initialCommitment?.id ?? '',
      payerId: profile?.id ?? 'ana-lima',
      payerName: profile?.name ?? 'Gabriel',
      date: new Date().toLocaleDateString('pt-BR'),
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (!visible) return;
    reset({
      ...defaultPaymentFormValues,
      groupId: initialCommitment?.groupId ?? '',
      commitmentId: initialCommitment?.id ?? '',
      payerId: profile?.id ?? 'ana-lima',
      payerName: profile?.name ?? 'Gabriel',
      date: new Date().toLocaleDateString('pt-BR'),
    });
  }, [visible, initialCommitment, profile, reset]);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const watched = watch();
  const selectedGroup = groups.find((group) => group.id === watched.groupId);
  const availableCommitments = commitments.filter(
    (commitment) => !watched.groupId || commitment.groupId === watched.groupId,
  );
  const availableMembers = useMemo(
    () => selectedGroup?.members ?? [],
    [selectedGroup],
  );
  const selectedCommitment = commitments.find(
    (c) => c.id === watched.commitmentId,
  );

  const groupOptions = useMemo<SelectOption[]>(
    () => groups.map((group) => ({ id: group.id, label: group.name })),
    [groups],
  );

  const commitmentOptions = useMemo<SelectOption[]>(() => {
    const base: SelectOption[] = [{ id: '', label: 'Sem compromisso' }];
    return [
      ...base,
      ...availableCommitments.map((commitment) => ({
        id: commitment.id,
        label: commitment.name,
        description: formatDue(commitment.dueDate),
      })),
    ];
  }, [availableCommitments]);

  const payerOptions = useMemo<SelectOption[]>(
    () => availableMembers.map((member) => ({
      id: member.id,
      label: member.name,
      description: member.email,
      leading: (
        <Box
          width={22}
          height={22}
          borderRadius="full"
          bg="primary"
          alignItems="center"
          justifyContent="center"
        >
          <Text variant="captionStrong" color="white" style={{ fontSize: 10 }}>
            {member.initials}
          </Text>
        </Box>
      ),
    })),
    [availableMembers],
  );

  const categoryOptions = useMemo<SelectOption[]>(
    () => paymentCategoryOptionsMock.map((option) => ({
      id: option.id,
      label: option.label,
    })),
    [],
  );

  const methodOptions = useMemo<SelectOption[]>(
    () => paymentMethodsMock.map((option) => ({ id: option.id, label: option.label })),
    [],
  );

  const cardBrandOptions = useMemo<SelectOption[]>(
    () => paymentCardBrandsMock.map((option) => ({ id: option.id, label: option.label })),
    [],
  );

  const recurrenceOptions = useMemo<SelectOption[]>(
    () => paymentRecurrenceMock.map((option) => ({ id: option.id, label: option.label })),
    [],
  );

  const onValidSubmit = handleSubmit((values) => {
    const amount = Number(values.amount.replace(',', '.')) || 0;
    const group = groups.find((g) => g.id === values.groupId);
    const commitment = commitments.find((c) => c.id === values.commitmentId);
    if (!group) return;

    const draft: PaymentDraft = {
      description: values.description.trim(),
      amount,
      groupId: group.id,
      groupName: group.name,
      commitmentId: commitment?.id,
      commitmentName: commitment?.name,
      payerId: values.payerId,
      payerName:
        resolveMemberName(commitment ?? null, values.payerId) || values.payerId,
      category:
        paymentCategoryOptionsMock.find((c) => c.id === values.category)?.label ??
        'Outros',
      method: values.method,
      cardBrand: values.method === 'card' ? values.cardBrand : undefined,
      otherMethod: values.method === 'other' ? values.otherMethod?.trim() : undefined,
      recurrence: values.recurrence,
      date: values.date,
      notes: values.notes?.trim() || undefined,
    };
    const payment = addPayment(draft);
    onCreated?.(payment);
    handleClose();
  });

  return (
    <Modal
      visible={visible}
      onClose={handleClose}
      title={commitmentId ? 'Registrar pagamento' : 'Novo pagamento'}
      subtitle="Adicione os dados do pagamento realizado"
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
          name="description"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input
              label="Descrição"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Ex: Aluguel Março"
              error={errors.description?.message}
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
                />
              )}
            />
          </Box>
        </Box>

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
              error={errors.groupId?.message}
            />
          )}
        />

        {watched.groupId ? (
          <Controller
            control={control}
            name="commitmentId"
            render={({ field: { onChange, value } }) => (
              <Select
                label="Compromisso (opcional)"
                placeholder="Vincular a um compromisso"
                value={value}
                onChange={onChange}
                options={commitmentOptions}
              />
            )}
          />
        ) : null}

        <Controller
          control={control}
          name="payerId"
          render={({ field: { onChange, value } }) => (
            <Select
              label="Pagador"
              placeholder={availableMembers.length ? 'Selecione o pagador' : 'Selecione um grupo primeiro'}
              value={value}
              onChange={onChange}
              options={payerOptions}
              disabled={!watched.groupId}
              emptyText="Nenhum integrante no grupo selecionado"
              error={errors.payerId?.message}
            />
          )}
        />

        <Box flexDirection="row" gap="sm">
          <Box flex={1}>
            <Controller
              control={control}
              name="category"
              render={({ field: { onChange, value } }) => (
                <Select
                  label="Categoria"
                  placeholder="Selecione"
                  value={value}
                  onChange={onChange}
                  options={categoryOptions}
                  error={errors.category?.message}
                />
              )}
            />
          </Box>
          <Box flex={1}>
            <Controller
              control={control}
              name="recurrence"
              render={({ field: { onChange, value } }) => (
                <Select
                  label="Recorrência"
                  placeholder="Selecione"
                  value={value}
                  onChange={onChange}
                  options={recurrenceOptions}
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
              <Text variant="label" marginBottom="xs">
                Forma de pagamento
              </Text>
              <Box flexDirection="row" gap="xs" flexWrap="wrap">
                {methodOptions.map((option) => {
                  const active = value === option.id;
                  return (
                    <PressableBox
                      key={option.id}
                      onPress={() =>
                        onChange(option.id as PaymentFormValues['method'])
                      }
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
                        <Text
                          variant="captionStrong"
                          color={active ? 'white' : 'text'}
                        >
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

        {watched.method === 'card' ? (
          <Controller
            control={control}
            name="cardBrand"
            render={({ field: { onChange, value } }) => (
              <Box flexDirection="row" gap="xs">
                {cardBrandOptions.map((option) => {
                  const active = value === option.id;
                  return (
                    <PressableBox
                      key={option.id}
                      onPress={() =>
                        onChange(option.id as PaymentFormValues['cardBrand'])
                      }
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      style={{ flex: 1 }}
                    >
                      <Box
                        alignItems="center"
                        py="sm"
                        borderRadius="md"
                        bg={active ? 'primaryLight' : 'surface'}
                        borderWidth={1}
                        borderColor={active ? 'primary' : 'border'}
                      >
                        <Text
                          variant="captionStrong"
                          color={active ? 'primary' : 'textSecondary'}
                        >
                          {option.label}
                        </Text>
                      </Box>
                    </PressableBox>
                  );
                })}
              </Box>
            )}
          />
        ) : null}

        {watched.method === 'other' ? (
          <Controller
            control={control}
            name="otherMethod"
            render={({ field: { onChange, value, onBlur } }) => (
              <Input
                label="Especifique a forma de pagamento"
                value={value ?? ''}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Ex: Débito automático, PicPay..."
                error={errors.otherMethod?.message}
              />
            )}
          />
        ) : null}

        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input
              label="Observações"
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Detalhes do pagamento"
            />
          )}
        />

        {selectedCommitment ? (
          <Box
            bg="background"
            borderRadius="md"
            borderWidth={1}
            borderColor="border"
            p="md"
          >
            <Text variant="captionStrong" color="textSecondary">VINCULADO A</Text>
            <Text variant="bodyStrong" mt="xxs">{selectedCommitment.name}</Text>
            <Text variant="caption" color="textSecondary">
              Saldo aberto: R${' '}
              {(
                selectedCommitment.amount -
                selectedCommitment.splits
                  .filter((s) => s.paid)
                  .reduce((sum, s) => sum + s.amount, 0)
              ).toFixed(2)}
            </Text>
          </Box>
        ) : null}
      </Box>

      <Box flexDirection="row" gap="sm">
        <Box flex={1}>
          <Button title="Cancelar" onPress={handleClose} variant="outline" fullWidth />
        </Box>
        <Box flex={1}>
          <Button
            title="Registrar"
            onPress={onValidSubmit}
            disabled={!isValid}
            fullWidth
          />
        </Box>
      </Box>
    </Modal>
  );
}

function formatDue(due?: string): string | undefined {
  return due ? `Vence ${due}` : undefined;
}

export default NewPaymentModal;
