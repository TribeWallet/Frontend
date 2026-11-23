import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../../../../components/Modal';
import { Input } from '../../../../components/Input';
import { Button } from '../../../../components/Button';
import { Box, Text, PressableBox, useTheme } from '../../../../theme';
import { useTranslation } from '../../../../hooks/useTranslation';
import { useAppGroups } from '../../../../contexts/AppContext';
import { getErrorMessage } from '../../../../services/api/apiClient';
import { fullName, isValidEmail } from '../../../../utils/formatters';
import { useAuthStore } from '../../../auth/stores/authStore';
import {
  findUsuarioByEmail,
  searchUsuariosByNome,
} from '../../../usuario/services/usuarioService';
import type { Group, GroupMember } from '../../types/Group';

type FormValues = {
  name: string;
  description: string;
  tone: 'blue' | 'green' | 'family';
};

function tonesFor(theme: any, t: any) {
  return [
    { id: 'blue', label: t('grupos.toneCasa'), color: theme.colors.primaryLight },
    { id: 'green', label: t('grupos.toneViagem'), color: theme.colors.successLight },
    { id: 'family', label: t('grupos.toneFamilia'), color: theme.colors.dangerLight },
  ];
}

interface NewGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated?: (group: Group) => void;
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
  group,
}: NewGroupModalProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  const schema = z.object({
    name: z.string().min(2, t('newGroup.nameMinLength')),
    description: z.string().min(3, t('newGroup.descriptionMinLength')),
    tone: z.enum(['blue', 'green', 'family']),
  });

  const { addGroup, updateGroup, addGroupMembers, removeGroupMember } =
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
  const isCurrentUserMember = (member: GroupMember) =>
    member.usuarioToken === currentUser?.id ||
    member.email?.trim().toLowerCase() === currentUser?.email?.trim().toLowerCase();

  /** A API vincula integrantes por usuarioToken: só entra quem já tem conta. */
  const lookupUsuario = async (term: string): Promise<PendingMember | null> => {
    if (isValidEmail(term)) {
      const usuario = await findUsuarioByEmail(term);
      if (!usuario) {
        setMemberError(t('grupos.memberNotFoundEmail'));
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
      setMemberError(t('grupos.memberNotFoundName'));
      return null;
    }
    if (encontrados.length > 1) {
      setMemberError(t('grupos.membersFound', { count: encontrados.length }));
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
      setMemberError(t('grupos.memberSearchRequired'));
      return;
    }
    if (term.toLowerCase() === currentUser?.email.toLowerCase()) {
      setMemberError(t('grupos.alreadyMember'));
      return;
    }

    setLookingUp(true);
    setMemberError(null);
    try {
      const found = await lookupUsuario(term);
      if (!found) return;

      const alreadyInGroup = group?.members.some(
        (member) =>
          member.usuarioToken === found.usuarioToken ||
          member.email?.trim().toLowerCase() === found.email.trim().toLowerCase(),
      );
      if (alreadyInGroup) {
        setMemberError(t('grupos.memberAlreadyInGroup'));
        return;
      }
      if (members.some((member) => member.usuarioToken === found.usuarioToken)) {
        setMemberError(t('grupos.memberAlreadyAdded'));
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
    Alert.alert(t('grupos.removeMemberTitle'), t('grupos.removeMemberConfirm', { name }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('grupos.remove'),
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

  return (
    <Modal
      visible={visible}
      onClose={handleClose}
      title={isEdit ? t('newGroup.editTitle') : t('newGroup.title')}
      subtitle={
        isEdit ? t('newGroup.editSubtitle') : t('newGroup.subtitle')
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
              title={isEdit ? t('common.save') : t('newGroup.createGroup')}
              onPress={onValidSubmit}
              disabled={!isValid}
              loading={submitting}
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
                label={t('newGroup.groupName')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t('newGroup.groupNamePlaceholder')}
                error={errors.name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value, onBlur } }) => (
              <Input
                label={t('newGroup.description')}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t('newGroup.descriptionPlaceholder')}
                error={errors.description?.message}
              />
            )}
          />

          <Box>
            <Text variant="label" marginBottom="xs">{t('grupos.category')}</Text>
            <Box flexDirection="row" gap="xs" flexWrap="wrap">
              {tonesFor(theme, t).map((tone) => {
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
            <Text variant="label" marginBottom="xs">{t('common.members')}</Text>

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
                      {isCurrentUserMember(member) ? t('grupos.you') : ''}
                    </Text>
                    {member.email ? (
                      <Text variant="caption" color="textSecondary">
                        {member.email}
                      </Text>
                    ) : null}
                  </Box>
                  {isCurrentUserMember(member) ? null : (
                    <Button
                      title={t('commitments.remove')}
                      variant="outline"
                      size="sm"
                      onPress={() => handleRemoveMember(member.integranteToken, member.name)}
                    />
                  )}
                </Box>
              ))
            ) : (
              <>
                {currentUser ? (
                  <Box py="xs">
                    <Text variant="bodyStrong">{currentUser.name}{t('grupos.you')}</Text>
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
                    <Button
                      title={t('commitments.remove')}
                      variant="outline"
                      size="sm"
                      onPress={() => handleRemovePending(member.usuarioToken)}
                    />
                  </Box>
                ))}
              </>
            )}

            <Box mt="sm">
              <Input
                label={t('grupos.memberSearchLabel')}
                value={search}
                onChangeText={(text) => {
                  setSearch(text);
                  if (memberError) setMemberError(null);
                }}
                placeholder={t('grupos.memberSearchPlaceholder')}
                autoCapitalize="none"
                autoCorrect={false}
                error={memberError ?? undefined}
                helperText="A pessoa precisa ter uma conta no TribeWallet."
              />
            </Box>
            <Button
              title={t('grupos.addMember')}
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
    </Modal>
  );
}

export default NewGroupModal;
