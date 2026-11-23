import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, Switch, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';

import { TopBar } from '../../../components/TopBar';
import { Button } from '../../../components/Button';
import { Select, SelectOption } from '../../../components/Select';
import { Box, Text, PressableBox, useTheme } from '../../../theme';
import { LegalModal } from '../../../components/LegalModal/LegalModal';
import { useUserStore } from '../../usuario/stores/userStore';
import { useAppGroups } from '../../../contexts/AppContext';
import { useAppNotifications } from '../../../hooks/useNotifications';
import {
  usePreferencesStore,
  AppearanceMode,
  Currency,
} from '../stores/preferencesStore';
import { useAuthStore } from '../../auth/stores/authStore';
import { useUserStore as useProfileStore } from '../../usuario/stores/userStore';
import { deleteUsuario } from '../../usuario/services/usuarioService';
import { getErrorMessage } from '../../../services/api/apiClient';
import { formatCurrency } from '../../../utils/currency';
import { useTopBarActions } from '../../../hooks/useTopBarActions';
import { useTranslation } from '../../../hooks/useTranslation';
import { useFormatMoney } from '../../../hooks/useFormatMoney';
import type { RootStackParamList } from '../../../navigation/types';
import { version as appVersion } from '../../../../package.json';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function ChevronRight({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="m9 6 6 6-6 6"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text variant="captionStrong" color="textMuted" mb="xs" mt="md">
      {children.toUpperCase()}
    </Text>
  );
}

interface SettingRowProps {
  label: string;
  description?: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
}

function SettingRow({ label, description, trailing, onPress }: SettingRowProps) {
  const inner = (
    <Box
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      bg="surface"
      borderRadius="md"
      borderWidth={1}
      borderColor="cardBorder"
      px="md"
      py="md"
      mb="xs"
    >
      <Box flex={1} pr="sm">
        <Text variant="bodyStrong" color="text">{label}</Text>
        {description ? (
          <Text variant="caption" color="textSecondary" mt="xxs">
            {description}
          </Text>
        ) : null}
      </Box>
      {trailing ?? (onPress ? <ChevronRight color="textMuted" /> : null)}
    </Box>
  );

  if (!onPress) return inner;

  return (
    <PressableBox
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {({ pressed }: { pressed: boolean }) => (
        <Box opacity={pressed ? 0.85 : 1}>{inner}</Box>
      )}
    </PressableBox>
  );
}

// Só as opções que o app realmente aplica hoje.

