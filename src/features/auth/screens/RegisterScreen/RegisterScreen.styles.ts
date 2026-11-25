import { StyleSheet } from 'react-native';
import type { Theme } from '../../../../theme/restyle';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    /*
     * ==========================================================
     * TELA
     * ==========================================================
     */
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    keyboard: {
      flex: 1,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      alignItems: 'center',
    },
    content: {
      alignItems: 'center',
    },

    /*
     * ==========================================================
     * LOGO
     * ==========================================================
     */
    logoContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 28,
    },

    /*
     * ==========================================================
     * CARD
     * ==========================================================
     */
    card: {
      width: '100%',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
      borderRadius: 16,
      paddingHorizontal: 24,
      paddingTop: 26,
      paddingBottom: 23,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: theme.colors.shadow === '#000000' ? 0.055 : 0.25,
      shadowRadius: 10,
      elevation: 3,
    },

    /*
     * ==========================================================
     * TÍTULO
     * ==========================================================
     */
    title: {
      margin: 0,
      textAlign: 'center',
      color: theme.colors.text,
      fontSize: 22,
      lineHeight: 28,
      fontWeight: '600',
      letterSpacing: -0.3,
    },

    /*
     * ==========================================================
     * SUBTÍTULO
     * ==========================================================
     */
    subtitle: {
      marginTop: 7,
      paddingHorizontal: 4,
      textAlign: 'center',
      color: theme.colors.textSecondary,
      fontSize: 13,
      lineHeight: 19,
      fontWeight: '400',
    },

    /*
     * ==========================================================
     * FORMULÁRIO
     * ==========================================================
     */
    form: {
      marginTop: 26,
    },
    field: {
      width: '100%',
      marginBottom: 17,
    },
    label: {
      width: '100%',
      marginBottom: 8,
      color: theme.colors.text,
      fontSize: 14,
      lineHeight: 19,
      fontWeight: '600',
    },

    /*
     * ==========================================================
     * INPUT
     * ==========================================================
     */
    input: {
      width: '100%',
      height: 48,
      minHeight: 48,
      paddingHorizontal: 14,
      paddingVertical: 0,
      margin: 0,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 10,
      backgroundColor: theme.colors.surface,
      color: theme.colors.text,
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '400',
      includeFontPadding: false,
    },
    passwordWrapper: {
      width: '100%',
      position: 'relative',
    },
    passwordInput: {
      paddingRight: 52,
    },

    /*
     * ==========================================================
     * BOTÃO DO OLHO
     * ==========================================================
     */
    eyeButton: {
      position: 'absolute',
      right: 13,
      top: 13,
      width: 22,
      height: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },
    eyeButtonPressed: {
      opacity: 0.55,
    },

    /*
     * ==========================================================
     * BOTÃO CADASTRO
     * ==========================================================
     */
    registerButton: {
      width: '100%',
      minHeight: 48,
      height: 48,
      marginTop: 2,
      paddingHorizontal: 16,
      borderWidth: 0,
      borderRadius: 10,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    registerButtonPressed: {
      opacity: 0.88,
      transform: [{ scale: 0.995 }],
    },
    registerButtonText: {
      color: theme.colors.white,
      fontSize: 16,
      lineHeight: 21,
      fontWeight: '600',
      textAlign: 'center',
    },

    /*
     * ==========================================================
     * FOOTER LOGIN
     * ==========================================================
     */
    loginFooter: {
      marginTop: 20,
      minHeight: 22,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
    loginText: {
      color: theme.colors.textMuted,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '400',
      textAlign: 'center',
    },
    loginLink: {
      marginLeft: 5,
      color: theme.colors.primary,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '500',
      textAlign: 'center',
    },
  });
