import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { Box, Text } from '../theme';

type TabRoute =
  | 'Home'
  | 'Groups'
  | 'Commitments'
  | 'Payments'
  | 'Reports';

interface TabConfig {
  key: TabRoute;
  label: string;
  icon: React.ReactNode;
}

const HomeIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M4 11 12 4l8 7v8a2 2 0 0 1-2 2h-3v-6h-6v6H6a2 2 0 0 1-2-2v-8Z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
  </Svg>
);

const GroupsIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M16 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 0a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-3.3 0-8 1.7-8 5v3h16v-3c0-3.3-4.7-5-8-5Zm8 0c-.3 0-.6 0-1 .1 1.6 1.1 3 2.7 3 4.9v3h6v-3c0-3.3-4.7-5-8-5Z" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const CommitmentsIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5h6m-3 4v6m-2-2 4 2" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const PayIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M3.5 6h17v12h-17z" stroke={color} strokeWidth={1.7} strokeLinejoin="round" />
    <Path d="M3.5 10h17" stroke={color} strokeWidth={1.7} />
  </Svg>
);

const ReportsIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke={color} strokeWidth={1.7} strokeLinejoin="round" />
    <Path d="M15 3v5h5" stroke={color} strokeWidth={1.7} strokeLinejoin="round" />
    <Path d="M9 13h6M9 17h4" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
  </Svg>
);

const TABS: TabConfig[] = [
  { key: 'Home', label: 'Início', icon: <HomeIcon color="#0071DF" /> },
  { key: 'Groups', label: 'Grupos', icon: <GroupsIcon color="#0071DF" /> },
  { key: 'Commitments', label: 'Despesas', icon: <CommitmentsIcon color="#0071DF" /> },
  { key: 'Payments', label: 'Pagar', icon: <PayIcon color="#0071DF" /> },
  { key: 'Reports', label: 'Relatórios', icon: <ReportsIcon color="#0071DF" /> },
];

function TabItem({
  label,
  isActive,
  onPress,
  children,
  badge,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
  children: React.ReactNode;
  badge?: number;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(isActive ? 1 : 0.95, {
            damping: 20,
            stiffness: 200,
          }),
        },
      ],
    };
  }, [isActive]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={isActive ? { selected: true } : undefined}
      onPress={onPress}
    >
      {({ pressed }) => (
        <Animated.View
          style={[animatedStyle, { opacity: pressed ? 0.7 : 1, position: 'relative' }]}
        >
          <Box alignItems="center" justifyContent="center" py="xs" px="sm" minWidth={56}>
            {children}
            {badge && badge > 0 ? (
              <Box
                position="absolute"
                top={0}
                right={4}
                minWidth={16}
                height={16}
                borderRadius="full"
                bg="danger"
                alignItems="center"
                justifyContent="center"
                px="xxs"
              >
                <Text variant="caption" color="white" style={{ fontSize: 10, fontWeight: '700' }}>
                  {badge}
                </Text>
              </Box>
            ) : null}
          </Box>
        </Animated.View>
      )}
    </Pressable>
  );
}

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const currentRoute = state.routeNames[state.index] as TabRoute;

  const tabs = useMemo(() => TABS, []);

  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        paddingBottom: insets.bottom,
        borderTopWidth: 1,
        borderTopColor: '#DFE4E7',
      }}
    >
      <Box flexDirection="row" alignItems="center" justifyContent="space-around" px="xs" py="xs">
        {tabs.map((tab) => {
          const isActive = tab.key === currentRoute;
          const color = isActive ? '#0071DF' : '#69757C';
          return (
            <TabItem
              key={tab.key}
              label={tab.label}
              isActive={isActive}
              onPress={() => {
                if (!isActive) {
                  navigation.navigate(tab.key as never);
                }
              }}
            >
              <Box
                width={48}
                height={32}
                borderRadius="full"
                alignItems="center"
                justifyContent="center"
                bg={isActive ? 'primaryLight' : 'surface'}
                mb="xxs"
              >
                {React.cloneElement(tab.icon as React.ReactElement<{ color: string }>, { color })}
              </Box>
              <Text
                variant="captionStrong"
                color={isActive ? 'primary' : 'textSecondary'}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </TabItem>
          );
        })}
      </Box>
    </View>
  );
}
