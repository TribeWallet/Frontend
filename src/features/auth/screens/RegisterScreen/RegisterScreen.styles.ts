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
    marginBottom: 28,
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
    borderColor: '#E4E7E9',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 23,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.055,
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
    color: '#171717',
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
    color: '#6D7379',
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
    color: '#202020',
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
    borderColor: '#DFE4E7',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    color: '#252525',
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
    backgroundColor: '#0071DF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.995 }],
  },
  registerButtonText: {
    color: '#FFFFFF',
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
    color: '#777D83',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
    textAlign: 'center',
  },
  loginLink: {
    marginLeft: 5,
    color: '#087BE5',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
});