import {StyleSheet} from 'react-native';
import {colors, typography} from '../../config/theme';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 7,
  },

  label: {
    width: '100%',

    marginBottom: 3,

    color: colors.text,

    fontSize: typography.label.fontSize,
    lineHeight: typography.label.lineHeight,
    fontWeight: typography.label.fontWeight,
  },

  inputWrapper: {
    width: '100%',
    height: 21,

    position: 'relative',

    flexDirection: 'row',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: colors.border,

    borderRadius: 7,

    backgroundColor: colors.surface,
  },

  input: {
    flex: 1,

    height: 20,

    paddingHorizontal: 7,
    paddingVertical: 0,

    margin: 0,

    color: colors.text,

    fontSize: typography.input.fontSize,
    lineHeight: typography.input.lineHeight,
    fontWeight: typography.input.fontWeight,

    includeFontPadding: false,
  },

  eyeButton: {
    position: 'absolute',

    right: 5,

    width: 16,
    height: 16,

    alignItems: 'center',
    justifyContent: 'center',
  },
});