import React, { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../../../../components/Modal';
import { Input } from '../../../../components/Input';
import { Button } from '../../../../components/Button';
import { Box, Text, PressableBox } from '../../../../theme';
import { useAppPayments } from '../../../../contexts/AppContext';
import { getErrorMessage } from '../../../../services/api/apiClient';
import { formatCurrency } from '../../../../utils/currency';
import { paymentMethodOptions } from '../../services/paymentOptions';
import { paymentMethodSchema } from '../../validations/paymentSchema';
import type { Payment, PaymentMethod } from '../../types/Payment';

const schema = z.object({
  amount: z
    .string()
    .min(1, 'Informe um valor')
    .regex(/^[0-9]+(?:[,.][0-9]{1,2})?$/, 'Valor inválido')
    .refine((value) => Number(value.replace(',', '.')) > 0, 'O valor precisa ser maior que zero'),
  date: z.string().regex(/^[0-3][0-9]\/[0-1][0-9]\/[0-9]{4}$/, 'Use o formato DD/MM/AAAA'),
  method: paymentMethodSchema,
});

type FormValues = z.infer<typeof schema>;

interface EditPaymentModalProps {
  visible: boolean;
  payment: Payment | null;
  onClose: () => void;
  onSaved?: () => void;
}

export function EditPaymentModal({ visible, payment, onClose, onSaved }: EditPaymentModalProps) {
  const { updatePayment, deletePayment } = useAppPayments();
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { amount: '', date: '', method: 'pix' },
    mode: 'onChange',
  });

  useEffect(() => {
    if (!visible || !payment) return;
    setSubmitError(null);
    reset({
      amount: payment.amount.toString().replace('.', ','),
      date: payment.date,
      method: payment.method,
    });
  }, [visible, payment, reset]);

  const handleClose = useCallback(() => {
    reset();
    setSubmitError(null);
    onClose();
  }, [reset, onClose]);

  const onValidSubmit = handleSubmit(async (values) => {
    if (!payment) return;
    setBusy(true);
    setSubmitError(null);
    try {
      await updatePayment(payment.id, {
        amount: Number(values.amount.replace(',', '.')) || 0,
        date: values.date,
        method: values.method,
      });
      onSaved?.();
      handleClose();
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  });

  const handleDelete = useCallback(() => {
    if (!payment) return;
    Alert.alert('Excluir pagamento', 'Excluir este pagamento?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await deletePayment(payment.id);
            onSaved?.();
            handleClose();
          } catch (error) {
            setSubmitError(getErrorMessage(error));
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  }, [payment, deletePayment, onSaved, handleClose]);

  if (!payment) return null;

  return (
    <Modal
      visible={visible}
      onClose={handleClose}
      title="Editar pagamento"
      subtitle={`${payment.commitmentName} • ${payment.payerName}`}
      showCloseButton
      footer={
        <Box flexDirection="row" gap="sm">
          <Box flex={1}>
            <Button
              title="Excluir"
              onPress={handleDelete}
              variant="danger"
              loading={busy}
              fullWidth
            />
          </Box>
          <Box flex={1}>
            <Button
              title="Salvar"
              onPress={onValidSubmit}
              loading={busy}
              disabled={!isValid}
              fullWidth
            />
          </Box>
        </Box>
      }
    >
      <Box gap="md">
        <Box bg="background" borderRadius="md" borderWidth={1} borderColor="border" p="md">
          <Text variant="captionStrong" color="textSecondary">PAGAMENTO DE</Text>
          <Text variant="bodyStrong" mt="xxs">{payment.payerName}</Text>
          <Text variant="caption" color="textSecondary">
            {payment.commitmentName} • {payment.groupName}
          </Text>
          <Text variant="caption" color="textSecondary">
            Registrado: {formatCurrency(payment.amount)}
          </Text>
        </Box>

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

        {submitError ? (
          <Text variant="caption" color="danger">
            {submitError}
          </Text>
        ) : null}
      </Box>
    </Modal>
  );
}

export default EditPaymentModal;
