import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../../../../components/Modal';
import { Input } from '../../../../components/Input';
import { Button } from '../../../../components/Button';
import { Select, SelectOption } from '../../../../components/Select';
import { Box, Text, PressableBox } from '../../../../theme';
import { useAppCommitments, useAppGroups } from '../../../../contexts/AppContext';
import { getErrorMessage } from '../../../../services/api/apiClient';
import { todayBR } from '../../../../utils/date';
import { formatCurrency } from '../../../../utils/currency';
import type { Commitment, SplitMode } from '../../types/Commitment';
import { commitmentCategories } from '../../services/categories';
import { computeSplits } from '../../services/split';

const schema = z.object({
  name: z.string().min(2, 'Informe um nome'),
  amount: z
    .string()
    .min(1, 'Informe um valor')
    .regex(/^[0-9]+(?:[,.][0-9]{1,2})?$/, 'Valor inválido'),
  dueDate: z.string().regex(/^[0-3][0-9]\/[0-1][0-9]\/[0-9]{4}$/, 'Use o formato DD/MM/AAAA'),
  groupId: z.string().min(1, 'Selecione um grupo'),
  category: z.string().min(1, 'Selecione uma categoria'),
  splitMode: z.enum(['equal', 'custom']),
});

type FormValues = z.infer<typeof schema>;

interface NewCommitmentModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated?: (commitment: Commitment) => void;
  commitment?: Commitment | null;
}

