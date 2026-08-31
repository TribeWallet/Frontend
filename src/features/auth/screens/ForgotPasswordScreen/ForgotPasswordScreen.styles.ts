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
    paddingHorizontal: 8,
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
  label: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '600',
    color: '#202020',
    marginBottom: 8,
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

  /*
   * ==========================================================
   * BOTÃO
   * ==========================================================
   */
  submitButton: {
    width: '100%',
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: '#0071DF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginTop: 1,
  },
  submitButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.995 }],
  },
  submitButtonDisabled: {
    opacity: 0.65,
  },
  submitButtonText: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  /*
   * ==========================================================
   * VOLTAR
   * ==========================================================
   */
  backButton: {
    alignSelf: 'center',
    marginTop: 21,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  backText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
    color: '#087BE5',
    textAlign: 'center',
  },
});