import React, {forwardRef, useState} from 'react';
import {
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';
import {Eye, EyeOff} from 'lucide-react-native';

import {colors} from '../../config/theme';
import {styles} from './styles';

interface InputProps extends TextInputProps {
  label: string;
  secure?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({label, secure = false, ...props}, ref) => {
    const [visible, setVisible] = useState(false);

    const isPassword = secure;

    return (
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>

        <View style={styles.inputWrapper}>
          <TextInput
            ref={ref}
            {...props}
            secureTextEntry={isPassword && !visible}
            style={styles.input}
            placeholderTextColor={colors.placeholder}
            autoCorrect={false}
            selectionColor={colors.primary}
          />

          {isPassword && (
            <TouchableOpacity
              style={styles.eyeButton}
              activeOpacity={0.7}
              onPress={() => setVisible(current => !current)}
              accessibilityRole="button"
              accessibilityLabel={
                visible ? 'Ocultar senha' : 'Mostrar senha'
              }>
              {visible ? (
                <EyeOff
                  size={11}
                  color="#6D7379"
                  strokeWidth={1.5}
                />
              ) : (
                <Eye
                  size={11}
                  color="#6D7379"
                  strokeWidth={1.5}
                />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  },
);

Input.displayName = 'Input';