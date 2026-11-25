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
      marginBottom: 30,
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
      paddingTop: 28,
      paddingBottom: 24,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: theme.colors.shadow === '#000000' ? 0.06 : 0.25,
      shadowRadius: 10,
      elevation: 3,
    },

    /*
     * ==========================================================
     * TÍTULO
     * ==========================================================
     */
    title: {
      textAlign: 'center',
      fontSize: 22,
      lineHeight: 28,
      fontWeight: '600',
      color: theme.colors.text,
      letterSpacing: -0.35,
    },
    subtitle: {
      marginTop: 7,
      textAlign: 'center',
      fontSize: 13,
      lineHeight: 19,
      fontWeight: '400',
      color: theme.colors.textSecondary,
    },

    /*
     * ==========================================================
     * FORMULÁRIO
     * ==========================================================
     */
    form: {
      marginTop: 28,
    },
    field: {
      marginBottom: 19,
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    label: {
      fontSize: 14,
      lineHeight: 19,
      fontWeight: '600',
      color: theme.colors.text,
    },
    forgotPassword: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '400',
      color: theme.colors.primary,
    },

    /*
     * ==========================================================
     * INPUT
     * ==========================================================
     */
    input: {
      width: '100%',
      height: 48,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 10,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 14,
      paddingVertical: 0,
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '400',
      color: theme.colors.text,
      includeFontPadding: false,
    },
    passwordWrapper: {
      width: '100%',
      position: 'relative',
    },
    passwordInput: {
      paddingRight: 50,
    },
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
     * BOTÃO LOGIN
     * ==========================================================
     */
    loginButton: {
      width: '100%',
      minHeight: 48,
      borderRadius: 10,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
      marginTop: 1,
    },
    loginButtonPressed: {
      opacity: 0.88,
      transform: [{ scale: 0.995 }],
    },
    loginButtonText: {
      fontSize: 16,
      lineHeight: 21,
      fontWeight: '600',
      color: theme.colors.white,
      textAlign: 'center',
    },

    /*
     * ==========================================================
     * CRIAR CONTA
     * ==========================================================
     */
    createAccount: {
      marginTop: 21,
      minHeight: 22,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
    createAccountText: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '400',
      color: theme.colors.textMuted,
      textAlign: 'center',
    },
    createAccountLink: {
      marginLeft: 5,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '500',
      color: theme.colors.primary,
      textAlign: 'center',
    },

    /*
     * ==========================================================
     * TERMOS
     * ==========================================================
     */
    terms: {
      width: '100%',
      marginTop: 20,
      paddingHorizontal: 8,
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center',
    },
    termsText: {
      fontSize: 11,
      lineHeight: 17,
      fontWeight: '400',
      color: theme.colors.textMuted,
      textAlign: 'center',
    },
    termsLink: {
      fontSize: 11,
      lineHeight: 17,
      fontWeight: '400',
      color: theme.colors.textMuted,
      textAlign: 'center',
      textDecorationLine: 'underline',
    },
  });
