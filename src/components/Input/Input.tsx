import React, { forwardRef } from 'react';
import { TextInput as RNTextInput, TextInputProps, ViewStyle } from 'react-native';
import { Box, Text, PressableBox, useTheme } from '../../theme';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  prefix?: string;
}

export const Input = forwardRef<any, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, containerStyle, prefix, ...rest }, ref) => {
    const theme = useTheme();
    return (
      <Box style={containerStyle}>
        {label && (
          <Text variant="label" marginBottom="xs">
            {label}
          </Text>
        )}
        <PressableBox
          hitSlop={12}
          onPress={() => {
            (ref as React.RefObject<any> | null | undefined)?.current?.focus();
          }}
        >
          <Box
            flexDirection="row"
            alignItems="center"
            bg="surface"
            borderRadius="md"
            borderWidth={1}
            borderColor={error ? 'danger' : 'border'}
            px="md"
            minHeight={48}
          >
            {leftIcon && (
              <Box marginRight="xs">
                {leftIcon}
              </Box>
            )}
            <Box flex={1}>
              <Box flexDirection="row" alignItems="center" flex={1}>
                {prefix && (
                  <Text
                    variant="captionStrong"
                    color="textMuted"
                    style={{ marginRight: 6 }}
                  >
                    {prefix}
                  </Text>
                )}
                <RNTextInput
                  ref={ref}
                  {...rest}
                  placeholderTextColor={theme.colors.textMuted}
                  style={{
                    fontSize: 16,
                    color: theme.colors.text,
                    paddingVertical: 12,
                    minHeight: 48,
                    paddingLeft: prefix ? 0 : undefined,
                  }}
                />
              </Box>
            </Box>
            {rightIcon && (
              <Box marginLeft="xs">
                {rightIcon}
              </Box>
            )}
          </Box>
        </PressableBox>
        {(error || helperText) && (
          <Text
            variant="caption"
            color={error ? 'danger' : 'textMuted'}
            marginTop="xs"
          >
            {error || helperText}
          </Text>
        )}
      </Box>
    );
  },
);

Input.displayName = 'Input';