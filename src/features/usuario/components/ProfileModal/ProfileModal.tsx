import React, { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Modal } from '../../../../components/Modal';
import { Input } from '../../../../components/Input';
import { Button } from '../../../../components/Button';
import { Box, Text, PressableBox } from '../../../../theme';
import { getErrorMessage } from '../../../../services/api/apiClient';
import { isValidEmail } from '../../../../utils/formatters';
import type { AttachedFile } from '../../../../types/file';

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg'];

export interface ProfileSaveData {
  initials: string;
  name: string;
  email: string;
  imagem?: AttachedFile;
}

interface ProfileModalProps {
  visible: boolean;
  initials: string;
  name: string;
  imageUrl?: string | null;
  email: string;
  stats: { value: string; label: string }[];
  onClose: () => void;
  onSave?: (data: ProfileSaveData) => void | Promise<void>;
  onLogout?: () => void;
  emailEditable?: boolean;
}

export function ProfileModal({
  visible,
  initials: initialInitials,
  name: initialName,
  imageUrl: initialImageUrl,
  email: initialEmail,
  stats,
  onClose,
  onSave,
  onLogout,
  emailEditable = true,
}: ProfileModalProps) {
  const [initials, setInitials] = useState(initialInitials);
  const [imageUrl, setImageUrl] = useState<string | null | undefined>(undefined);
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [imagem, setImagem] = useState<AttachedFile | null>(null);

  useEffect(() => {
    setInitials(initialInitials);
    setName(initialName);
    setImageUrl(initialImageUrl);
    setEmail(initialEmail);
    setImagem(null);
  }, [initialInitials, initialName, initialEmail, initialImageUrl, visible]);

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
      setError('A imagem deve ser PNG, JPG ou JPEG.');
      return;
    }
    setError(null);
    setImagem({
      uri: asset.uri,
      name: asset.fileName ?? `imagem.${extension || 'jpg'}`,
      type: mimeType,
    });
  }, []);

  const handleSave = async () => {
    if (name.trim().length < 3) {
      setError('Informe um nome com pelo menos 3 caracteres.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Informe um e-mail válido.');
      return;
    }
    setSaving(true);
    try {
      await onSave?.({
        initials: initials.trim() || 'NV',
        name: name.trim(),
        email: email.trim(),
        imagem: imagem ?? undefined,
      });
      setError(null);
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  const avatarSource = imagem
    ? { uri: imagem.uri }
    : imageUrl
      ? { uri: imageUrl }
      : null;

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="Editar perfil"
      subtitle="Atualize suas informações pessoais"
      showCloseButton
      footer={
        <Box gap="sm">
          <Button title="Salvar alterações" onPress={handleSave} loading={saving} fullWidth />
          {onLogout ? (
            <Button title="Sair" onPress={onLogout} variant="danger" fullWidth />
          ) : null}
        </Box>
      }
    >
      <ScrollView
        style={{ maxHeight: 480 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Box gap="md" alignItems="center">
          <Box
            width={80}
            height={80}
            borderRadius="full"
            bg="primary"
            alignItems="center"
            justifyContent="center"
            overflow="hidden"
          >
            {avatarSource ? (
              <Image source={avatarSource} style={{ width: 80, height: 80 }} />
            ) : (
              <Text variant="h2" color="white">{initials}</Text>
            )}
          </Box>

          <Box flexDirection="row" gap="xs" alignItems="center">
            <Button
              title={imagem ? 'Trocar foto' : 'Escolher foto'}
              variant="outline"
              size="sm"
              onPress={pickImagem}
            />
            {imagem ? (
              <PressableBox onPress={() => setImagem(null)} hitSlop={8}>
                <Text variant="captionStrong" color="danger">Remover</Text>
              </PressableBox>
            ) : null}
          </Box>

          <Box width="100%" gap="sm">
            <Input
              label="Iniciais"
              value={initials}
              onChangeText={(text) => setInitials(text.toUpperCase().slice(0, 2))}
              placeholder='G'
            />
            <Input
              label="Nome"
              value={name}
              onChangeText={setName}
              placeholder="Nome completo"
            />
            <Input
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              placeholder="email@exemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={emailEditable}
              helperText={emailEditable ? undefined : 'O e-mail não pode ser alterado.'}
            />
          </Box>
          {error ? (
            <Text variant="caption" color="danger" alignSelf="flex-start">
              {error}
            </Text>
          ) : null}

          <Box flexDirection="row" gap="sm" mt="sm" width="100%">
            {stats.map((stat) => (
              <Box
                key={stat.label}
                flex={1}
                bg="background"
                borderRadius="md"
                py="md"
                alignItems="center"
              >
                <Text variant="h3">{stat.value}</Text>
                <Text variant="caption" color="textSecondary" mt="xxs">
                  {stat.label}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>
      </ScrollView>
    </Modal>
  );
}

export default ProfileModal;
