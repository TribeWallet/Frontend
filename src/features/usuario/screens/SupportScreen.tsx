import React, { useState } from 'react';
import { Alert, ScrollView, Share, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { TopBar } from '../../../components/TopBar';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';
import { Box, Text, useTheme } from '../../../theme';
import { useUserStore } from '../stores/userStore';
import { useTopBarActions } from '../../../hooks/useTopBarActions';
import { useTranslation } from '../../../hooks/useTranslation';
import type { RootStackParamList } from '../../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Support'>;

export function SupportScreen() {
  const navigation = useNavigation<NavigationProp>();
  const profile = useUserStore((state) => state.profile);
  const topBar = useTopBarActions();
  const { width } = useWindowDimensions();
  const { t } = useTranslation();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const isSmallPhone = width < 360;
  const theme = useTheme();

  // Não existe endpoint de suporte na API: a mensagem sai pelo app que o usuário escolher.
  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert(t('support.alertTitle'), t('support.fillFields'));
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
      Alert.alert(t('support.alertTitle'), t('support.shareError'));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
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
            <Text variant="h2">{t('support.title')}</Text>
            <Text variant="bodySmall" color="textSecondary">
              {t('support.subtitle')}
            </Text>
            <Input
              label={t('support.subject')}
              value={subject}
              onChangeText={setSubject}
              placeholder={t('support.subjectPlaceholder')}
            />
            <Input
              label={t('support.message')}
              value={message}
              onChangeText={setMessage}
              placeholder={t('support.messagePlaceholder')}
              multiline
              numberOfLines={6}
            />
            <Button title={t('support.send')} onPress={handleSubmit} fullWidth />
          </Box>
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
}

export default SupportScreen;
