import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { Modal } from '../../../../components/Modal';
import { Input } from '../../../../components/Input';
import { Button } from '../../../../components/Button';
import { Box, Text } from '../../../../theme';
import { getErrorMessage } from '../../../../services/api/apiClient';
import { isValidEmail } from '../../../../utils/formatters';

interface ProfileModalProps {
  visible: boolean;
  initials: string;
  name: string;
  email: string;
  stats: { value: string; label: string }[];
  onClose: () => void;
  onSave?: (data: { initials: string; name: string; email: string }) => void | Promise<void>;
  onLogout?: () => void;
  /** Desligue quando o e-mail não puder ser alterado (a API não aceita troca de e-mail). */
  emailEditable?: boolean;
}

export function ProfileModal({
  visible,
  initials: initialInitials,
  name: initialName,
  email: initialEmail,
  stats,
  onClose,
  onSave,
  onLogout,
  emailEditable = true,
}: ProfileModalProps) {
  const [initials, setInitials] = useState(initialInitials);
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setInitials(initialInitials);
    setName(initialName);
    setEmail(initialEmail);
  }, [initialInitials, initialName, initialEmail, visible]);

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
      });
      setError(null);
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

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
          >
            <Text variant="h2" color="white">{initials}</Text>
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
