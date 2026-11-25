/**
 * Testes de integração - CompromissoService
 * Simula comunicação frontend <-> backend nas rotas /api/compromissos/*
 */
import { mockApiClient } from '../../src/services/api/__mocks__/apiClient';
import { endpoints } from '../../src/config/api';
import * as compromissoService from '../../src/features/compromissos/services/compromissoService';
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
      {
        integranteToken: 'int_2',
        usuario: { usuarioToken: 'user_2', nome: 'Maria', sobrenome: 'Santos', email: 'maria@teste.com', deletedAt: null },
        grupoToken: 'grupo_1',
        deletedAt: null,
      },
    ],
    compromissos: [],
  });
});

describe('CompromissoService - Listagem', () => {
  it('deve listar compromissos de um grupo', async () => {
    mockApiClient.seedCompromisso({
      compromissoFinanceiroToken: 'comp_1',
      titulo: 'Aluguel',
      valorTotal: 1000,
      data: '2026-12-01',
      tipoDivisao: 1,
      imagem: null,
      categoria: 'Moradia',
      deletedAt: null,
      grupo: { grupoToken: 'grupo_1', nome: 'Casa', descricao: '', deletedAt: null, integrantes: [], compromissos: [] },
      participacoes: [],
    });

    const compromissos = await compromissoService.listCompromissosByGrupo('grupo_1');

    expect(compromissos.length).toBeGreaterThan(0);
    expect(mockApiClient.get).toHaveBeenCalledWith(
      `${endpoints.compromissos.byGrupo('grupo_1')}?deleted=false`,
    );
  });

  it('deve filtrar compromissos excluídos (soft delete)', async () => {
    mockApiClient.seedCompromisso({
      compromissoFinanceiroToken: 'comp_excluido',
      titulo: 'Excluído',
      valorTotal: 100,
      data: '2026-12-01',
      tipoDivisao: 1,
      imagem: null,
      categoria: 'Outros',
      deletedAt: '2026-01-01T00:00:00',
      grupo: { grupoToken: 'grupo_1', nome: 'Casa', descricao: '', deletedAt: null, integrantes: [], compromissos: [] },
      participacoes: [],
    });

    const compromissos = await compromissoService.listCompromissosByGrupo('grupo_1');
    const temExcluido = compromissos.some((c: any) => c.deletedAt);
    expect(temExcluido).toBe(false);
  });
});

