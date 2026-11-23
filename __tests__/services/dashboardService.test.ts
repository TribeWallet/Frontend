/**
 * Testes de integração - DashboardService
 * Simula comunicação frontend <-> backend na rota /api/usuarios/{token}/dashboard
 */
import { mockApiClient } from '../../src/services/api/__mocks__/apiClient';
import { endpoints } from '../../src/config/api';
import { fetchDashboard } from '../../src/features/dashboard/Services/dashboardService';
import { ApiError } from '../../src/services/api/apiClient';

jest.mock('../../src/services/api/apiClient', () => {
  const mod = require('../../src/services/api/__mocks__/apiClient');
  return { ...mod.mockApiClient, apiClient: mod.mockApiClient, ApiError: mod.ApiError, default: mod.mockApiClient };
});

beforeEach(() => {
  mockApiClient.reset();
  mockApiClient.seedUsuario({
    usuarioToken: 'user_1',
    nome: 'João',
    sobrenome: 'Silva',
    email: 'joao@teste.com',
    username: 'joaosilva',
    imageUrl: null,
    deletedAt: null,
  });
});

describe('DashboardService', () => {
  it('deve buscar dados do dashboard do usuário', async () => {
    const dashboard = await fetchDashboard('user_1');

    expect(dashboard).toBeDefined();
    expect(dashboard.valorTotalPago).toBeDefined();
    expect(mockApiClient.get).toHaveBeenCalledWith(
      endpoints.usuarios.dashboard('user_1'),
    );
  });

  it('deve falhar se o usuário não existir', async () => {
    await expect(fetchDashboard('user_inexistente')).rejects.toThrow('Usuário não encontrado');
  });
});
