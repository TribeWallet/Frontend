import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as ImagePicker from 'expo-image-picker';
import { Modal } from '../../../../components/Modal';
import { Input } from '../../../../components/Input';
import { DatePicker } from '../../../../components/DatePicker/DatePicker';
import { Button } from '../../../../components/Button';
import { Select, SelectOption } from '../../../../components/Select';
import { Box, Text, PressableBox } from '../../../../theme';
import { useTranslation } from '../../../../hooks/useTranslation';
import { useAppCommitments, useAppGroups } from '../../../../contexts/AppContext';
import { getErrorMessage } from '../../../../services/api/apiClient';
import { todayBR } from '../../../../utils/date';
import { MoneyValue } from '../../../../components/MoneyValue';
import { useFormatMoney } from '../../../../hooks/useFormatMoney';
import { maskDateBR, maskMoney, maskNumber, parseMoney } from '../../../../utils/masks';
import type { AttachedFile } from '../../../../types/file';
import type { Commitment, SplitMode } from '../../types/Commitment';
import { commitmentCategories } from '../../services/categories';
import { computeSplits } from '../../services/split';

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg'];

type FormValues = {
  name: string;
  amount: string;
  dueDate: string;
  groupId: string;
  category: string;
  splitMode: 'equal' | 'custom';
  parcelas: string;
};

interface NewCommitmentModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated?: (commitment: Commitment) => void;
  commitment?: Commitment | null;
  lockedGroupId?: string;
}

