import React, { useState } from 'react';
import { Alert, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { TopBar } from '../../../components/TopBar';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';
import { Box, Text } from '../../../theme';
import { useUserStore } from '../stores/userStore';
import { useTopBarActions } from '../../../hooks/useTopBarActions';
import type { RootStackParamList } from '../../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Support'>;

export function SupportScreen() {
  const navigation = useNavigation<NavigationProp>();
  const profile = useUserStore((state) => state.profile);
  const topBar = useTopBarActions();
  const { width } = useWindowDimensions();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const isSmallPhone = width < 360;

  const handleSubmit = () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Suporte', 'Preencha o assunto e a mensagem.');
      return;
    }
    Alert.alert('Suporte', 'Mensagem enviada. Responderemos em breve.');
    setSubject('');
    setMessage('');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFB' }} edges={['top']}>
      <Box flex={1} width="100%" maxWidth={430} alignSelf="center" bg="background">
        <TopBar
          initials={profile?.initials ?? 'G'}
          onOpenMenu={topBar.openMenu}
          onOpenNotifications={topBar.openNotifications}
          onOpenProfile={topBar.openProfile}
        />
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 110 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Box width="100%" px={isSmallPhone ? 'sm' : 'md'} pt="md" gap="md">
            <Text variant="h2">Suporte</Text>
            <Text variant="bodySmall" color="textSecondary">
              Conte para nós o que está acontecendo. Vamos responder no seu e-mail.
            </Text>
            <Input
              label="Assunto"
              value={subject}
              onChangeText={setSubject}
              placeholder="Resumo do problema"
            />
            <Input
              label="Mensagem"
              value={message}
              onChangeText={setMessage}
              placeholder="Detalhe o ocorrido..."
              multiline
              numberOfLines={6}
            />
            <Button title="Enviar mensagem" onPress={handleSubmit} fullWidth />
            <Box
              bg="surface"
              borderRadius="md"
              borderWidth={1}
              borderColor="cardBorder"
              p="md"
              gap="xs"
            >
              <Text variant="bodyStrong">Outros canais</Text>
              <Text variant="bodySmall" color="textSecondary">
                suporte@tribewallet.com
              </Text>
              <Text variant="caption" color="textMuted">
                Tempo médio de resposta: 24h em dias úteis.
              </Text>
            </Box>
          </Box>
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
}

export default SupportScreen;
