import React, { useCallback, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../../../components/Modal';
import { Input } from '../../../../components/Input';
import { Button } from '../../../../components/Button';
import { Select, SelectOption } from '../../../../components/Select';
import { Box, Text, PressableBox } from '../../../../theme';
import { useAppPayments } from '../../../../contexts/AppContext';
import {
  defaultPaymentFormValues,
  paymentDraftSchema,
  type PaymentFormValues,
} from '../../validations/paymentSchema';
import {
  paymentCategoryOptionsMock,
  paymentMethodsMock,
  paymentCardBrandsMock,
  paymentRecurrenceMock,
} from '../../services/paymentOptions';
import type { Payment } from '../../types/Payment';

interface EditPaymentModalProps {
  visible: boolean;
  payment: Payment | null;
  onClose: () => void;
  onSaved?: () => void;
}

export function EditPaymentModal({ visible, payment, onClose, onSaved }: EditPaymentModalProps) {
  const { updatePayment, deletePayment } = useAppPayments();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    watch,
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentDraftSchema) as any,
    defaultValues: defaultPaymentFormValues,
    mode: 'onChange',
  });

  useEffect(() => {
    if (visible && payment) {
      const categoryId =
        paymentCategoryOptionsMock.find(
          (c) => c.label.toLowerCase() === payment.category.toLowerCase(),
        )?.id ?? '';
      reset({
        description: payment.description,
        amount: payment.amount.toString().replace('.', ','),
        groupId: payment.groupId,
        commitmentId: payment.commitmentId ?? '',
        payerId: payment.payerId,
        payerName: payment.payerName,
        category: categoryId,
        method: payment.method,
        cardBrand: payment.cardBrand ?? 'credit',
        otherMethod: payment.otherMethod ?? '',
        recurrence: payment.recurrence,
        date: payment.date,
        notes: payment.notes ?? '',
      });
    }
  }, [visible, payment, reset]);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const watched = watch();

  const methodOptions = React.useMemo<SelectOption[]>(
    () => paymentMethodsMock.map((option) => ({ id: option.id, label: option.label })),
    [],
  );
  const cardBrandOptions = React.useMemo<SelectOption[]>(
    () => paymentCardBrandsMock.map((option) => ({ id: option.id, label: option.label })),
    [],
  );
  const categoryOptions = React.useMemo<SelectOption[]>(
    () => paymentCategoryOptionsMock.map((option) => ({ id: option.id, label: option.label })),
    [],
  );
  const recurrenceOptions = React.useMemo<SelectOption[]>(
    () => paymentRecurrenceMock.map((option) => ({ id: option.id, label: option.label })),
    [],
  );

  const onValidSubmit = handleSubmit((values) => {
    if (!payment) return;
    const amount = Number(values.amount.replace(',', '.')) || 0;
    updatePayment(payment.id, {
      description: values.description.trim(),
      amount,
      category:
        paymentCategoryOptionsMock.find((c) => c.id === values.category)?.label ??
        payment.category,
      method: values.method,
      cardBrand: values.method === 'card' ? values.cardBrand : undefined,
      otherMethod: values.method === 'other' ? values.otherMethod?.trim() : undefined,
      recurrence: values.recurrence,
      date: values.date,
      notes: values.notes?.trim() || undefined,
      payerId: values.payerId,
      payerName: values.payerId,
    });
    onSaved?.();
    handleClose();
  });

  const handleDelete = useCallback(() => {
    if (!payment) return;
    deletePayment(payment.id);
    onSaved?.();
    handleClose();
  }, [payment, deletePayment, onSaved, handleClose]);

  if (!payment) return null;

  return (
    <Modal
      visible={visible}
      onClose={handleClose}
      title="Editar pagamento"
      subtitle="Atualize os dados deste pagamento"
      showCloseButton
      footer={
        <Box flexDirection="row" gap="sm">
          <Box flex={1}>
            <Button title="Excluir" onPress={handleDelete} variant="danger" fullWidth />
          </Box>
          <Box flex={1}>
            <Button
              title="Salvar"
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
              placeholder="Descrição"
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
                placeholder="Ex: PicPay, Débito automático..."
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
      </Box>
    </Modal>
  );
}

export default EditPaymentModal;
