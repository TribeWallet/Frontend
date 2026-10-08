import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../../../../components/Modal';
import { Input } from '../../../../components/Input';
import { Button } from '../../../../components/Button';
import { Box, Text, PressableBox } from '../../../../theme';
import { useAppGroups } from '../../../../contexts/AppContext';
import { getErrorMessage } from '../../../../services/api/apiClient';
import { fullName, isValidEmail } from '../../../../utils/formatters';
import { useAuthStore } from '../../../auth/stores/authStore';
import {
  findUsuarioByEmail,
  searchUsuariosByNome,
} from '../../../usuario/services/usuarioService';
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
  onDeleted?: () => void;
  group?: Group | null;
}

interface PendingMember {
  usuarioToken: string;
  name: string;
  email: string;
}

export function NewGroupModal({
  visible,
  onClose,
  onCreated,
  onDeleted,
  group,
}: NewGroupModalProps) {
  const { addGroup, updateGroup, deleteGroup, addGroupMembers, removeGroupMember } =
    useAppGroups();
  const currentUser = useAuthStore((state) => state.user);
  const isEdit = Boolean(group);

  const [members, setMembers] = useState<PendingMember[]>([]);
  const [search, setSearch] = useState('');
  const [memberError, setMemberError] = useState<string | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
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
    } else {
      reset({ name: '', description: '', tone: 'blue' });
    }
    setMembers([]);
    setSearch('');
    setMemberError(null);
    setSubmitError(null);
  }, [visible, group, reset]);

  const watched = watch();

  /** A API vincula integrantes por usuarioToken: só entra quem já tem conta. */
  const lookupUsuario = async (term: string): Promise<PendingMember | null> => {
    if (isValidEmail(term)) {
      const usuario = await findUsuarioByEmail(term);
      if (!usuario) {
        setMemberError('Nenhum usuário cadastrado com esse e-mail.');
        return null;
      }
      return {
        usuarioToken: usuario.usuarioToken,
        name: fullName(usuario.nome, usuario.sobrenome),
        email: usuario.email,
      };
    }
    const encontrados = await searchUsuariosByNome(term);
    if (encontrados.length === 0) {
      setMemberError('Nenhum usuário encontrado com esse nome.');
      return null;
    }
    if (encontrados.length > 1) {
      setMemberError(
        `${encontrados.length} usuários com esse nome. Informe o e-mail para escolher.`,
      );
      return null;
    }
    const [usuario] = encontrados;
    return {
      usuarioToken: usuario.usuarioToken,
      name: fullName(usuario.nome, usuario.sobrenome),
      email: usuario.email,
    };
  };

  const handleAddMember = async () => {
    const term = search.trim();
    if (term.length < 2) {
      setMemberError('Informe o nome ou o e-mail do integrante.');
      return;
    }
    if (term.toLowerCase() === currentUser?.email.toLowerCase()) {
      setMemberError('Você já faz parte do grupo.');
      return;
    }

    setLookingUp(true);
    setMemberError(null);
    try {
      const found = await lookupUsuario(term);
      if (!found) return;

      const alreadyInGroup = group?.members.some(
        (member) => member.id === found.usuarioToken,
      );
      if (alreadyInGroup) {
        setMemberError('Esse integrante já está no grupo.');
        return;
      }
      if (members.some((member) => member.usuarioToken === found.usuarioToken)) {
        setMemberError('Esse integrante já foi adicionado.');
        return;
      }

      if (group) {
        // Grupo já existe: o vínculo vai direto para a API.
        await addGroupMembers(group.id, [found.usuarioToken]);
      } else {
        setMembers((prev) => [...prev, found]);
      }
      setSearch('');
    } catch (error) {
      setMemberError(getErrorMessage(error));
    } finally {
      setLookingUp(false);
    }
  };

  const handleRemovePending = (usuarioToken: string) => {
    setMembers((prev) => prev.filter((member) => member.usuarioToken !== usuarioToken));
  };

  const handleRemoveMember = (integranteToken: string, name: string) => {
    if (!group) return;
    Alert.alert('Remover integrante', `Remover ${name} do grupo?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          setSubmitting(true);
          setSubmitError(null);
          try {
            await removeGroupMember(group.id, integranteToken);
          } catch (error) {
            setSubmitError(getErrorMessage(error));
          } finally {
            setSubmitting(false);
          }
        },
      },
    ]);
  };

  const handleClose = useCallback(() => {
    reset();
    setMembers([]);
    setSearch('');
    setMemberError(null);
    setSubmitError(null);
    onClose();
  }, [reset, onClose]);

  const onValidSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (group) {
        await updateGroup(group.id, {
          name: values.name,
          description: values.description,
          tone: values.tone,
        });
        onCreated?.(group);
      } else {
        const created = await addGroup({
          name: values.name,
          description: values.description,
          tone: values.tone,
          memberTokens: members.map((member) => member.usuarioToken),
        });
        onCreated?.(created);
      }
      handleClose();
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  });

  const handleDelete = () => {
    if (!group) return;
    Alert.alert('Excluir grupo', `Tem certeza que deseja excluir "${group.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          setSubmitting(true);
          setSubmitError(null);
          try {
            await deleteGroup(group.id);
            handleClose();
            onDeleted?.();
          } catch (error) {
            setSubmitError(getErrorMessage(error));
          } finally {
            setSubmitting(false);
          }
        },
      },
    ]);
  };

  return (
    <Modal
      visible={visible}
      onClose={handleClose}
      title={isEdit ? 'Editar grupo' : 'Novo grupo'}
      subtitle={
        isEdit ? 'Atualize as informações do grupo' : 'Crie um grupo e adicione integrantes'
      }
      showCloseButton
      footer={
        <Box flexDirection="row" gap="sm">
          <Box flex={1}>
            <Button title="Cancelar" onPress={handleClose} variant="outline" fullWidth />
          </Box>
          {isEdit ? (
            <Box flex={1}>
              <Button
                title="Excluir"
                onPress={handleDelete}
                variant="danger"
                disabled={submitting}
                fullWidth
              />
            </Box>
          ) : null}
          <Box flex={1}>
            <Button
              title={isEdit ? 'Salvar' : 'Criar grupo'}
              onPress={onValidSubmit}
              disabled={!isValid}
              loading={submitting}
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
                placeholder="Ex: Apartamento 302"
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

            {group ? (
              group.members.map((member, index) => (
                <Box
                  key={member.integranteToken}
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="space-between"
                  py="xs"
                  borderTopWidth={index === 0 ? 0 : 1}
                  borderColor="border"
                >
                  <Box flex={1}>
                    <Text variant="bodyStrong">
                      {member.name}
                      {member.id === currentUser?.id ? ' (você)' : ''}
                    </Text>
                    {member.email ? (
                      <Text variant="caption" color="textSecondary">
                        {member.email}
                      </Text>
                    ) : null}
                  </Box>
                  {member.id === currentUser?.id ? null : (
                    <PressableBox
                      onPress={() => handleRemoveMember(member.integranteToken, member.name)}
                      accessibilityRole="button"
                      hitSlop={6}
                    >
                      <Text variant="captionStrong" color="danger">Remover</Text>
                    </PressableBox>
                  )}
                </Box>
              ))
            ) : (
              <>
                {currentUser ? (
                  <Box py="xs">
                    <Text variant="bodyStrong">{currentUser.name} (você)</Text>
                    <Text variant="caption" color="textSecondary">
                      {currentUser.email}
                    </Text>
                  </Box>
                ) : null}
                {members.map((member) => (
                  <Box
                    key={member.usuarioToken}
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="space-between"
                    py="xs"
                    borderTopWidth={1}
                    borderColor="border"
                  >
                    <Box>
                      <Text variant="bodyStrong">{member.name}</Text>
                      <Text variant="caption" color="textSecondary">
                        {member.email}
                      </Text>
                    </Box>
                    <PressableBox
                      onPress={() => handleRemovePending(member.usuarioToken)}
                      accessibilityRole="button"
                      hitSlop={6}
                    >
                      <Text variant="captionStrong" color="danger">Remover</Text>
                    </PressableBox>
                  </Box>
                ))}
              </>
            )}

            <Box mt="sm">
              <Input
                label="Nome ou e-mail do integrante"
                value={search}
                onChangeText={(text) => {
                  setSearch(text);
                  if (memberError) setMemberError(null);
                }}
                placeholder="Ana ou ana@exemplo.com"
                autoCapitalize="none"
                autoCorrect={false}
                error={memberError ?? undefined}
                helperText="A pessoa precisa ter uma conta no TribeWallet."
              />
            </Box>
            <Button
              title="Adicionar integrante"
              onPress={handleAddMember}
              variant="outline"
              size="sm"
              loading={lookingUp}
              fullWidth
            />
          </Box>

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

export default NewGroupModal;
