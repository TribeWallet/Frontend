import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../../../../components/Modal';
import { Input } from '../../../../components/Input';
import { Button } from '../../../../components/Button';
import { Box, Text, PressableBox } from '../../../../theme';
import { useAppGroups } from '../../../../contexts/AppContext';
import type { Group } from '../../types/Group';

const schema = z.object({
  name: z.string().min(2, 'Informe um nome com pelo menos 2 caracteres'),
  description: z.string().min(3, 'Descreva brevemente o grupo'),
  tone: z.enum(['blue', 'green', 'family']),
});

type FormValues = z.infer<typeof schema>;

const tones: { id: Group['tone']; label: string; color: string }[] = [
  { id: 'blue', label: 'Casa', color: '#E8F1FF' },
  { id: 'green', label: 'Viagem', color: '#E0F7EF' },
  { id: 'family', label: 'Família', color: '#FDE8EB' },
];

interface NewGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated?: (group: Group) => void;
  group?: Group | null;
}

export function NewGroupModal({
  visible,
  onClose,
  onCreated,
  group,
}: NewGroupModalProps) {
  const { addGroup, updateGroup, deleteGroup } = useAppGroups();
  const isEdit = Boolean(group);

  const [members, setMembers] = useState<{ name: string; email?: string }[]>([]);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { name: '', description: '', tone: 'blue' },
    mode: 'onChange',
  });

  useEffect(() => {
    if (!visible) return;
    if (group) {
      reset({
        name: group.name,
        description: group.description,
        tone: group.tone,
      });
      setMembers(group.members.map((m) => ({ name: m.name, email: m.email })));
    } else {
      reset({ name: '', description: '', tone: 'blue' });
      setMembers([]);
    }
    setNewName('');
    setNewEmail('');
  }, [visible, group, reset]);

  const watched = watch();

  const handleAddMember = () => {
    if (!newName.trim()) return;
    const exists = members.some(
      (member) => member.name.toLowerCase() === newName.trim().toLowerCase(),
    );
    if (exists) return;
    setMembers((prev) => [
      ...prev,
      { name: newName.trim(), email: newEmail.trim() || undefined },
    ]);
    setNewName('');
    setNewEmail('');
  };

  const handleRemoveMember = (index: number) => {
    setMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClose = useCallback(() => {
    reset();
    setMembers([]);
    setNewName('');
    setNewEmail('');
    onClose();
  }, [reset, onClose]);

  const onValidSubmit = handleSubmit((values) => {
    if (group) {
      updateGroup(group.id, {
        name: values.name.trim(),
        description: values.description.trim(),
        tone: values.tone,
        members: members.map((member, index) => ({
          id: group.members[index]?.id ?? `user-${index}`,
          name: member.name,
          email: member.email,
          initials: member.name
            .split(' ')
            .map((part) => part[0]?.toUpperCase() ?? '')
            .slice(0, 2)
            .join('') || 'NV',
        })),
      });
      onCreated?.(group);
    } else {
      const created = addGroup({
        name: values.name.trim(),
        description: values.description.trim(),
        tone: values.tone,
        members,
      });
      onCreated?.(created);
    }
    handleClose();
  });

  const handleDelete = () => {
    if (!group) return;
    deleteGroup(group.id);
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      onClose={handleClose}
      title={isEdit ? 'Editar grupo' : 'Novo grupo'}
      subtitle={isEdit ? 'Atualize as informações do grupo' : 'Crie um grupo e adicione integrantes'}
      showCloseButton
      footer={
        <Box flexDirection="row" gap="sm">
          <Box flex={1}>
            <Button
              title="Cancelar"
              onPress={handleClose}
              variant="outline"
              fullWidth
            />
          </Box>
          {isEdit ? (
            <Box flex={1}>
              <Button
                title="Excluir"
                onPress={handleDelete}
                variant="danger"
                fullWidth
              />
            </Box>
          ) : null}
          <Box flex={1}>
            <Button
              title={isEdit ? 'Salvar' : 'Criar grupo'}
              onPress={onValidSubmit}
              disabled={!isValid}
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
                label="Nome do grupo"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Ex: República Universitária"
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
                placeholder="Para que serve este grupo?"
                error={errors.description?.message}
              />
            )}
          />

          <Box>
            <Text variant="label" marginBottom="xs">Categoria</Text>
            <Box flexDirection="row" gap="xs" flexWrap="wrap">
              {tones.map((tone) => {
                const active = watched.tone === tone.id;
                return (
                  <PressableBox
                    key={tone.id}
                    onPress={() =>
                      setValue('tone', tone.id as FormValues['tone'], {
                        shouldValidate: true,
                      })
                    }
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <Box
                      flexDirection="row"
                      alignItems="center"
                      gap="xs"
                      px="md"
                      py="xs"
                      borderRadius="full"
                      bg={active ? 'primary' : 'surface'}
                      borderWidth={1}
                      borderColor={active ? 'primary' : 'border'}
                    >
                      <Box
                        width={12}
                        height={12}
                        borderRadius="full"
                        style={{ backgroundColor: tone.color }}
                      />
                      <Text
                        variant="captionStrong"
                        color={active ? 'white' : 'textSecondary'}
                      >
                        {tone.label}
                      </Text>
                    </Box>
                  </PressableBox>
                );
              })}
            </Box>
          </Box>

          <Box>
            <Text variant="label" marginBottom="xs">Integrantes</Text>
            {members.map((member, index) => (
              <Box
                key={`${member.name}-${index}`}
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                py="xs"
                borderTopWidth={index === 0 ? 0 : 1}
                borderColor="border"
              >
                <Box>
                  <Text variant="bodyStrong">{member.name}</Text>
                  {member.email ? (
                    <Text variant="caption" color="textSecondary">
                      {member.email}
                    </Text>
                  ) : null}
                </Box>
                <PressableBox
                  onPress={() => handleRemoveMember(index)}
                  accessibilityRole="button"
                  hitSlop={6}
                >
                  <Text variant="captionStrong" color="danger">Remover</Text>
                </PressableBox>
              </Box>
            ))}
            <Box flexDirection="row" gap="xs" mt="sm">
              <Box flex={2}>
                <Input
                  label="Nome"
                  value={newName}
                  onChangeText={setNewName}
                  placeholder="Nome do integrante"
                />
              </Box>
              <Box flex={1.4}>
                <Input
                  label="E-mail"
                  value={newEmail}
                  onChangeText={setNewEmail}
                  placeholder="email@exemplo.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </Box>
            </Box>
            <Button
              title="Adicionar integrante"
              onPress={handleAddMember}
              variant="outline"
              size="sm"
              fullWidth
            />
          </Box>
        </Box>
      </ScrollView>
    </Modal>
  );
}

export default NewGroupModal;
