import React, { useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Box, Text } from '../../theme';

export interface LoadingProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export function Loading({ label, size = 'md', fullScreen = false }: LoadingProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1,
      false
    );
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const content = (
    <Box flexDirection="row" alignItems="center" gap="sm">
      {size === 'sm' ? (
        <ActivityIndicator size="small" color="#0071DF" />
      ) : (
        <Animated.View style={animatedStyle}>
          <ActivityIndicator size={size === 'lg' ? 'large' : 'small'} color="#0071DF" />
        </Animated.View>
      )}
      {label && (
        <Text variant="bodySmall" color="textSecondary">
          {label}
        </Text>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box flex={1} alignItems="center" justifyContent="center" bg="background">
        {content}
      </Box>
    );
  }

  return content;
}