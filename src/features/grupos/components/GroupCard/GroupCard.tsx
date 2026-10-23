import React from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Pill } from '../../../../components/Pill';
import { Box, Text } from '../../../../theme';
import type { Group, GroupTone } from '../../types/Group';
import { formatCurrency } from '../../../../utils/currency';

interface GroupCardProps {
  group: Group;
  onPress?: (id: string) => void;
}

const toneColors: Record<GroupTone, { bg: string; icon: string }> = {
  blue: { bg: '#E8F1FF', icon: '#0071DF' },
  green: { bg: '#E0F7EF', icon: '#16AF7E' },
  family: { bg: '#FDE8EB', icon: '#EF5067' },
};

const memberBg = ['#0071DF', '#16AF7E', '#6E5BEF', '#E8A924'];

function GroupIcon({ tone }: { tone: GroupTone }) {
  const color = toneColors[tone].icon;
  if (tone === 'green') {
    return (
      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Path d="m12 3 1.6 5.3 5.3 1.6-5.3 1.7L12 17l-1.7-5.4L5 9.9l5.3-1.6L12 3Z" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
      </Svg>
    );
  }
  if (tone === 'family') {
    return (
      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Path d="M20.8 8.7c0 4.8-8.8 10.1-8.8 10.1S3.2 13.5 3.2 8.7A4.5 4.5 0 0 1 12 6.2a4.5 4.5 0 0 1 8.8 2.5Z" stroke={color} strokeWidth={1.55} strokeLinejoin="round" />
      </Svg>
    );
  }
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M4.5 11.2 12 5l7.5 6.2v7.1a1.7 1.7 0 0 1-1.7 1.7H6.2a1.7 1.7 0 0 1-1.7-1.7v-7.1Z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
      <Path d="M9.2 19.8v-5.4h5.6v5.4" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
    </Svg>
  );
}

export function GroupCard({ group, onPress }: GroupCardProps) {
  const palette = toneColors[group.tone];

  return (
    <Pressable
      onPress={() => onPress?.(group.id)}
      accessibilityRole="button"
      accessibilityLabel={`Ver grupo ${group.name}`}
    >
      <Box
        bg="surface"
        borderRadius="md"
        borderWidth={1}
        borderColor="cardBorder"
        p="md"
        mb="md"
      >
        <Box flexDirection="row" mb="md">
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              backgroundColor: palette.bg,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <GroupIcon tone={group.tone} />
          </View>

          <Box flex={1}>
            <Text variant="bodyStrong" numberOfLines={1}>{group.name}</Text>
            <Text variant="caption" color="textSecondary" numberOfLines={1}>
              {group.description}
            </Text>
            <Box flexDirection="row" gap="xs" mt="xs" flexWrap="wrap">
              {group.tags.map((tag) => (
                <Pill key={tag.label} label={tag.label} tone={tag.tone} size="sm" />
              ))}
            </Box>
          </Box>
        </Box>

        <Box
          flexDirection="row"
          justifyContent="space-between"
          bg="background"
          borderRadius="sm"
          p="sm"
          mb="md"
        >
          <Box alignItems="center" flex={1}>
            <Text variant="bodyStrong">{group.summary.members}</Text>
            <Text variant="caption" color="textSecondary">Integrantes</Text>
          </Box>
          <Box alignItems="center" flex={1}>
            <Text variant="bodyStrong" color="danger">{group.summary.openValue}</Text>
            <Text variant="caption" color="textSecondary">Em aberto</Text>
          </Box>
          <Box alignItems="center" flex={1}>
            <Text variant="bodyStrong" color="success">{group.summary.paidValue}</Text>
            <Text variant="caption" color="textSecondary">Pago</Text>
          </Box>
        </Box>

        <Box flexDirection="row" alignItems="center" justifyContent="space-between">
          <Box flexDirection="row">
            {group.members.slice(0, 4).map((member, index) => (
              <View
                key={member.id}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 9999,
                  backgroundColor: memberBg[index] || '#0071DF',
                  borderWidth: 2,
                  borderColor: '#FFFFFF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: index > 0 ? -8 : 0,
                }}
              >
                <Text
                  variant="captionStrong"
                  style={{ color: '#FFFFFF', fontSize: 11 }}
                >
                  {member.initials}
                </Text>
              </View>
            ))}
            {group.members.length > 4 ? (
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 9999,
                  backgroundColor: '#DFE4E7',
                  borderWidth: 2,
                  borderColor: '#FFFFFF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: -8,
                }}
              >
                <Text variant="captionStrong" style={{ fontSize: 11 }}>
                  +{group.members.length - 4}
                </Text>
              </View>
            ) : null}
          </Box>

          <View
            style={{
              backgroundColor: '#0071DF',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 9999,
            }}
          >
            <Text variant="captionStrong" color="white">Abrir</Text>
          </View>
        </Box>
      </Box>
    </Pressable>
  );
}

export default GroupCard;
