import React, { useCallback } from 'react';
import { Alert, ScrollView, Switch, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Path } from 'react-native-svg';

import { TopBar } from '../../../components/TopBar';
import { Pill } from '../../../components/Pill';
import { Button } from '../../../components/Button';
import { Select, SelectOption } from '../../../components/Select';
import { Box, Text, PressableBox } from '../../../theme';
import { useUserStore } from '../../usuario/stores/userStore';
import { useAppGroups } from '../../../contexts/AppContext';
import { useAppNotifications } from '../../../hooks/useNotifications';
import {
  usePreferencesStore,
  AppearanceMode,
  Currency,
} from '../stores/preferencesStore';
import { useAuthStore } from '../../auth/stores/authStore';
import { formatCurrency } from '../../../utils/currency';
import { formatCurrency as fmt } from '../../../utils/currency';
import { useTopBarActions } from '../../../hooks/useTopBarActions';
import type { RootStackParamList } from '../../../navigation/types';

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
      {trailing ?? (onPress ? <ChevronRight color="#69757C" /> : null)}
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

const APPEARANCE_OPTIONS: SelectOption[] = [
  { id: 'light', label: 'Claro', description: 'Tema padrão' },
  { id: 'dark', label: 'Escuro', description: 'Em breve' },
  { id: 'system', label: 'Sistema', description: 'Segue o aparelho' },
];

const CURRENCY_OPTIONS: SelectOption[] = [
  { id: 'BRL', label: 'Real (R$)', description: 'Moeda brasileira' },
  { id: 'USD', label: 'Dólar (US$)', description: 'Em breve' },
  { id: 'EUR', label: 'Euro (€)', description: 'Em breve' },
];

const LANGUAGE_OPTIONS: SelectOption[] = [
  { id: 'pt-BR', label: 'Português (Brasil)' },
  { id: 'en-US', label: 'English (US)', description: 'Em breve' },
];