export function NewCommitmentModal({
  visible,
  onClose,
  onCreated,
  commitment,
  lockedGroupId,
}: NewCommitmentModalProps) {
  const { groups } = useAppGroups();
  const { addCommitment, updateCommitment } = useAppCommitments();
  const { t } = useTranslation();
  const formatMoney = useFormatMoney();

  const schema = z.object({
    name: z.string().min(2, t('newCommitment.nameMinLength')),
    amount: z
      .string()
      .min(1, t('payments.invalidValue'))
      .regex(/^[0-9]{1,}(?:,[0-9]{1,2})?$/, t('payments.invalidValue')),
    dueDate: z.string().regex(/^[0-3][0-9]\/[0-1][0-9]\/[0-9]{4}$/, t('newCommitment.dueDateInvalid')),
    groupId: z.string().min(1, t('newCommitment.selectGroupRequired')),
    category: z.string().min(1, t('newCommitment.selectCategoryRequired')),
    splitMode: z.enum(['equal', 'custom']),
    parcelas: z
      .string()
      .min(1, t('payments.installmentsRequired'))
      .refine((value) => {
        const parsed = Number(value);
        return Number.isInteger(parsed) && parsed >= 1 && parsed <= 24;
      }, t('newCommitment.parcelasRange')),
  });

  const isEdit = Boolean(commitment);
  const [customSplits, setCustomSplits] = useState<
    { integranteToken: string; amount: number }[]
  >([]);
  const [customSplitInputs, setCustomSplitInputs] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [imagem, setImagem] = useState<AttachedFile | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: '',
      amount: '',
      dueDate: todayBR(),
      groupId: '',
      category: '',
      splitMode: 'equal',
      parcelas: '1',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (!visible) {
      setCustomSplits([]);
      setCustomSplitInputs({});
      setImagem(null);
      return;
    }
    setSubmitError(null);
    setImagem(null);
    if (commitment) {
      reset({
        name: commitment.name,
        amount: commitment.amount.toString().replace('.', ','),
        dueDate: commitment.dueDate,
        groupId: commitment.groupId,
        category: commitment.category,
        splitMode: commitment.splitMode,
        parcelas: '1',
      });
      setCustomSplits(
        commitment.splits.map((split) => ({
          integranteToken: split.integranteToken,
          amount: split.amount,
        })),
      );
      setCustomSplitInputs(
        Object.fromEntries(
          commitment.splits.map((split) => [
            split.integranteToken,
            maskMoney((split.amount * 100).toFixed(0)),
          ]),
        ),
      );
    } else {
      reset({
        name: '',
        amount: '',
        dueDate: todayBR(),
        groupId: lockedGroupId ?? '',
        category: '',
        splitMode: 'equal',
        parcelas: '1',
      });
      setCustomSplits([]);
      setCustomSplitInputs({});
    }
  }, [visible, commitment, lockedGroupId, reset]);

  const watched = watch();
  const activeGroupId = lockedGroupId ?? watched.groupId;
  const selectedGroup = groups.find((group) => group.id === activeGroupId);
  const members = useMemo(() => selectedGroup?.members ?? [], [selectedGroup]);
  const parcelas = Math.max(1, Number(watched.parcelas) || 1);

  const totalAmount = parseMoney(watched.amount);
  const perParcela = parcelas > 1 ? totalAmount / parcelas : totalAmount;

  const splitResult = useMemo(() => {
    return computeSplits(totalAmount, members, watched.splitMode as SplitMode, customSplits);
  }, [totalAmount, watched.splitMode, customSplits, members]);

  const perParcelaSplits = useMemo(
    () => computeSplits(perParcela, members, 'equal', []),
    [perParcela, members],
  );

  const totalMatches = splitResult.balanced;

  const applyEqualDefaultsToCustom = useCallback(() => {
    const equal = computeSplits(totalAmount, members, 'equal', []);
    const entries = equal.entries.map((entry) => ({ ...entry }));
    setCustomSplits(entries);
    setCustomSplitInputs(
      Object.fromEntries(
        entries.map((entry) => [
          entry.integranteToken,
          maskMoney((entry.amount * 100).toFixed(0)),
        ]),
      ),
    );
  }, [totalAmount, members]);

  const handleSplitModeChange = useCallback(
    (mode: SplitMode) => {
      if (mode === 'custom' && customSplits.every((split) => split.amount === 0)) {
        applyEqualDefaultsToCustom();
      }
      setValue('splitMode', mode, { shouldValidate: true });
    },
    [customSplits, applyEqualDefaultsToCustom, setValue],
  );

  const handleClose = useCallback(() => {
    reset();
    setCustomSplits([]);
    setCustomSplitInputs({});
    setImagem(null);
    setSubmitError(null);
    onClose();
  }, [reset, onClose]);

  const pickImagem = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: false,
      quality: 0.8,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    const extension = (asset.fileName ?? asset.uri).split('.').pop()?.toLowerCase() ?? '';
    const mimeType = asset.mimeType ?? 'image/jpeg';
    const allowed =
      IMAGE_EXTENSIONS.includes(extension) || ['image/png', 'image/jpeg'].includes(mimeType);
    if (!allowed) {
      setSubmitError('A imagem deve ser PNG, JPG ou JPEG.');
      return;
    }
    setSubmitError(null);
    setImagem({
      uri: asset.uri,
      name: asset.fileName ?? `imagem.${extension || 'jpg'}`,
      type: mimeType,
    });
  }, []);

  const onValidSubmit = handleSubmit(async (values) => {
    const group = groups.find((item) => item.id === (lockedGroupId ?? values.groupId));
    if (!group) return;
    if (values.splitMode === 'custom' && !totalMatches) {
      setSubmitError('A soma dos valores exatos precisa igualar o valor total.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const input = {
        name: values.name.trim(),
        groupId: group.id,
        category: values.category,
        amount: parseMoney(values.amount),
        dueDate: values.dueDate,
        splitMode: values.splitMode,
        splits: splitResult.entries,
        imagem: imagem ?? undefined,
        parcelas: isEdit ? 1 : parcelas,
      };
      if (commitment) {
        await updateCommitment(commitment.id, input);
        onCreated?.(commitment);
      } else {
        const created = await addCommitment(input);
        onCreated?.(created);
      }
      handleClose();
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  });

  const groupSelectValue = lockedGroupId ?? watched.groupId;

  return (
    <Modal
      visible={visible}
      onClose={handleClose}
      title={isEdit ? t('commitments.editCommitment') : t('commitments.newCommitment')}
      subtitle={
        isEdit ? t('commitments.editSubtitle') : t('commitments.createSubtitle')
      }
      showCloseButton
      keyboardScrollEnabled={Platform.OS === 'android'}
      footer={
        <Box flexDirection="row" gap="sm">
          <Box flex={1}>
            <Button title={t('common.cancel')} onPress={handleClose} variant="outline" fullWidth />
          </Box>
          <Box flex={1}>
            <Button
              title={isEdit ? t('common.save') : t('common.create')}
              onPress={onValidSubmit}
              loading={submitting}
              disabled={
                !isValid ||
                members.length === 0 ||
                (watched.splitMode === 'custom' && !totalMatches)
              }
              fullWidth
            />
          </Box>
        </Box>
      }
    >
      <Box gap="md">
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value, onBlur } }) => (
              <Input
                label={t('newCommitment.title')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t('newCommitment.titlePlaceholder')}
                error={errors.name?.message}
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
                    label={t('newCommitment.amount')}
                    prefix="R$"
                    value={value}
                    onChangeText={(text) => onChange(maskMoney(text))}
                    onBlur={onBlur}
                    placeholder={t('newCommitment.amountPlaceholder')}
                    keyboardType="decimal-pad"
                    error={errors.amount?.message}
                  />
                )}
              />
            </Box>
            <Box flex={1}>
              <Controller
                control={control}
                name="dueDate"
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    label={t('newCommitment.date')}
                    value={value}
                    onChange={onChange}
                    placeholder={t('datePicker.placeholderDate')}
                    error={errors.dueDate?.message}
                  />
                )}
              />
            </Box>
          </Box>

          {!isEdit ? (
            <Box flexDirection="row" gap="sm">
              <Box flex={1}>
                <Controller
                  control={control}
                  name="parcelas"
                  render={({ field: { onChange, value, onBlur } }) => (
                    <Input
                      label={t('newCommitment.installments')}
                      value={value}
                      onChangeText={(text) => {
                        const masked = maskNumber(text, 2);
                        onChange(masked);
                      }}
                      onBlur={onBlur}
                      placeholder={t('newCommitment.installmentsPlaceholder')}
                      keyboardType="numeric"
                      error={errors.parcelas?.message}
                    />
                  )}
                />
              </Box>
              <Box flex={2} justifyContent="center">
                {parcelas > 1 && totalAmount > 0 ? (
                  <Text variant="caption" color="textSecondary">
                    {t('newCommitment.installmentsCreated', { parcelas, total: formatMoney(perParcela) })}
                  </Text>
                ) : null}
              </Box>
            </Box>
          ) : null}

          <Select
            label={t('newCommitment.group')}
            placeholder={lockedGroupId ? selectedGroup?.name ?? '' : t('newCommitment.selectGroup')}
            value={groupSelectValue}
            onChange={(value) => setValue('groupId', value, { shouldValidate: true })}
            options={groups.map<SelectOption>((group) => ({
              id: group.id,
              label: group.name,
              description: `${group.members.length} integrante${group.members.length === 1 ? '' : 's'}`,
            }))}
            emptyText={t('newCommitment.emptyGroup')}
            error={errors.groupId?.message}
            disabled={isEdit || Boolean(lockedGroupId)}
          />

          <Select
            label={t('newCommitment.category')}
            placeholder={t('newCommitment.selectCategory')}
            value={watched.category}
            onChange={(value) => setValue('category', value, { shouldValidate: true })}
            options={commitmentCategories.map<SelectOption>((category) => ({
              id: category,
              label: category,
            }))}
            error={errors.category?.message}
          />

          <Box>
            <Text variant="label" marginBottom="xs">{t('newCommitment.receiptLabel')}</Text>
            <Box flexDirection="row" gap="xs" alignItems="center">
              <Button
                title={imagem ? t('newCommitment.changeFile') : t('newCommitment.attachFile')}
                variant="outline"
                size="sm"
                onPress={pickImagem}
              />
              {imagem ? (
                <Box flex={1} flexDirection="row" alignItems="center" gap="xs">
                  <Text variant="caption" numberOfLines={1} flex={1} color="primary">
                    {imagem.name}
                  </Text>
                  <PressableBox onPress={() => setImagem(null)} hitSlop={8}>
                    <Text variant="captionStrong" color="danger">{t('commitments.remove')}</Text>
                  </PressableBox>
                </Box>
              ) : null}
            </Box>
          </Box>

          {activeGroupId ? (
            <Box>
              <Text variant="label" marginBottom="xs">{t('newCommitment.splitCosts')}</Text>
              <Box flexDirection="row" gap="xs">
                {(['equal', 'custom'] as SplitMode[]).map((mode) => {
                  const active = watched.splitMode === mode;
                  return (
                    <PressableBox
                      key={mode}
                      onPress={() => handleSplitModeChange(mode)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      style={{ flex: 1 }}
                    >
                      <Box
                        py="sm"
                        borderRadius="md"
                        bg={active ? 'primary' : 'surface'}
                        borderWidth={1}
                        borderColor={active ? 'primary' : 'border'}
                        alignItems="center"
                      >
                        <Text variant="captionStrong" color={active ? 'white' : 'textSecondary'}>
                          {mode === 'equal' ? t('newCommitment.splitEqual') : t('newCommitment.splitExact')}
                        </Text>
                      </Box>
                    </PressableBox>
                  );
                })}
              </Box>

              {members.length === 0 ? (
                <Text variant="caption" color="danger" mt="sm">
                  {t('newCommitment.noActiveMembers')}
                </Text>
              ) : watched.splitMode === 'equal' ? (
                <Box mt="sm">
                  {members.map((member) => {
                    const split =
                      parcelas > 1
                        ? perParcelaSplits.entries.find(
                            (entry) => entry.integranteToken === member.integranteToken,
                          )
                        : splitResult.entries.find(
                            (entry) => entry.integranteToken === member.integranteToken,
                          );
                    return (
                      <Box
                        key={member.integranteToken}
                        flexDirection="row"
                        alignItems="center"
                        justifyContent="space-between"
                        py="xs"
                      >
                        <Text variant="body">{member.name}</Text>
                        <MoneyValue amount={split?.amount ?? 0} />
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Box mt="sm" gap="xs">
                  {members.map((member) => {
                    const current =
                      customSplits.find(
                        (entry) => entry.integranteToken === member.integranteToken,
                      )?.amount ?? 0;
                    const porParcela =
                      parcelas > 1 ? current / parcelas : current;
                    return (
                      <Box key={member.integranteToken} gap="xxs">
                        <Text variant="bodySmall" color="textSecondary">
                          {member.name}
                        </Text>
                        <Input
                          prefix="R$"
                          value={
                            customSplitInputs[member.integranteToken] ??
                            maskMoney((current * 100).toFixed(0))
                          }
                          onChangeText={(text) => {
                            const masked = maskMoney(text);
                            const inputValue = parseMoney(masked) === 0 ? '' : masked;
                            const numeric = parseMoney(inputValue);
                            setCustomSplitInputs((prev) => ({
                              ...prev,
                              [member.integranteToken]: inputValue,
                            }));
                            setCustomSplits((prev) => [
                              ...prev.filter(
                                (entry) => entry.integranteToken !== member.integranteToken,
                              ),
                              { integranteToken: member.integranteToken, amount: numeric },
                            ]);
                          }}
                          placeholder={t('newCommitment.amountPlaceholder')}
                          keyboardType="decimal-pad"
                        />
                        {parcelas > 1 && (
                          <Text variant="caption" color="textSecondary">
                            {t('newCommitment.installmentsCreated', {
                              parcelas,
                              total: formatMoney(porParcela),
                            })}
                          </Text>
                        )}
                      </Box>
                    );
                  })}
                  <Text variant="caption" color={totalMatches ? 'success' : 'danger'} mt="xs">
                    {t('newCommitment.sumCurrent', { total: formatMoney(splitResult.total) })}{' '}
                    {totalMatches ? t('newCommitment.sumMatches') : t('newCommitment.sumMismatch')}
                  </Text>
                </Box>
              )}
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

export default NewCommitmentModal;
