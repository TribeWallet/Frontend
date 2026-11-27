/**
 * Testes de integração - AuthService (login e registro)
 * Simula a comunicação frontend <-> backend nas rotas /api/auth/*
 */
import { mockApiClient } from '../../src/services/api/__mocks__/apiClient';
import { endpoints } from '../../src/config/api';
import * as authService from '../../src/features/auth/services/authService';
import { ApiError } from '../../src/services/api/apiClient';

jest.mock('../../src/services/api/apiClient', () => {
  const mod = require('../../src/services/api/__mocks__/apiClient');
  return { ...mod.mockApiClient, apiClient: mod.mockApiClient, ApiError: mod.ApiError, default: mod.mockApiClient };
});

beforeEach(() => {
  mockApiClient.reset();
  mockApiClient.setAuthToken(null);

  // Seed de usuário existente para login
  mockApiClient.seedUsuario({
    usuarioToken: 'user_existente_1',
    nome: 'João',
    sobrenome: 'Silva',
    email: 'joao@teste.com',
    username: 'joaosilva',
    senha: 'senha123',
    imageUrl: null,
    deletedAt: null,
  });
});

describe('AuthService - Login', () => {
  it('deve fazer login com sucesso e retornar usuário + token', async () => {
    const result = await authService.login({ email: 'joao@teste.com', senha: 'senha123' });

    expect(result.token).toBeDefined();
    expect(result.user.id).toBe('user_existente_1');
    expect(result.user.email).toBe('joao@teste.com');
    expect(mockApiClient.getAuthToken()).toBeDefined();
  });

  it('deve falhar com credenciais inválidas (401)', async () => {
    await expect(
      authService.login({ email: 'joao@teste.com', senha: 'senha_errada' }),
    ).rejects.toThrow('E-mail ou senha inválidos');
  });

  it('deve falhar se a conta estiver excluída (soft delete)', async () => {
    // Usuário já existe com deletedAt = null, então vamos simular uma conta excluída
    // criando um usuário com deletedAt preenchido
    mockApiClient.seedUsuario({
      usuarioToken: 'user_excluido',
      nome: 'Excluído',
      sobrenome: 'Usuário',
      email: 'excluido@teste.com',
      username: 'excluido',
      senha: 'senha123',
      imageUrl: null,
      deletedAt: '2026-01-01T00:00:00',
    });

    await expect(
      authService.login({ email: 'excluido@teste.com', senha: 'senha123' }),
    ).rejects.toThrow('Esta conta foi excluída.');
  });
});

describe('AuthService - Registro', () => {
  it('deve registrar um novo usuário com sucesso', async () => {
    const novoUsuario = {
      nome: 'Maria',
      sobrenome: 'Santos',
      username: 'mariasantos',
      email: 'maria@teste.com',
      senha: 'senha456',
    };

    const result = await authService.register(novoUsuario);

    expect(result.usuarioToken).toBeDefined();
    expect(result.email).toBe('maria@teste.com');
    expect(result.nome).toBe('Maria');
    expect(mockApiClient.post).toHaveBeenCalledWith(
      endpoints.auth.register,
      {
        nome: 'Maria',
        sobrenome: 'Santos',
        username: 'mariasantos',
        email: 'maria@teste.com',
        senha: 'senha456',
      },
      { auth: false },
    );
  });

  it('deve falhar se o e-mail já estiver cadastrado (400)', async () => {
    await expect(
      authService.register({
        nome: 'João',
        sobrenome: 'Silva',
        username: 'joaosilva2',
        email: 'joao@teste.com', // já existe
        senha: 'senha123',
      }),
    ).rejects.toThrow('E-mail ou nome de usuário já cadastrado.');
  });
});
