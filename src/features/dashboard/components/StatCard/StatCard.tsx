import React from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Box, Text } from '../../../../theme';

interface StatCardProps {
  stat: {
    id: string;
    tone: 'blue' | 'yellow' | 'green';
    label: string;
    value: string;
    meta?: string;
    trend?: { direction: 'up' | 'down'; text: string };
  };
  onPress?: () => void;
}

const toneColors = {
  blue: { bg: '#E8F1FF' as const, icon: '#0071DF' as const, trend: '#0071DF' as const },
  yellow: { bg: '#FFF4E0' as const, icon: '#E8A924' as const, trend: '#E8A924' as const },
  green: { bg: '#E0F7EF' as const, icon: '#16AF7E' as const, trend: '#16AF7E' as const },
};

function renderIcon(tone: 'blue' | 'yellow' | 'green', color: string): React.ReactNode {
  switch (tone) {
    case 'blue':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Circle cx={9} cy={7.5} r={3} stroke={color} strokeWidth={1.7} />
          <Circle cx={16.7} cy={8.8} r={2.4} stroke={color} strokeWidth={1.7} />
          <Path
            d="M3.7 18c.35-3.1 2.2-5.2 5.3-5.2s4.95 2.1 5.3 5.2"
            stroke={color}
            strokeWidth={1.7}
            strokeLinecap="round"
          />
          <Path
            d="M14 13.7c.75-.78 1.72-1.16 2.9-1.16 2.36 0 3.74 1.54 4.05 4.08"
            stroke={color}
            strokeWidth={1.7}
            strokeLinecap="round"
          />
        </Svg>
      );
    case 'yellow':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Circle cx={12} cy={12} r={7.6} stroke={color} strokeWidth={1.7} />
          <Path
            d="M12 7.6V12l3 1.9"
            stroke={color}
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
    case 'green':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="m4 16 4.1-4 3.1 2.5L18.8 7"
            stroke={color}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M14.5 7h4.3v4.2"
            stroke={color}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );
  }
}

export function StatCard({ stat, onPress }: StatCardProps) {
  const palette = toneColors[stat.tone];

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <Box
          bg="surface"
          borderRadius="md"
          p="md"
          borderWidth={1}
          borderColor="cardBorder"
          opacity={pressed ? 0.85 : 1}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 9999,
              backgroundColor: palette.bg,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            {renderIcon(stat.tone, palette.icon)}
          </View>

          <Text variant="caption" color="textSecondary" numberOfLines={1}>
            {stat.label}
          </Text>
          <Text variant="h2" mt="xxs" numberOfLines={1}>
            {stat.value}
          </Text>

          <Box flexDirection="row" alignItems="center" gap="xs" mt="xs">
            {stat.trend && (
              <Box flexDirection="row" alignItems="center" gap="xxs">
                <Svg width={10} height={10} viewBox="0 0 12 12" fill="none">
                  <Path
                    d="M1.5 7.9 4.2 5.2l1.8 1.7L10.5 2.5"
                    stroke={palette.trend}
                    strokeWidth={1.35}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M7.8 2.5h2.7v2.7"
                    stroke={palette.trend}
                    strokeWidth={1.35}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text variant="caption" style={{ color: palette.trend, fontWeight: '600' }}>
                  {stat.trend.text}
                </Text>
              </Box>
            )}
            {stat.meta && (
              <Text variant="caption" color="textMuted">
                {stat.meta}
              </Text>
            )}
          </Box>
        </Box>
      )}
    </Pressable>
  );
}