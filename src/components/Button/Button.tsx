import React from 'react';
import { ActivityIndicator, Pressable } from 'react-native';
import { Box, Text } from '../../theme';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<any, ButtonProps>(
  (
    {
      title,
      onPress,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      disabled = false,
      loading = false,
      leftIcon,
      rightIcon,
    },
    ref,
  ) => {
    const sizeConfig: any = {
      sm: { px: 'sm', py: 'xs', borderRadius: 'sm', fontSize: 14, minHeight: 36 },
      md: { px: 'md', py: 'sm', borderRadius: 'md', fontSize: 16, minHeight: 48 },
      lg: { px: 'lg', py: 'md', borderRadius: 'md', fontSize: 18, minHeight: 56 },
    };

    const variantConfig: any = {
      primary: { bg: 'primary', textColor: 'white', borderColor: 'primary' },
      secondary: { bg: 'primaryLight', textColor: 'primary', borderColor: 'primaryLight' },
      outline: { bg: 'surface', textColor: 'primary', borderColor: 'primary' },
      danger: { bg: 'danger', textColor: 'white', borderColor: 'danger' },
    };

    const cfg = sizeConfig[size];
    const palette = variantConfig[variant];

    const isDisabled = disabled || loading;

    return (
      <Pressable
        ref={ref}
        onPress={onPress}
        disabled={isDisabled}
        style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
      >
        <Box
          bg={isDisabled ? 'border' : palette.bg}
          borderWidth={variant === 'outline' ? 2 : 0}
          borderColor={palette.borderColor}
          borderRadius={cfg.borderRadius}
          px={cfg.px}
          py={cfg.py}
          minHeight={cfg.minHeight}
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          width={fullWidth ? '100%' : undefined}
          gap="xxs"
        >
          {loading ? (
            <ActivityIndicator
              color={variant === 'primary' || variant === 'danger' ? '#FFFFFF' : '#0071DF'}
              size="small"
            />
          ) : (
            <>
              {leftIcon}
              <Text
                variant={variant === 'outline' || variant === 'secondary' ? 'buttonSecondary' : 'button'}
                style={{ fontSize: cfg.fontSize }}
              >
                {title}
              </Text>
              {rightIcon}
            </>
          )}
        </Box>
      </Pressable>
    );
  },
);

Button.displayName = 'Button';