import React, { useState } from 'react';
import { Alert, ScrollView, Share, useWindowDimensions } from 'react-native';
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

  // Não existe endpoint de suporte na API: a mensagem sai pelo app que o usuário escolher.
  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Suporte', 'Preencha o assunto e a mensagem.');
      return;
    }
    try {
      await Share.share({
        title: subject.trim(),
        message: `${subject.trim()}\n\n${message.trim()}\n\n— ${profile?.name ?? ''} (${profile?.email ?? ''})`,
      });
      setSubject('');
      setMessage('');
    } catch {
      Alert.alert('Suporte', 'Não foi possível abrir o compartilhamento.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFB' }} edges={['top']}>
      <Box flex={1} width="100%" maxWidth={430} alignSelf="center" bg="background">
        <TopBar
          initials={profile?.initials ?? ''}
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
              Descreva o que está acontecendo e envie pelo app de sua preferência
              (e-mail, mensageria).
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
          </Box>
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
}

export default SupportScreen;
