import {StyleSheet} from 'react-native';
import {colors, typography} from '../../config/theme';

export const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 20,

    marginTop: 1,

    borderRadius: 7,

    backgroundColor: colors.primary,

    alignItems: 'center',
    justifyContent: 'center',
  },

  text: {
    color: colors.white,

    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,

    lineHeight: 10,

    includeFontPadding: false,
  },

  pressed: {
    opacity: 0.9,
  },

  disabled: {
    opacity: 0.6,
  },
});