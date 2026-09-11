import React, { useMemo } from 'react';
import { Modal as RNModal, Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInLeft } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Box, Text } from '../../theme';

export type SideMenuAction =
  | 'home'
  | 'groups'
  | 'commitments'
  | 'payments'
  | 'reports'
  | 'alerts'
  | 'profile'
  | 'edit-profile'
  | 'history'
  | 'support'
  | 'settings'
  | 'logout';

export interface SideMenuProps {
  visible: boolean;
  userInitials: string;
  userName: string;
  userEmail: string;
  activeTab?: string;
  onClose: () => void;
  onSelect?: (action: SideMenuAction) => void;
}

function ChevronRight({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="m9 6 6 6-6 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const ICON_COLOR = '#0071DF';
const ICON_COLOR_NEUTRAL = '#69757C';

function makeIcon(path: React.ReactNode) {
  return function Icon({ active }: { active?: boolean }) {
    const color = active ? ICON_COLOR : ICON_COLOR_NEUTRAL;
    return (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        {React.Children.map(path, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<{ stroke: string }>, { stroke: color })
            : child,
        )}
      </Svg>
    );
  };
}

const HomeIcon = makeIcon(
  <>
    <Path
      d="M4 11 12 4l8 7v8a2 2 0 0 1-2 2h-3v-6h-6v6H6a2 2 0 0 1-2-2v-8Z"
      strokeWidth={1.7}
      strokeLinejoin="round"
    />
  </>,
);
const GroupsIcon = makeIcon(
  <>
    <Path d="M16 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 0a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-3.3 0-8 1.7-8 5v3h16v-3c0-3.3-4.7-5-8-5Zm8 0c-.3 0-.6 0-1 .1 1.6 1.1 3 2.7 3 4.9v3h6v-3c0-3.3-4.7-5-8-5Z" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
  </>,
);
const PayIcon = makeIcon(
  <>
    <Path d="M3.5 6h17v12h-17z" strokeWidth={1.7} strokeLinejoin="round" />
    <Path d="M3.5 10h17" strokeWidth={1.7} />
  </>,
);
const ReportsIcon = makeIcon(
  <>
    <Path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" strokeWidth={1.7} strokeLinejoin="round" />
    <Path d="M15 3v5h5" strokeWidth={1.7} strokeLinejoin="round" />
    <Path d="M9 13h6M9 17h4" strokeWidth={1.6} strokeLinecap="round" />
  </>,
);
const BellIcon = makeIcon(
  <>
    <Path d="M18.3 9.5c0-3.44-2.05-5.78-5.3-6.16V2.5a1 1 0 1 0-2 0v.84C7.75 3.72 5.7 6.06 5.7 9.5c0 4.02-1.57 4.77-2.1 5.72-.37.66.1 1.49.87 1.49h15.06c.77 0 1.24-.83.87-1.49-.53-.95-2.1-1.7-2.1-5.72Z" strokeWidth={1.6} strokeLinejoin="round" />
    <Path d="M9.5 19c.42 1.03 1.22 1.55 2.4 1.55s1.98-.52 2.4-1.55" strokeWidth={1.6} strokeLinecap="round" />
  </>,
);
const PersonIcon = makeIcon(
  <>
    <Path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" strokeWidth={1.7} strokeLinecap="round" />
  </>,
);
const EditIcon = makeIcon(
  <>
    <Path d="M4 20h4l11-11-4-4L4 16v4Z" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14 6l4 4" strokeWidth={1.7} strokeLinecap="round" />
  </>,
);
const HistoryIcon = makeIcon(
  <>
    <Path d="M3 12a9 9 0 1 0 3-6.7" strokeWidth={1.7} strokeLinecap="round" />
    <Path d="M3 4v5h5" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 7v5l3 2" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
  </>,
);
const SupportIcon = makeIcon(
  <>
    <Path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" strokeWidth={1.6} />
    <Path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7" strokeWidth={1.6} strokeLinecap="round" />
    <Path d="M12 17h.01" strokeWidth={2} strokeLinecap="round" />
  </>,
);
const GearIcon = makeIcon(
  <>
    <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" strokeWidth={1.4} strokeLinejoin="round" />
    <Path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" strokeWidth={1.5} />
  </>,
);
const LogoutIcon = makeIcon(
  <>
    <Path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" strokeWidth={1.7} strokeLinecap="round" />
    <Path d="M16 17l5-5-5-5" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M21 12H10" strokeWidth={1.7} strokeLinecap="round" />
  </>,
);

interface MenuItem {
  id: SideMenuAction;
  label: string;
  Icon: React.ComponentType<{ active?: boolean }>;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export function SideMenu({
  visible,
  userInitials,
  userName,
  userEmail,
  activeTab,
  onClose,
  onSelect,
}: SideMenuProps) {
  const insets = useSafeAreaInsets();

  const groups = useMemo<MenuGroup[]>(
    () => [
      {
        title: 'PRINCIPAL',
        items: [
          { id: 'home', label: 'Início', Icon: HomeIcon },
          { id: 'groups', label: 'Grupos', Icon: GroupsIcon },
          { id: 'commitments', label: 'Despesas', Icon: PayIcon },
          { id: 'payments', label: 'Pagamentos', Icon: PayIcon },
          { id: 'reports', label: 'Relatórios', Icon: ReportsIcon },
          { id: 'alerts', label: 'Notificações', Icon: BellIcon },
        ],
      },
      {
        title: 'CONTA',
        items: [
          { id: 'profile', label: 'Meu perfil', Icon: PersonIcon },
          { id: 'edit-profile', label: 'Editar perfil', Icon: EditIcon },
          { id: 'history', label: 'Histórico', Icon: HistoryIcon },
          { id: 'support', label: 'Suporte', Icon: SupportIcon },
          { id: 'settings', label: 'Configurações', Icon: GearIcon },
        ],
      },
    ],
    [],
  );

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View
        entering={FadeIn.duration(180)}
        exiting={FadeOut.duration(150)}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}
      >
        <Pressable
          style={{ position: 'absolute', top: 0, bottom: 0, left: '85%', right: 0 }}
          onPress={onClose}
          accessibilityLabel="Fechar menu"
        />
      </Animated.View>

      <Animated.View
        entering={SlideInLeft.duration(250)}
        exiting={FadeOut.duration(150)}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: '85%',
          maxWidth: 340,
          backgroundColor: '#FFFFFF',
        }}
      >
        <Box flex={1}>
          <Box bg="primary" px="lg" pt={`${insets.top + 12}px` as any} pb="lg">
            <Box flexDirection="row" alignItems="center" gap="sm">
              <Box
                width={52}
                height={52}
                borderRadius="full"
                bg="white"
                alignItems="center"
                justifyContent="center"
              >
                <Text variant="bodyStrong" color="primary" style={{ fontSize: 18 }}>
                  {userInitials}
                </Text>
              </Box>
              <Box flex={1}>
                <Text variant="bodyStrong" color="white" numberOfLines={1}>
                  {userName}
                </Text>
                <Text variant="caption" color="white" opacity={0.85} numberOfLines={1}>
                  {userEmail}
                </Text>
              </Box>
            </Box>
          </Box>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
          >
            {groups.map((group) => (
              <Box key={group.title} mt="md">
                <Text
                  variant="captionStrong"
                  color="textMuted"
                  px="lg"
                  mb="xs"
                >
                  {group.title}
                </Text>
                {group.items.map((item) => {
                  const isActive =
                    activeTab === item.id ||
                    (activeTab === 'commitments' && item.id === 'commitments');
                  return (
                    <Pressable
                      key={item.id}
                      accessibilityRole="button"
                      accessibilityLabel={item.label}
                      onPress={() => {
                        onSelect?.(item.id);
                        onClose();
                      }}
                    >
                      {({ pressed }) => (
                        <Box
                          flexDirection="row"
                          alignItems="center"
                          px="lg"
                          py="sm"
                          bg={
                            isActive
                              ? 'primaryLight'
                              : pressed
                                ? 'background'
                                : 'surface'
                          }
                        >
                          <Box width={24} alignItems="center" mr="sm">
                            <item.Icon active={isActive} />
                          </Box>
                          <Box flex={1}>
                            <Text
                              variant="body"
                              color={isActive ? 'primary' : 'text'}
                              style={
                                isActive ? { fontWeight: '600' } : undefined
                              }
                            >
                              {item.label}
                            </Text>
                          </Box>
                          <ChevronRight color={isActive ? '#0071DF' : '#8C949B'} />
                        </Box>
                      )}
                    </Pressable>
                  );
                })}
              </Box>
            ))}

            <Box px="lg" mt="md">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Sair da conta"
                onPress={() => {
                  onSelect?.('logout');
                  onClose();
                }}
              >
                {({ pressed }) => (
                  <Box
                    flexDirection="row"
                    alignItems="center"
                    px="md"
                    py="md"
                    borderRadius="md"
                    borderWidth={1}
                    borderColor="border"
                    bg={pressed ? 'dangerLight' : 'surface'}
                  >
                    <Box width={24} alignItems="center" mr="sm">
                      <LogoutIcon />
                    </Box>
                    <Text variant="bodyStrong" color="danger">Sair</Text>
                  </Box>
                )}
              </Pressable>
            </Box>
          </ScrollView>

          <Box
            px="lg"
            py="md"
            borderTopWidth={1}
            borderColor="border"
            pb={`${insets.bottom + 12}px` as any}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 2 4 5v6c0 5 3.4 9.5 8 11 4.6-1.5 8-6 8-11V5l-8-3Z"
                  stroke="#0071DF"
                  strokeWidth={1.6}
                  strokeLinejoin="round"
                />
              </Svg>
              <Text variant="captionStrong" color="primary">TribeWallet</Text>
            </View>
            <Text variant="caption" color="textMuted">v1.0.0 · build 100</Text>
          </Box>
        </Box>
      </Animated.View>
    </RNModal>
  );
}
