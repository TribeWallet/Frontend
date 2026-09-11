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
import {
  useAppCommitments,
  useAppGroups,
} from '../../../../contexts/AppContext';
import type { Commitment, SplitMode } from '../../types/Commitment';
import { computeSplits } from '../../services/split';

const schema = z.object({
  name: z.string().min(2, 'Informe um nome'),
  description: z.string().min(3, 'Descreva o compromisso'),
  amount: z
    .string()
    .min(1, 'Informe um valor')
    .regex(/^[0-9]+(?:[,.][0-9]{1,2})?$/, 'Valor inválido'),
  dueDate: z.string().optional(),
  groupId: z.string().min(1, 'Selecione um grupo'),
  category: z.string().min(1, 'Selecione uma categoria'),
  splitMode: z.enum(['equal', 'custom']),
});

type FormValues = z.infer<typeof schema>;

const categories = [
  { id: 'aluguel', label: 'Aluguel' },
  { id: 'contas', label: 'Contas' },
  { id: 'mercado', label: 'Mercado' },
  { id: 'transporte', label: 'Transporte' },
  { id: 'lazer', label: 'Lazer' },
  { id: 'educacao', label: 'Educação' },
  { id: 'outros', label: 'Outros' },
];

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
      description: '',
      amount: '',
      dueDate: '',
      groupId: '',
      category: '',
      splitMode: 'equal',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (!visible) return;
    if (commitment) {
      reset({
        name: commitment.name,
        description: commitment.description,
        amount: commitment.amount.toString().replace('.', ','),
        dueDate: commitment.dueDate ?? '',
        groupId: commitment.groupId,
        category: commitment.category.toLowerCase(),
        splitMode: commitment.splitMode,
      });
    } else {
      reset({
        name: '',
        description: '',
        amount: '',
        dueDate: '',
        groupId: '',
        category: '',
        splitMode: 'equal',
      });
    }
  }, [visible, commitment, reset]);

  const watched = watch();
  const selectedGroup = groups.find((group) => group.id === watched.groupId);
  const members = useMemo(() => selectedGroup?.members ?? [], [selectedGroup]);

  const [customSplits, setCustomSplits] = useState<{ memberId: string; amount: number }[]>([]);

  useEffect(() => {
    if (commitment && visible) {
      setCustomSplits(
        commitment.splits.map((split) => ({
          memberId: split.memberId,
          amount: split.amount,
        })),
      );
    }
    if (!visible) setCustomSplits([]);
  }, [commitment, visible]);

  const splitResult = useMemo(() => {
    const amount = Number(watched.amount.replace(',', '.')) || 0;
    return computeSplits(amount, members, watched.splitMode as SplitMode, customSplits);
  }, [watched.amount, watched.splitMode, customSplits, members]);

  const totalMatches = splitResult.balanced;

  const handleClose = useCallback(() => {
    reset();
    setCustomSplits([]);
    onClose();
  }, [reset, onClose]);

  const onValidSubmit = handleSubmit((values) => {
    const amount = Number(values.amount.replace(',', '.')) || 0;
    const group = groups.find((g) => g.id === values.groupId);
    if (!group) return;
    const categoryLabel = categories.find((c) => c.id === values.category)?.label ?? 'Outros';
    if (commitment) {
      updateCommitment(commitment.id, {
        name: values.name.trim(),
        description: values.description.trim(),
        amount,
        dueDate: values.dueDate?.trim() || undefined,
        groupId: group.id,
        groupName: group.name,
        category: categoryLabel,
        splitMode: values.splitMode,
        splits: splitResult.entries.map((entry) => {
          const existing = commitment.splits.find(
            (split) => split.memberId === entry.memberId,
          );
          return {
            memberId: entry.memberId,
            amount: entry.amount,
            paid: existing?.paid ?? false,
          };
        }),
      });
      onCreated?.(commitment);
    } else {
      const created = addCommitment({
        name: values.name.trim(),
        description: values.description.trim(),
        amount,
        dueDate: values.dueDate?.trim() || undefined,
        groupId: group.id,
        groupName: group.name,
        category: categoryLabel,
        splitMode: values.splitMode,
        splits: splitResult.entries,
      });
      onCreated?.(created);
    }
    handleClose();
  });

  return (
    <Modal
      visible={visible}
      onClose={handleClose}
      title={isEdit ? 'Editar compromisso' : 'Novo compromisso'}
      subtitle={isEdit ? 'Atualize os dados do compromisso' : 'Defina um compromisso para o grupo'}
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
              disabled={!isValid || (watched.splitMode === 'custom' && !totalMatches)}
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
                label="Nome"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Ex: Aluguel Março"
                error={errors.name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value, onBlur } }) => (
              <Input
                label="Descrição"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Detalhes"
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
                name="dueDate"
                render={({ field: { onChange, value, onBlur } }) => (
                  <Input
                    label="Vencimento"
                    value={value ?? ''}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="DD/MM/AAAA"
                    keyboardType="numeric"
                  />
                )}
              />
            </Box>
          </Box>

          <Box>
            <Select
              label="Grupo"
              placeholder="Selecione um grupo"
              value={watched.groupId}
              onChange={(value) => setValue('groupId', value, { shouldValidate: true })}
              options={groups.map<SelectOption>((group) => ({ id: group.id, label: group.name }))}
              error={errors.groupId?.message}
            />
          </Box>

          <Box>
            <Select
              label="Categoria"
              placeholder="Selecione uma categoria"
              value={watched.category}
              onChange={(value) => setValue('category', value, { shouldValidate: true })}
              options={categories.map<SelectOption>((cat) => ({ id: cat.id, label: cat.label }))}
              error={errors.category?.message}
            />
          </Box>

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
                          {mode === 'equal' ? 'Igual entre todos' : 'Personalizada'}
                        </Text>
                      </Box>
                    </PressableBox>
                  );
                })}
              </Box>

              {watched.splitMode === 'equal' ? (
                <Box mt="sm">
                  {members.map((member) => {
                    const split = splitResult.entries.find(
                      (e) => e.memberId === member.id,
                    );
                    return (
                      <Box
                        key={member.id}
                        flexDirection="row"
                        alignItems="center"
                        justifyContent="space-between"
                        py="xs"
                      >
                        <Text variant="body">{member.name}</Text>
                        <Text variant="bodyStrong">
                          R$ {(split?.amount ?? 0).toFixed(2)}
                        </Text>
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Box mt="sm" gap="xs">
                  {members.map((member) => {
                    const value = customSplits.find(
                      (entry) => entry.memberId === member.id,
                    )?.amount ?? 0;
                    return (
                      <Box key={member.id} gap="xxs">
                        <Text variant="bodySmall" color="textSecondary">
                          {member.name}
                        </Text>
                        <Input
                          value={value.toString().replace('.', ',')}
                          onChangeText={(text) => {
                            const numeric =
                              Number(text.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
                            setCustomSplits((prev) => {
                              const next = prev.filter(
                                (entry) => entry.memberId !== member.id,
                              );
                              next.push({ memberId: member.id, amount: numeric });
                              return next;
                            });
                          }}
                          placeholder="0,00"
                          keyboardType="decimal-pad"
                        />
                      </Box>
                    );
                  })}
                  <Text
                    variant="caption"
                    color={totalMatches ? 'success' : 'danger'}
                    mt="xs"
                  >
                    Soma atual: R$ {splitResult.total.toFixed(2)}{' '}
                    {totalMatches
                      ? '· bate com o total'
                      : '· precisa igualar ao valor total'}
                  </Text>
                </Box>
              )}
            </Box>
          ) : null}
        </Box>
      </ScrollView>
    </Modal>
  );
}

export default NewCommitmentModal;
