import React from 'react';
import { Pressable } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Box, Text } from '../../../../theme';

interface AlertBannerProps {
  title: string;
  description: string;
  onPressView?: () => void;
}

export function AlertBanner({
  title,
  description,
  onPressView,
}: AlertBannerProps) {
  return (
    <Box
      flexDirection="row"
      alignItems="center"
      bg="dangerLight"
      borderRadius="md"
      p="md"
      mb="md"
    >
      <Box
        width={40}
        height={40}
        borderRadius="full"
        bg="surface"
        alignItems="center"
        justifyContent="center"
        mr="sm"
      >
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 4 21 19H3L12 4Z"
            stroke="#EF586D"
            strokeWidth={1.7}
            strokeLinejoin="round"
          />
          <Path d="M12 9v4" stroke="#EF586D" strokeWidth={1.8} strokeLinecap="round" />
          <Circle cx={12} cy={16.2} r={0.9} fill="#EF586D" />
        </Svg>
      </Box>

      <Box flex={1} pr="sm">
        <Text variant="bodyStrong" numberOfLines={1} color="danger">
          {title}
        </Text>
        <Text variant="caption" color="textSecondary" numberOfLines={2} mt="xxs">
          {description}
        </Text>
      </Box>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ver detalhes do alerta"
        onPress={onPressView}
        hitSlop={8}
      >
        {({ pressed }) => (
          <Box
            bg="danger"
            px="md"
            py="xs"
            borderRadius="full"
            opacity={pressed ? 0.85 : 1}
          >
            <Text variant="captionStrong" color="white">
              Ver
            </Text>
          </Box>
        )}
      </Pressable>
    </Box>
  );
}