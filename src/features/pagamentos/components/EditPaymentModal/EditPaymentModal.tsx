import React, { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as DocumentPicker from 'expo-document-picker';
import { File as ExpoFile, Paths } from 'expo-file-system';
import * as FileSystem from 'expo-file-system';
import { Modal } from '../../../../components/Modal';
import { Input } from '../../../../components/Input';
import { DatePicker } from '../../../../components/DatePicker/DatePicker';
import { Button } from '../../../../components/Button';
import { Box, Text, PressableBox } from '../../../../theme';
import { useTranslation } from '../../../../hooks/useTranslation';
import { useAppPayments } from '../../../../contexts/AppContext';
import { getErrorMessage } from '../../../../services/api/apiClient';
import { MoneyValue } from '../../../../components/MoneyValue';
import { useFormatMoney } from '../../../../hooks/useFormatMoney';
import { maskDateBR, maskMoney, parseMoney } from '../../../../utils/masks';
import type { AttachedFile } from '../../../../types/file';
import { paymentMethodOptions } from '../../services/paymentOptions';
import { paymentMethodSchema } from '../../validations/paymentSchema';
import type { Payment, PaymentMethod } from '../../types/Payment';

type FormValues = {
  amount: string;
  date: string;
  method: PaymentMethod;
};

interface EditPaymentModalProps {
  visible: boolean;
  payment: Payment | null;
  onClose: () => void;
  onSaved?: () => void;
}

export function EditPaymentModal({ visible, payment, onClose, onSaved }: EditPaymentModalProps) {
  const { t } = useTranslation();
  const formatMoney = useFormatMoney();

  const schema = z.object({
    amount: z
      .string()
      .min(1, t('payments.invalidValue'))
      .regex(/^[0-9]+(?:[,.][0-9]{1,2})?$/, t('payments.invalidValue'))
      .refine((value) => Number(value.replace(',', '.')) > 0, t('payments.valueGreaterThanZero')),
    date: z.string().regex(/^[0-3][0-9]\/[0-1][0-9]\/[0-9]{4}$/, t('payments.dateFormatInvalid')),
    method: paymentMethodSchema,
  });

  const { updatePayment, deletePayment } = useAppPayments();
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [comprovante, setComprovante] = useState<AttachedFile | null>(null);

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
    setComprovante(null);
    reset({
      amount: payment.amount.toString().replace('.', ','),
      date: payment.date,
      method: payment.method,
    });
  }, [visible, payment, reset]);

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

  // Visualização de comprovante salvo no servidor.
  // Depende do `receiptUrl` fornecido pelo backend (expo-sharing + FileSystem.downloadAsync).
  // Se o backend não expor essa URL, o botão de visualização não é renderizado (veja JSX abaixo).
  // Para comprovante anexado localmente (novo pagamento), não há dependência de backend.
  const viewReceipt = useCallback(
    async (receiptUrl: string) => {
      try {
        const fileName = `comprovante-${Date.now()}.pdf`;
        const fileUri = `${Paths.cache}/${fileName}`;
        await FileSystem.downloadAsync(receiptUrl, fileUri);
        await Sharing.shareAsync(fileUri, { mimeType: 'application/pdf' });
      } catch {
        Alert.alert(t('common.errorTitle'), t('payments.receiptOpenError'));
      }
    },
    [t],
  );

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
        amount: parseMoney(values.amount),
        date: values.date,
        method: values.method,
        comprovante: comprovante ?? undefined,
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
    Alert.alert(t('editPayment.deleteConfirmTitle'), t('editPayment.deleteConfirmMsg'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
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
      title={t('editPayment.modalTitle')}
      subtitle={
        `${payment.commitmentName.charAt(0).toUpperCase() + payment.commitmentName.slice(1)} • ${payment.payerName.charAt(0).toUpperCase() + payment.payerName.slice(1)}\nRegistrado: ${formatMoney(payment.amount)}`
      }
      showCloseButton
      footer={
        <Box flexDirection="row" gap="sm">
          <Box flex={1}>
            <Button
              title={t('editPayment.delete')}
              onPress={handleDelete}
              variant="danger"
              loading={busy}
              fullWidth
            />
          </Box>
          <Box flex={1}>
            <Button
              title={t('editPayment.save')}
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
          <Text variant="captionStrong" color="textSecondary">{t('editPayment.paymentOf')}</Text>
          <Text variant="bodyStrong" mt="xxs">{payment.payerName}</Text>
          <Text variant="caption" color="textSecondary">
            {payment.commitmentName} • {payment.groupName}
          </Text>
          <Text variant="caption" color="textSecondary">
            {t('editPayment.registered')} {formatMoney(payment.amount)}
          </Text>
        </Box>

        <Box flexDirection="row" gap="sm">
          <Box flex={1}>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, value, onBlur } }) => (
                <Input
                  label={t('editPayment.value')}
                  prefix="R$"
                  value={value}
                  onChangeText={(text) => onChange(maskMoney(text))}
                  onBlur={onBlur}
                  placeholder={t('payments.amountPlaceholder')}
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
                  label={t('editPayment.date')}
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
              <Box flexDirection="row" alignItems="center" gap="xs">
                <Text variant="caption" numberOfLines={1} flex={1} color="primary">
                  {comprovante.name}
                </Text>
                <PressableBox onPress={() => setComprovante(null)} hitSlop={8}>
                  <Text variant="captionStrong" color="danger">{t('commitments.remove')}</Text>
                </PressableBox>
              </Box>
            ) : null}
          </Box>
        </Box>

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