export function NewCommitmentModal({
  visible,
  onClose,
  onCreated,
  commitment,
}: NewCommitmentModalProps) {
  const { groups } = useAppGroups();
  const { addCommitment, updateCommitment } = useAppCommitments();

  const isEdit = Boolean(commitment);
  const [customSplits, setCustomSplits] = useState<
    { integranteToken: string; amount: number }[]
  >([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (!visible) {
      setCustomSplits([]);
      return;
    }
    setSubmitError(null);
    if (commitment) {
      reset({
        name: commitment.name,
        amount: commitment.amount.toString().replace('.', ','),
        dueDate: commitment.dueDate,
        groupId: commitment.groupId,
        category: commitment.category,
        splitMode: commitment.splitMode,
      });
      setCustomSplits(
        commitment.splits.map((split) => ({
          integranteToken: split.integranteToken,
          amount: split.amount,
        })),
      );
    } else {
      reset({
        name: '',
        amount: '',
        dueDate: todayBR(),
        groupId: '',
        category: '',
        splitMode: 'equal',
      });
      setCustomSplits([]);
    }
  }, [visible, commitment, reset]);

  const watched = watch();
  const selectedGroup = groups.find((group) => group.id === watched.groupId);
  const members = useMemo(() => selectedGroup?.members ?? [], [selectedGroup]);

  const splitResult = useMemo(() => {
    const amount = Number(watched.amount.replace(',', '.')) || 0;
    return computeSplits(amount, members, watched.splitMode as SplitMode, customSplits);
  }, [watched.amount, watched.splitMode, customSplits, members]);

  const totalMatches = splitResult.balanced;

  const handleClose = useCallback(() => {
    reset();
    setCustomSplits([]);
    setSubmitError(null);
    onClose();
  }, [reset, onClose]);

  const onValidSubmit = handleSubmit(async (values) => {
    const group = groups.find((item) => item.id === values.groupId);
    if (!group) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const input = {
        name: values.name.trim(),
        groupId: group.id,
        category: values.category,
        amount: Number(values.amount.replace(',', '.')) || 0,
        dueDate: values.dueDate,
        splitMode: values.splitMode,
        splits: splitResult.entries,
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

  return (
    <Modal
      visible={visible}
      onClose={handleClose}
      title={isEdit ? 'Editar compromisso' : 'Novo compromisso'}
      subtitle={
        isEdit ? 'Atualize os dados do compromisso' : 'Defina um compromisso para o grupo'
      }
      showCloseButton
      footer={
        <Box flexDirection="row" gap="sm">
          <Box flex={1}>
            <Button title="Cancelar" onPress={handleClose} variant="outline" fullWidth />
          </Box>
          <Box flex={1}>
            <Button
              title={isEdit ? 'Salvar' : 'Criar'}
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
      <ScrollView
        style={{ maxHeight: 520 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Box gap="md">
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value, onBlur } }) => (
              <Input
                label="Título"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Ex: Aluguel Março"
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
                    label="Valor total"
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
                name="dueDate"
                render={({ field: { onChange, value, onBlur } }) => (
                  <Input
                    label="Data"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="DD/MM/AAAA"
                    keyboardType="numeric"
                    error={errors.dueDate?.message}
                  />
                )}
              />
            </Box>
          </Box>

          <Select
            label="Grupo"
            placeholder="Selecione um grupo"
            value={watched.groupId}
            onChange={(value) => setValue('groupId', value, { shouldValidate: true })}
            options={groups.map<SelectOption>((group) => ({
              id: group.id,
              label: group.name,
              description: `${group.members.length} integrante${group.members.length === 1 ? '' : 's'}`,
            }))}
            emptyText="Crie um grupo antes de lançar compromissos"
            error={errors.groupId?.message}
            disabled={isEdit}
          />

          <Select
            label="Categoria"
            placeholder="Selecione uma categoria"
            value={watched.category}
            onChange={(value) => setValue('category', value, { shouldValidate: true })}
            options={commitmentCategories.map<SelectOption>((category) => ({
              id: category,
              label: category,
            }))}
            error={errors.category?.message}
          />

          {watched.groupId ? (
            <Box>
              <Text variant="label" marginBottom="xs">Divisão de custos</Text>
              <Box flexDirection="row" gap="xs">
                {(['equal', 'custom'] as SplitMode[]).map((mode) => {
                  const active = watched.splitMode === mode;
                  return (
                    <PressableBox
                      key={mode}
                      onPress={() => setValue('splitMode', mode, { shouldValidate: true })}
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
                          {mode === 'equal' ? 'Igual entre todos' : 'Valor exato'}
                        </Text>
                      </Box>
                    </PressableBox>
                  );
                })}
              </Box>

              {members.length === 0 ? (
                <Text variant="caption" color="danger" mt="sm">
                  Este grupo não tem integrantes ativos.
                </Text>
              ) : watched.splitMode === 'equal' ? (
                <Box mt="sm">
                  {members.map((member) => {
                    const split = splitResult.entries.find(
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
                        <Text variant="bodyStrong">{formatCurrency(split?.amount ?? 0)}</Text>
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Box mt="sm" gap="xs">
                  {members.map((member) => {
                    const value =
                      customSplits.find(
                        (entry) => entry.integranteToken === member.integranteToken,
                      )?.amount ?? 0;
                    return (
                      <Box key={member.integranteToken} gap="xxs">
                        <Text variant="bodySmall" color="textSecondary">
                          {member.name}
                        </Text>
                        <Input
                          value={value.toString().replace('.', ',')}
                          onChangeText={(text) => {
                            const numeric =
                              Number(text.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
                            setCustomSplits((prev) => [
                              ...prev.filter(
                                (entry) => entry.integranteToken !== member.integranteToken,
                              ),
                              { integranteToken: member.integranteToken, amount: numeric },
                            ]);
                          }}
                          placeholder="0,00"
                          keyboardType="decimal-pad"
                        />
                      </Box>
                    );
                  })}
                  <Text variant="caption" color={totalMatches ? 'success' : 'danger'} mt="xs">
                    Soma atual: {formatCurrency(splitResult.total)}{' '}
                    {totalMatches ? '· bate com o total' : '· precisa igualar ao valor total'}
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
      </ScrollView>
    </Modal>
  );
}

export default NewCommitmentModal;
