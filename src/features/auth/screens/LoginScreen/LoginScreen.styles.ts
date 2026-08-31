import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  /*
   * ==========================================================
   * TELA
   * ==========================================================
   */
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E5E7',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
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
    color: '#1D1D1D',
    letterSpacing: -0.35,
  },
  subtitle: {
    marginTop: 7,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '400',
    color: '#6B7280',
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
    color: '#202020',
  },
  forgotPassword: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
    color: '#087BE5',
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
    borderColor: '#DFE3E7',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 0,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
    color: '#202020',
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
    backgroundColor: '#0071DF',
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
    color: '#FFFFFF',
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
    color: '#777D83',
    textAlign: 'center',
  },
  createAccountLink: {
    marginLeft: 5,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: '#087BE5',
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
    color: '#777B80',
    textAlign: 'center',
  },
  termsLink: {
    fontSize: 11,
    lineHeight: 17,
    fontWeight: '400',
    color: '#777B80',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});