export function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const topBar = useTopBarActions();
  const { width } = useWindowDimensions();
  const isSmallPhone = width < 360;
  const theme = useTheme();
  const { t, changeLanguage, language: i18nLanguage } = useTranslation();
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const formatMoney = useFormatMoney();

  const APPEARANCE_OPTIONS: SelectOption[] = [
    { id: 'light', label: t('settings.appearanceLight'), description: t('settings.appearanceLightDesc') },
    { id: 'dark', label: t('settings.appearanceDark'), description: t('settings.appearanceDarkDesc') },
    { id: 'system', label: t('settings.appearanceSystem'), description: t('settings.appearanceSystemDesc') },
  ];

  const CURRENCY_OPTIONS: SelectOption[] = [
    { id: 'BRL', label: t('settings.currencyBRL'), description: t('settings.currencyBRLDesc') },
  ];

  const LANGUAGE_OPTIONS: SelectOption[] = [
    { id: 'pt-BR', label: t('common.languagePortuguese') },
    { id: 'en-US', label: t('common.languageEnglish') },
    { id: 'es-ES', label: t('common.languageSpanish') },
  ];

  const profile = useUserStore((state) => state.profile);
  const authUser = useAuthStore((state) => state.user);
  const authLogout = useAuthStore((state) => state.logout);
  const clearProfile = useProfileStore((state) => state.logout);

  const {
    appearance,
    currency,
    biometricLock,
    hideValues,
    defaultGroupId,
    language,
    setAppearance,
    setCurrency,
    setBiometricLock,
    setHideValues,
    setDefaultGroupId,
    setLanguage,
    reset,
  } = usePreferencesStore();

  const { groups } = useAppGroups();
  const {
    settings: notifSettings,
    updateSettings,
  } = useAppNotifications();

  const groupOptions: SelectOption[] = [
    { id: '', label: t('settings.groupNone') },
    ...groups.map((group) => ({ id: group.id, label: group.name })),
  ];

  const handleLogout = useCallback(() => {
    Alert.alert(t('settings.logoutConfirmTitle'), t('settings.logoutConfirmMsg'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.logout'),
        style: 'destructive',
        onPress: () => {
          authLogout();
          navigation.reset({ index: 0, routes: [{ name: 'Main' as never }] });
        },
      },
    ]);
  }, [authLogout, navigation]);

  const handleDeleteAccount = useCallback(() => {
    if (!authUser) return;
    Alert.alert(
      t('settings.deleteAccountTitle'),
      t('settings.deleteAccountConfirmMsg'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUsuario(authUser.id);
              clearProfile();
              authLogout();
            } catch (error) {
              Alert.alert(t('common.errorTitle'), getErrorMessage(error));
            }
          },
        },
      ],
    );
  }, [authUser, clearProfile, authLogout]);

  const handleReset = useCallback(() => {
    Alert.alert(
      t('settings.resetPreferencesTitle'),
      t('settings.resetPreferencesDesc'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('settings.resetPreferencesConfirm'), style: 'destructive', onPress: () => reset() },
      ],
    );
  }, [reset]);

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
          style={{ flex: 1, backgroundColor: theme.colors.background }}
          contentContainerStyle={{ paddingBottom: 110 }}
          showsVerticalScrollIndicator={false}
        >
          <Box width="100%" px={isSmallPhone ? 'sm' : 'md'} pt="md" gap="xs">
            <Text variant="h1">{t('settings.title')}</Text>
            <Text variant="bodySmall" color="textSecondary">
              {t('settings.subtitle')}
            </Text>

            <Box
              mt="md"
              bg="primaryLight"
              borderRadius="md"
              p="md"
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Text variant="captionStrong" color="primary">
                  {t('settings.contaAtiva')}
                </Text>
                <Text variant="bodyStrong" color="primary">
                  {profile?.name ?? ''}
                </Text>
                <Text variant="caption" color="textSecondary">
                  {profile?.email ?? ''}
                </Text>
              </Box>
            </Box>

            <SectionTitle>{t('settings.account')}</SectionTitle>
            <SettingRow
              label={t('settings.editProfile')}
              description={t('settings.editProfileDesc')}
              onPress={() => navigation.navigate('EditProfile')}
            />
            <SettingRow
              label={t('settings.history')}
              description={t('settings.historyDesc')}
              onPress={() => navigation.navigate('History')}
            />
            <SettingRow
              label={t('settings.support')}
              description={t('settings.supportDesc')}
              onPress={() => navigation.navigate('Support')}
            />

            <SectionTitle>{t('settings.preferences')}</SectionTitle>
            <Box mb="md" gap="md">
              <Select
                label={t('settings.appearance')}
                placeholder={t('settings.appearanceSelect')}
                value={appearance}
                onChange={(value) => setAppearance(value as AppearanceMode)}
                options={APPEARANCE_OPTIONS}
              />
              <Select
                label={t('settings.currency')}
                placeholder={t('settings.appearanceSelect')}
                value={currency}
                onChange={(value) => setCurrency(value as Currency)}
                options={CURRENCY_OPTIONS}
                helperText={`${t('settings.currencyExample')}: ${formatMoney(1234.56)}`}
              />
              <Select
                label={t('settings.language')}
                placeholder={t('settings.appearanceSelect')}
                value={language}
                onChange={(value) => {
                  setLanguage(value as 'pt-BR' | 'en-US' | 'es-ES');
                  changeLanguage(value as 'pt-BR' | 'en-US' | 'es-ES');
                }}
                options={LANGUAGE_OPTIONS}
              />
              <Select
                label={t('settings.defaultGroup')}
                placeholder={t('settings.appearanceSelect')}
                value={defaultGroupId ?? ''}
                onChange={(value) =>
                  setDefaultGroupId(value ? value : undefined)
                }
                options={groupOptions}
                helperText={t('settings.defaultGroupDesc')}
              />
            </Box>

            <SectionTitle>{t('settings.privacySecurity')}</SectionTitle>
            <SettingRow
              label={t('settings.biometricLock')}
              description={t('settings.biometricLockDesc')}
              trailing={
                <Switch
                  value={biometricLock}
                  onValueChange={setBiometricLock}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor={theme.colors.white}
                />
              }
            />
            <SettingRow
              label={t('settings.hideValues')}
              description={t('settings.hideValuesDesc')}
              trailing={
                <Switch
                  value={hideValues}
                  onValueChange={setHideValues}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor={theme.colors.white}
                />
              }
            />

            <SectionTitle>{t('settings.notifications')}</SectionTitle>
            <SettingRow
              label={t('settings.pushNotifications')}
              trailing={
                <Switch
                  value={notifSettings.pushEnabled}
                  onValueChange={(value) =>
                    updateSettings({ ...notifSettings, pushEnabled: value })
                  }
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor={theme.colors.white}
                />
              }
            />
            <SettingRow
              label={t('settings.emailNotifications')}
              trailing={
                <Switch
                  value={notifSettings.emailEnabled}
                  onValueChange={(value) =>
                    updateSettings({ ...notifSettings, emailEnabled: value })
                  }
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor={theme.colors.white}
                />
              }
            />
            <SettingRow
              label={t('settings.overdueAlerts')}
              description={t('settings.overdueAlertsDesc')}
              trailing={
                <Switch
                  value={notifSettings.overdueAlerts}
                  onValueChange={(value) =>
                    updateSettings({ ...notifSettings, overdueAlerts: value })
                  }
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor={theme.colors.white}
                />
              }
            />
            <SettingRow
              label={t('settings.weeklyDigest')}
              description={t('settings.weeklyDigestDesc')}
              trailing={
                <Switch
                  value={notifSettings.weeklyDigest}
                  onValueChange={(value) =>
                    updateSettings({ ...notifSettings, weeklyDigest: value })
                  }
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor={theme.colors.white}
                />
              }
            />

            <SectionTitle>{t('settings.about')}</SectionTitle>
            <SettingRow label={t('settings.appName')} description={`${t('settings.version')} ${appVersion}`} />
            <SettingRow
              label={t('auth.termsOfUse')}
              description={t('settings.termsDesc')}
              onPress={() => setTermsModalVisible(true)}
            />
            <SettingRow
              label={t('auth.privacyPolicy')}
              description={t('settings.privacyDesc')}
              onPress={() => setPrivacyModalVisible(true)}
            />

            <Box mt="lg" gap="sm">
              <Button
                title={t('settings.resetPreferences')}
                onPress={handleReset}
                variant="outline"
                fullWidth
              />
              <Button
                title={t('settings.logout')}
                onPress={handleLogout}
                variant="danger"
                fullWidth
              />
              <Button
                title={t('settings.deleteAccount')}
                onPress={handleDeleteAccount}
                variant="outline"
                fullWidth
              />
            </Box>
          </Box>
        </ScrollView>
      </Box>

      <LegalModal
        visible={termsModalVisible}
        onClose={() => setTermsModalVisible(false)}
        title={t('auth.termsOfUse')}
        content={t('auth.termsContent')}
      />

      <LegalModal
        visible={privacyModalVisible}
        onClose={() => setPrivacyModalVisible(false)}
        title={t('auth.privacyPolicy')}
        content={t('auth.privacyContent')}
      />
    </SafeAreaView>
  );
}

export default SettingsScreen;
