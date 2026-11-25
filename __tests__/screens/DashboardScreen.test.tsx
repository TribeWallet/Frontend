/**
 * Testes do DashboardScreen
 * Verifica renderização e integração com hooks
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import { DashboardScreen } from '../../src/features/dashboard/screens/DashboardScreen/DashboardScreen';

// Mock do useAuthStore
jest.mock('../../src/features/auth/stores/authStore', () => ({
  useAuthStore: jest.fn((selector) =>
    selector({
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
    }),
  ),
}));

// Mock do useTranslation
jest.mock('../../src/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      const translations: Record<string, string> = {
        'dashboard.hello': 'Olá',
        'dashboard.subtitle': 'Sua visão geral financeira em um só lugar.',
        'dashboard.totalGroups': 'Grupos',
        'dashboard.totalPayments': 'Pagamentos',
        'dashboard.totalCommitments': 'Compromissos',
        'dashboard.overdueAlert': 'Compromissos vencidos',
        'dashboard.noCommitments': 'Nenhum compromisso',
        'dashboard.noPayments': 'Nenhum pagamento',
      };
      return translations[key] || key;
    },
    language: 'pt-BR',
    languages: [],
    changeLanguage: jest.fn(),
    ready: true,
  }),
}));

// Mock do useNavigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
  })),
}));

// Mock dos hooks de dashboard
jest.mock('../../src/features/dashboard/hooks/useDashboard', () => ({
  useAppDashboard: jest.fn(() => ({
    data: null,
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  })),
}));

jest.mock('../../src/features/compromissos/hooks/useCommitmentSummaries', () => ({
  useCommitmentSummaries: jest.fn(() => ({
    commitments: [],
    commitmentsLoading: false,
  })),
}));

jest.mock('../../src/hooks/useNotifications', () => ({
  useAppNotifications: jest.fn(() => ({
    unreadCount: 0,
  })),
}));

jest.mock('../../src/hooks/useTopBarActions', () => ({
  useTopBarActions: jest.fn(() => ({
    onMenuPress: jest.fn(),
    onNotificationsPress: jest.fn(),
  })),
}));

// Mock do useWindowDimensions
jest.mock('react-native', () => {
  const actual = jest.requireActual('react-native');
  return {
    ...actual,
    useWindowDimensions: jest.fn(() => ({ width: 375, height: 812 })),
  };
});

describe('DashboardScreen', () => {
  it('deve renderizar sem lançar erro', async () => {
    const component = await render(<DashboardScreen />);
    expect(component).toBeDefined();
  });

  it('deve mostrar saudação', async () => {
    const { getByText } = await render(<DashboardScreen />);
    expect(getByText('João')).toBeTruthy();
  });

  it('deve mostrar subtitle do dashboard', async () => {
    const { getByText } = await render(<DashboardScreen />);
    expect(getByText('Sua visão geral financeira em um só lugar.')).toBeTruthy();
  });
});
