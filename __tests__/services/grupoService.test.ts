/**
 * Testes de integração - GrupoService
 * Simula comunicação frontend <-> backend nas rotas /api/grupos/*
 */
import { mockApiClient } from '../../src/services/api/__mocks__/apiClient';
import { endpoints } from '../../src/config/api';
import * as grupoService from '../../src/features/grupos/services/grupoService';
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
  mockApiClient.seedUsuario({
    usuarioToken: 'user_2',
    nome: 'Maria',
    sobrenome: 'Santos',
    email: 'maria@teste.com',
    username: 'mariasantos',
    imageUrl: null,
    deletedAt: null,
  });
});

describe('GrupoService - Listagem', () => {
  it('deve listar grupos do usuário ativo', async () => {
    mockApiClient.seedGrupo({
      grupoToken: 'grupo_1',
      nome: 'Casa',
      descricao: 'Despesas da casa',
      deletedAt: null,
      integrantes: [
        {
          integranteToken: 'int_1',
          usuario: { usuarioToken: 'user_1', nome: 'João', sobrenome: 'Silva', email: 'joao@teste.com', deletedAt: null },
          grupoToken: 'grupo_1',
          deletedAt: null,
        },
      ],
      compromissos: [],
    });

    const grupos = await grupoService.listGrupos('user_1');
    expect(grupos.length).toBeGreaterThan(0);
    expect(mockApiClient.get).toHaveBeenCalledWith(
      endpoints.grupos.byUsuario('user_1'),
    );
  });
});

describe('GrupoService - CRUD', () => {
  it('deve criar um grupo com integrantes', async () => {
    const grupo = await grupoService.createGrupo({
      nome: 'Viagem',
      descricao: 'Viagem de fim de ano',
      usuarioTokens: ['user_1', 'user_2'],
    });

    expect(grupo.grupoToken).toBeDefined();
    expect(grupo.nome).toBe('Viagem');
    expect(mockApiClient.post).toHaveBeenCalledWith(
      endpoints.grupos.create,
      expect.objectContaining({ nome: 'Viagem' }),
    );
  });

  it('deve buscar um grupo pelo token', async () => {
    mockApiClient.seedGrupo({
      grupoToken: 'grupo_1',
      nome: 'Casa',
      descricao: 'Teste',
      deletedAt: null,
      integrantes: [],
      compromissos: [],
    });

    const grupo = await grupoService.getGrupo('grupo_1');
    expect(grupo.grupoToken).toBe('grupo_1');
    expect(mockApiClient.get).toHaveBeenCalledWith(
      `${endpoints.grupos.byToken('grupo_1')}?deleted=false`,
    );
  });

  it('deve atualizar um grupo', async () => {
    mockApiClient.seedGrupo({
      grupoToken: 'grupo_1',
      nome: 'Casa',
      descricao: 'Teste',
      deletedAt: null,
      integrantes: [],
      compromissos: [],
    });

    await grupoService.updateGrupo('grupo_1', { nome: 'Casa Atualizada', descricao: 'Nova desc' });

    expect(mockApiClient.put).toHaveBeenCalledWith(
      endpoints.grupos.byToken('grupo_1'),
      { nome: 'Casa Atualizada', descricao: 'Nova desc' },
    );
  });

  it('deve excluir um grupo (soft delete)', async () => {
    mockApiClient.seedGrupo({
      grupoToken: 'grupo_1',
      nome: 'Casa',
      descricao: 'Teste',
      deletedAt: null,
      integrantes: [],
      compromissos: [],
    });

    await grupoService.deleteGrupo('grupo_1');

    expect(mockApiClient.delete).toHaveBeenCalledWith(
      endpoints.grupos.byToken('grupo_1'),
    );
  });
});

describe('GrupoService - Membros', () => {
  it('deve adicionar integrantes a um grupo', async () => {
    mockApiClient.seedGrupo({
      grupoToken: 'grupo_1',
      nome: 'Casa',
      descricao: 'Teste',
      deletedAt: null,
      integrantes: [],
      compromissos: [],
    });

    await grupoService.addIntegrantes('grupo_1', ['user_2']);

    expect(mockApiClient.put).toHaveBeenCalledWith(
      endpoints.grupos.integrantes('grupo_1'),
      [{ usuarioToken: 'user_2' }],
    );
  });

  it('deve remover um integrante de um grupo', async () => {
    mockApiClient.seedGrupo({
      grupoToken: 'grupo_1',
      nome: 'Casa',
      descricao: 'Teste',
      deletedAt: null,
      integrantes: [
        {
          integranteToken: 'int_1',
          usuario: { usuarioToken: 'user_2', nome: 'Maria', sobrenome: 'Santos', email: 'maria@teste.com', deletedAt: null },
          grupoToken: 'grupo_1',
          deletedAt: null,
        },
      ],
      compromissos: [],
    });

    await grupoService.removeIntegrante('grupo_1', 'int_1');

    expect(mockApiClient.delete).toHaveBeenCalledWith(
      endpoints.grupos.integrante('grupo_1', 'int_1'),
    );
  });
});
