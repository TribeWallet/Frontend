/**
 * Testes do RegisterScreen
 * Verifica renderização e campos de cadastro
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import { RegisterScreen } from '../../src/features/auth/screens/RegisterScreen/RegisterScreen';
import * as authService from '../../src/features/auth/services/authService';

// Mock do authService
jest.mock('../../src/features/auth/services/authService', () => ({
  register: jest.fn(),
}));

// Mock do useAuthStore
jest.mock('../../src/features/auth/stores/authStore', () => ({
  useAuthStore: jest.fn(() => ({
    login: jest.fn(),
  })),
}));

// Mock do useKeyboardScroll
jest.mock('../../src/hooks/useKeyboardScroll', () => ({
  useKeyboardScroll: jest.fn(() => ({
    scrollRef: { current: null },
    handleFocusCapture: jest.fn(),
    handleContentSizeChange: jest.fn(),
  })),
}));

// Mock do useTranslation
jest.mock('../../src/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      const translations: Record<string, string> = {
        'auth.createAccount': 'Criar conta',
        'auth.welcome': 'Bem-vindo',
        'auth.createAccountSubtitle': 'Preencha os dados para criar sua conta',
        'auth.fullName': 'Nome completo',
        'auth.surname': 'Sobrenome',
        'auth.username': 'Nome de usuário',
        'auth.email': 'E-mail',
        'auth.password': 'Senha',
        'auth.confirmPassword': 'Confirmar senha',
        'auth.register': 'Criar conta',
        'auth.creatingAccount': 'Criando conta...',
        'auth.haveAccount': 'Já tem uma conta?',
        'auth.login': 'Entrar',
        'auth.backToLogin': 'Entrar',
        'auth.fillAllFields': 'Preencha todos os campos',
        'auth.passwordsDontMatch': 'As senhas não coincidem',
      };
      return translations[key] || key;
    },
    language: 'pt-BR',
    languages: [],
    changeLanguage: jest.fn(),
    ready: true,
  }),
}));

describe('RegisterScreen', () => {
  const mockOnLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (authService.register as jest.Mock).mockResolvedValue({
      user: {
        id: 'user_1',
        name: 'João Silva',
        firstName: 'João',
        lastName: 'Silva',
        username: 'joaosilva',
        email: 'joao@teste.com',
        imageUrl: null,
        initials: 'JS',
        notificationCount: 0,
      },
      token: 'token_abc123',
    });
  });

  it('deve renderizar sem lançar erro', async () => {
    const component = await render(
      <RegisterScreen onLogin={mockOnLogin} />,
    );
    expect(component).toBeDefined();
  });

  it('deve mostrar título de criar conta', async () => {
    const { getByText } = await render(<RegisterScreen onLogin={mockOnLogin} />);
    expect(getByText('Criar conta')).toBeTruthy();
  });

  it('deve mostrar botão de criar conta', async () => {
    const { getByText } = await render(<RegisterScreen onLogin={mockOnLogin} />);
    expect(getByText('Criar conta')).toBeTruthy();
  });

  it('deve mostrar link para login', async () => {
    const { getByText } = await render(<RegisterScreen onLogin={mockOnLogin} />);
    expect(getByText('Entrar')).toBeTruthy();
  });

  it('authService.register deve estar definido', () => {
    expect(authService.register).toBeDefined();
  });
});
