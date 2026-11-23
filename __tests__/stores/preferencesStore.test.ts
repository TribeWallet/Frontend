/**
 * Testes do preferencesStore (Zustand)
 *
 * Verifica:
 * 1. Estado inicial (padrões)
 * 2. Setters individuais (appearance, currency, biometricLock, hideValues, language, defaultGroupId)
 * 3. reset volta para os padrões
 */

import { usePreferencesStore } from '../../src/features/configuracoes/stores/preferencesStore';

describe('preferencesStore', () => {
  const DEFAULT_STATE = {
    appearance: 'light' as const,
    currency: 'BRL' as const,
    biometricLock: false,
    hideValues: false,
    language: 'pt-BR' as const,
    defaultGroupId: undefined as string | undefined,
  };

  beforeEach(() => {
    usePreferencesStore.setState({ ...DEFAULT_STATE });
  });

  it('deve ter estado inicial padrão', () => {
    const state = usePreferencesStore.getState();
    expect(state.appearance).toBe('light');
    expect(state.currency).toBe('BRL');
    expect(state.biometricLock).toBe(false);
    expect(state.hideValues).toBe(false);
    expect(state.language).toBe('pt-BR');
    expect(state.defaultGroupId).toBeUndefined();
  });

  it('setAppearance deve alterar o tema', () => {
    usePreferencesStore.getState().setAppearance('dark');
    expect(usePreferencesStore.getState().appearance).toBe('dark');

    usePreferencesStore.getState().setAppearance('system');
    expect(usePreferencesStore.getState().appearance).toBe('system');
  });

  it('setCurrency deve alterar a moeda', () => {
    usePreferencesStore.getState().setCurrency('USD');
    expect(usePreferencesStore.getState().currency).toBe('USD');

    usePreferencesStore.getState().setCurrency('EUR');
    expect(usePreferencesStore.getState().currency).toBe('EUR');
  });

  it('setBiometricLock deve ativar/desativar biometria', () => {
    usePreferencesStore.getState().setBiometricLock(true);
    expect(usePreferencesStore.getState().biometricLock).toBe(true);

    usePreferencesStore.getState().setBiometricLock(false);
    expect(usePreferencesStore.getState().biometricLock).toBe(false);
  });

  it('setHideValues deve ativar/desativar ocultar valores', () => {
    usePreferencesStore.getState().setHideValues(true);
    expect(usePreferencesStore.getState().hideValues).toBe(true);

    usePreferencesStore.getState().setHideValues(false);
    expect(usePreferencesStore.getState().hideValues).toBe(false);
  });

  it('setLanguage deve alterar o idioma', () => {
    usePreferencesStore.getState().setLanguage('en-US');
    expect(usePreferencesStore.getState().language).toBe('en-US');

    usePreferencesStore.getState().setLanguage('es-ES');
    expect(usePreferencesStore.getState().language).toBe('es-ES');
  });

  it('setDefaultGroupId deve definir o grupo padrão', () => {
    usePreferencesStore.getState().setDefaultGroupId('grupo_123');
    expect(usePreferencesStore.getState().defaultGroupId).toBe('grupo_123');
  });

  it('reset deve voltar para os valores padrão', () => {
    // Muda todos os valores
    usePreferencesStore.getState().setAppearance('dark');
    usePreferencesStore.getState().setCurrency('USD');
    usePreferencesStore.getState().setBiometricLock(true);
    usePreferencesStore.getState().setHideValues(true);
    usePreferencesStore.getState().setLanguage('es-ES');
    usePreferencesStore.getState().setDefaultGroupId('grupo_xyz');

    // Reseta
    usePreferencesStore.getState().reset();

    const state = usePreferencesStore.getState();
    expect(state.appearance).toBe('light');
    expect(state.currency).toBe('BRL');
    expect(state.biometricLock).toBe(false);
    expect(state.hideValues).toBe(false);
    expect(state.language).toBe('pt-BR');
    expect(state.defaultGroupId).toBeUndefined();
  });
});
