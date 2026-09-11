import React, { forwardRef } from 'react';
import { TextInput as RNTextInput, TextInputProps, ViewStyle } from 'react-native';
import { Box, Text } from '../../theme';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const Input = forwardRef<any, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, containerStyle, ...rest }, ref) => {
    return (
      <Box style={containerStyle}>
        {label && (
          <Text variant="label" marginBottom="xs">
            {label}
          </Text>
        )}
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
            <RNTextInput
              ref={ref}
              {...rest}
              placeholderTextColor="#8C949B"
              style={{
                fontSize: 16,
                color: '#171717',
                paddingVertical: 12,
                minHeight: 48,
              }}
            />
          </Box>
          {rightIcon && (
            <Box marginLeft="xs">
              {rightIcon}
            </Box>
          )}
        </Box>
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