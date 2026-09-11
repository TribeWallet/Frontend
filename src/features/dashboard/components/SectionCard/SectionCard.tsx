import React from 'react';
import { Pressable } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Box, Text } from '../../../../theme';

interface SectionCardProps {
  title: string;
  showViewAll?: boolean;
  trailingIcon?: React.ReactNode;
  onPressViewAll?: () => void;
  headerCenter?: boolean;
  children: React.ReactNode;
}

function ChevronRight({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 6l6 6-6 6"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function SectionCard({
  title,
  showViewAll = false,
  trailingIcon,
  onPressViewAll,
  headerCenter = false,
  children,
}: SectionCardProps) {
  return (
    <Box
      bg="surface"
      borderRadius="md"
      borderWidth={1}
      borderColor="cardBorder"
      p="md"
      mb="md"
    >
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent={headerCenter ? 'center' : 'space-between'}
        mb="md"
      >
        <Text variant="h3">{title}</Text>

        {showViewAll && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Ver todas ${title}`}
            onPress={onPressViewAll}
            hitSlop={6}
          >
            {({ pressed }) => (
              <Box
                flexDirection="row"
                alignItems="center"
                gap="xxs"
                opacity={pressed ? 0.6 : 1}
              >
                <Text variant="bodySmallStrong" color="text">
                  Ver todas
                </Text>
                <ChevronRight color="#22282C" />
              </Box>
            )}
          </Pressable>
        )}

        {!showViewAll && trailingIcon && <Box>{trailingIcon}</Box>}
      </Box>

      <Box>{children}</Box>
    </Box>
  );
}