describe('CompromissoService - CRUD', () => {
  it('deve criar um compromisso com divisão personalizada', async () => {
    const input = {
      name: 'Supermercado',
      groupId: 'grupo_1',
      category: 'Mercado',
      amount: 200,
      dueDate: '10/12/2026',
      splitMode: 'custom' as const,
      splits: [
        { integranteToken: 'int_1', amount: 120 },
        { integranteToken: 'int_2', amount: 80 },
      ],
    };

    const resultado = await compromissoService.createCompromisso(input);

    expect(resultado.compromissoFinanceiroToken).toBeDefined();
    expect(resultado.titulo).toBe('Supermercado');

    // Verifica que chamou o endpoint de criação de compromisso
    expect(mockApiClient.postForm).toHaveBeenCalledWith(
      endpoints.compromissos.byGrupo('grupo_1'),
      expect.any(FormData),
    );

    // Verifica que criou as participações (fatias)
    expect(mockApiClient.post).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/compromissos\/.*\/integrantes/),
      expect.arrayContaining([
        expect.objectContaining({ integranteToken: 'int_1', valorDevedor: 120 }),
        expect.objectContaining({ integranteToken: 'int_2', valorDevedor: 80 }),
      ]),
    );
  });

  it('deve obter um compromisso pelo token', async () => {
    mockApiClient.seedCompromisso({
      compromissoFinanceiroToken: 'comp_1',
      titulo: 'Aluguel',
      valorTotal: 1000,
      data: '2026-12-01',
      tipoDivisao: 1,
      imagem: null,
      categoria: 'Moradia',
      deletedAt: null,
      grupo: { grupoToken: 'grupo_1', nome: 'Casa', descricao: '', deletedAt: null, integrantes: [], compromissos: [] },
      participacoes: [],
    });

    const compromisso = await compromissoService.getCompromisso('comp_1');
    expect(compromisso.compromissoFinanceiroToken).toBe('comp_1');
    expect(mockApiClient.get).toHaveBeenCalledWith(
      endpoints.compromissos.byToken('comp_1'),
    );
  });

  it('deve atualizar um compromisso', async () => {
    mockApiClient.seedCompromisso({
      compromissoFinanceiroToken: 'comp_1',
      titulo: 'Aluguel',
      valorTotal: 1000,
      data: '2026-12-01',
      tipoDivisao: 1,
      imagem: null,
      categoria: 'Moradia',
      deletedAt: null,
      grupo: { grupoToken: 'grupo_1', nome: 'Casa', descricao: '', deletedAt: null, integrantes: [], compromissos: [] },
      participacoes: [],
    });

    await compromissoService.updateCompromisso('comp_1', {
      name: 'Aluguel Atualizado',
      groupId: 'grupo_1',
      category: 'Moradia',
      amount: 1100,
      dueDate: '15/12/2026',
      splitMode: 'equal',
      splits: [],
    });

    expect(mockApiClient.putForm).toHaveBeenCalledWith(
      endpoints.compromissos.byToken('comp_1'),
      expect.any(FormData),
    );
  });

  it('deve excluir um compromisso', async () => {
    mockApiClient.seedCompromisso({
      compromissoFinanceiroToken: 'comp_1',
      titulo: 'Aluguel',
      valorTotal: 1000,
      data: '2026-12-01',
      tipoDivisao: 1,
      imagem: null,
      categoria: 'Moradia',
      deletedAt: null,
      grupo: { grupoToken: 'grupo_1', nome: 'Casa', descricao: '', deletedAt: null, integrantes: [], compromissos: [] },
      participacoes: [],
    });

    await compromissoService.deleteCompromisso('comp_1');

    expect(mockApiClient.delete).toHaveBeenCalledWith(
      endpoints.compromissos.byToken('comp_1'),
    );
  });
});

describe('CompromissoService - Participações (splits)', () => {
  it('deve adicionar participantes a um compromisso existente', async () => {
    mockApiClient.seedCompromisso({
      compromissoFinanceiroToken: 'comp_1',
      titulo: 'Aluguel',
      valorTotal: 1000,
      data: '2026-12-01',
      tipoDivisao: 1,
      imagem: null,
      categoria: 'Moradia',
      deletedAt: null,
      grupo: { grupoToken: 'grupo_1', nome: 'Casa', descricao: '', deletedAt: null, integrantes: [], compromissos: [] },
      participacoes: [],
    });

    await compromissoService.addParticipacoes('comp_1', [
      { integranteToken: 'int_1', amount: 500 },
      { integranteToken: 'int_2', amount: 500 },
    ]);

    expect(mockApiClient.post).toHaveBeenCalledWith(
      endpoints.compromissos.participacoes('comp_1'),
      expect.arrayContaining([
        expect.objectContaining({ integranteToken: 'int_1', valorDevedor: 500 }),
        expect.objectContaining({ integranteToken: 'int_2', valorDevedor: 500 }),
      ]),
    );
  });

  it('deve remover uma participação de um compromisso', async () => {
    mockApiClient.seedCompromisso({
      compromissoFinanceiroToken: 'comp_1',
      titulo: 'Aluguel',
      valorTotal: 1000,
      data: '2026-12-01',
      tipoDivisao: 1,
      imagem: null,
      categoria: 'Moradia',
      deletedAt: null,
      grupo: { grupoToken: 'grupo_1', nome: 'Casa', descricao: '', deletedAt: null, integrantes: [], compromissos: [] },
      participacoes: [
        { integranteCompromissoToken: 'part_123', integrante: { integranteToken: 'int_1', usuario: {} }, valorDevedor: 100, valorPago: 0, deletedAt: null, pagamentos: [] },
      ],
    });

    await compromissoService.removeParticipacao('part_123');

    expect(mockApiClient.delete).toHaveBeenCalledWith(
      endpoints.compromissos.participacao('part_123'),
    );
  });
});
