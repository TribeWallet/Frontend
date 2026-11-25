/**
 * Testes de integração - ConviteService
 * Simula comunicação frontend <-> backend nas rotas /api/grupos/{token}/convites e /api/convites/*
 */
import { mockApiClient } from '../../src/services/api/__mocks__/apiClient';
import { endpoints } from '../../src/config/api';
import * as conviteService from '../../src/features/grupos/services/conviteService';
import { ApiError } from '../../src/services/api/apiClient';

jest.mock('../../src/services/api/apiClient', () => {
  const mod = require('../../src/services/api/__mocks__/apiClient');
  return { ...mod.mockApiClient, apiClient: mod.mockApiClient, ApiError: mod.ApiError, default: mod.mockApiClient };
});

beforeEach(() => {
  mockApiClient.reset();
});

describe('ConviteService - Criação', () => {
  it('deve criar um convite sem e-mail (link aberto)', async () => {
    mockApiClient.seedGrupo({
      grupoToken: 'grupo_1',
      nome: 'Casa',
      descricao: 'Teste',
      deletedAt: null,
      integrantes: [],
      compromissos: [],
    });

    const convite = await conviteService.createConvite('grupo_1');

    expect(convite.conviteToken).toBeDefined();
    expect(convite.link).toContain('tribewallet://convite/');
    expect(convite.emailConvidado).toBeNull();
    expect(mockApiClient.post).toHaveBeenCalledWith(
      endpoints.grupos.convites('grupo_1'),
      {},
    );
  });

  it('deve criar um convite com e-mail restrito', async () => {
    mockApiClient.seedGrupo({
      grupoToken: 'grupo_1',
      nome: 'Casa',
      descricao: 'Teste',
      deletedAt: null,
      integrantes: [],
      compromissos: [],
    });

    const convite = await conviteService.createConvite('grupo_1', 'amigo@teste.com');

    expect(convite.emailConvidado).toBe('amigo@teste.com');
    expect(mockApiClient.post).toHaveBeenCalledWith(
      endpoints.grupos.convites('grupo_1'),
      { email: 'amigo@teste.com' },
    );
  });
});

describe('ConviteService - Consulta e aceitação', () => {
  it('deve buscar informações de um convite pelo token', async () => {
    const info = await conviteService.getConvite('convite_abc');

    expect(info).toBeDefined();
    expect(mockApiClient.get).toHaveBeenCalledWith(
      endpoints.convites.byToken('convite_abc'),
    );
  });

  it('deve aceitar um convite e retornar o token do grupo', async () => {
    const resultado = await conviteService.aceitarConvite('convite_abc');

    expect(resultado.grupoToken).toBeDefined();
    expect(mockApiClient.post).toHaveBeenCalledWith(
      endpoints.convites.aceitar('convite_abc'),
    );
  });

  it('deve extrair o token de um link de convite', () => {
    const token = conviteService.parseConviteUrl('tribewallet://convite/abc123');
    expect(token).toBe('abc123');

    const token2 = conviteService.parseConviteUrl('tribewallet://convite/xyz789?param=1');
    expect(token2).toBe('xyz789');

    const invalido = conviteService.parseConviteUrl('https://outro-site.com');
    expect(invalido).toBeNull();
  });
});