export function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const topBar = useTopBarActions();
  const { width } = useWindowDimensions();
  const isSmallPhone = width < 360;

  const profile = useUserStore((state) => state.profile);
  const authLogout = useAuthStore((state) => state.logout);

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
    { id: '', label: 'Nenhum (sempre perguntar)' },
    ...groups.map((group) => ({ id: group.id, label: group.name })),
  ];

  const handleLogout = useCallback(() => {
    Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
          authLogout();
          navigation.reset({ index: 0, routes: [{ name: 'Main' as never }] });
        },
      },
    ]);
  }, [authLogout, navigation]);

  const handleReset = useCallback(() => {
    Alert.alert(
      'Restaurar preferências',
      'Todas as configurações voltam ao padrão.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Restaurar', style: 'destructive', onPress: () => reset() },
      ],
    );
  }, [reset]);

  const sampleCurrency =
    currency === 'BRL'
      ? formatCurrency(1234.56)
      : currency === 'USD'
        ? '$ 1,234.56'
        : '€ 1.234,56';

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
        >
          <Box width="100%" px={isSmallPhone ? 'sm' : 'md'} pt="md" gap="xs">
            <Text variant="h1">Configurações</Text>
            <Text variant="bodySmall" color="textSecondary">
              Personalize sua experiência no TribeWallet.
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
                  CONTA ATIVA
                </Text>
                <Text variant="bodyStrong" color="primary">
                  {profile?.name ?? 'Gabriel'}
                </Text>
                <Text variant="caption" color="textSecondary">
                  {profile?.email ?? 'dev@dev.com'}
                </Text>
              </Box>
              <Pill label="Plano gratuito" tone="primary" />
            </Box>

            <SectionTitle>Conta</SectionTitle>
            <SettingRow
              label="Editar perfil"
              description="Nome, iniciais e e-mail"
              onPress={() => navigation.navigate('EditProfile')}
            />
            <SettingRow
              label="Histórico de alterações"
              description="Veja suas últimas ações"
              onPress={() => navigation.navigate('History')}
            />
            <SettingRow
              label="Suporte"
              description="Fale com a nossa equipe"
              onPress={() => navigation.navigate('Support')}
            />

            <SectionTitle>Preferências</SectionTitle>
            <Box mb="md" gap="md">
              <Select
                label="Aparência"
                placeholder="Selecione"
                value={appearance}
                onChange={(value) => setAppearance(value as AppearanceMode)}
                options={APPEARANCE_OPTIONS}
              />
              <Select
                label="Moeda"
                placeholder="Selecione"
                value={currency}
                onChange={(value) => setCurrency(value as Currency)}
                options={CURRENCY_OPTIONS}
                helperText={`Padrão atual: ${sampleCurrency}`}
              />
              <Select
                label="Idioma"
                placeholder="Selecione"
                value={language}
                onChange={(value) =>
                  setLanguage(value as 'pt-BR' | 'en-US')
                }
                options={LANGUAGE_OPTIONS}
              />
              <Select
                label="Grupo padrão"
                placeholder="Selecione"
                value={defaultGroupId ?? ''}
                onChange={(value) =>
                  setDefaultGroupId(value ? value : undefined)
                }
                options={groupOptions}
                helperText="Pré-selecionado ao criar pagamentos"
              />
            </Box>

            <SectionTitle>Privacidade e segurança</SectionTitle>
            <SettingRow
              label="Bloqueio por biometria"
              description="Exige autenticação ao abrir o app"
              trailing={
                <Switch
                  value={biometricLock}
                  onValueChange={setBiometricLock}
                  trackColor={{ false: '#DFE4E7', true: '#0071DF' }}
                  thumbColor="#FFFFFF"
                />
              }
            />
            <SettingRow
              label="Ocultar valores"
              description="Esconde valores monetários nas listas"
              trailing={
                <Switch
                  value={hideValues}
                  onValueChange={setHideValues}
                  trackColor={{ false: '#DFE4E7', true: '#0071DF' }}
                  thumbColor="#FFFFFF"
                />
              }
            />

            <SectionTitle>Notificações</SectionTitle>
            <SettingRow
              label="Notificações push"
              trailing={
                <Switch
                  value={notifSettings.pushEnabled}
                  onValueChange={(value) =>
                    updateSettings({ ...notifSettings, pushEnabled: value })
                  }
                  trackColor={{ false: '#DFE4E7', true: '#0071DF' }}
                  thumbColor="#FFFFFF"
                />
              }
            />
            <SettingRow
              label="Notificações por e-mail"
              trailing={
                <Switch
                  value={notifSettings.emailEnabled}
                  onValueChange={(value) =>
                    updateSettings({ ...notifSettings, emailEnabled: value })
                  }
                  trackColor={{ false: '#DFE4E7', true: '#0071DF' }}
                  thumbColor="#FFFFFF"
                />
              }
            />
            <SettingRow
              label="Alertas de vencimento"
              description="Avisa quando um compromisso está perto do vencimento"
              trailing={
                <Switch
                  value={notifSettings.overdueAlerts}
                  onValueChange={(value) =>
                    updateSettings({ ...notifSettings, overdueAlerts: value })
                  }
                  trackColor={{ false: '#DFE4E7', true: '#0071DF' }}
                  thumbColor="#FFFFFF"
                />
              }
            />
            <SettingRow
              label="Resumo semanal"
              description="Receba um resumo toda segunda-feira"
              trailing={
                <Switch
                  value={notifSettings.weeklyDigest}
                  onValueChange={(value) =>
                    updateSettings({ ...notifSettings, weeklyDigest: value })
                  }
                  trackColor={{ false: '#DFE4E7', true: '#0071DF' }}
                  thumbColor="#FFFFFF"
                />
              }
            />

            <SectionTitle>Sobre</SectionTitle>
            <SettingRow
              label="TribeWallet"
              description="Versão 1.0.0 · compilação 100"
            />
            <SettingRow
              label="Termos de uso"
              description="Condições do serviço"
              onPress={() => Alert.alert('Termos de uso', 'Conteúdo em breve.')}
            />
            <SettingRow
              label="Política de privacidade"
              description="Como cuidamos dos seus dados"
              onPress={() => Alert.alert('Privacidade', 'Conteúdo em breve.')}
            />

            <Box mt="lg" gap="sm">
              <Button
                title="Restaurar preferências"
                onPress={handleReset}
                variant="outline"
                fullWidth
              />
              <Button
                title="Sair da conta"
                onPress={handleLogout}
                variant="danger"
                fullWidth
              />
            </Box>
            <Text variant="caption" color="textMuted" alignSelf="center" mt="md">
              Exemplo de formatação: {fmt(2800)}
            </Text>
          </Box>
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
}

export default SettingsScreen;
