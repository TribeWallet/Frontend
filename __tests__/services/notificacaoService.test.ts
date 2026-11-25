/**
 * Testes de integração - NotificacaoService
 * Simula comunicação frontend <-> backend nas rotas /api/notificacoes/*
 */
import { mockApiClient } from '../../src/services/api/__mocks__/apiClient';
import { endpoints } from '../../src/config/api';
import * as notificacaoService from '../../src/features/notificacoes/services/notificacaoService';
import { ApiError } from '../../src/services/api/apiClient';

jest.mock('../../src/services/api/apiClient', () => {
  const mod = require('../../src/services/api/__mocks__/apiClient');
  return { ...mod.mockApiClient, apiClient: mod.mockApiClient, ApiError: mod.ApiError, default: mod.mockApiClient };
});

beforeEach(() => {
  mockApiClient.reset();

  mockApiClient.seedNotificacao({
    notificacaoToken: 'notif_1',
    tipo: 3,
    mensagem: 'Pagamento registrado com sucesso',
    entidade: 'pagamento',
    entidadeToken: 'pag_1',
    origemNome: 'João Silva',
    dataEnvio: new Date().toISOString(),
    lida: false,
    deletedAt: null,
  });
  mockApiClient.seedNotificacao({
    notificacaoToken: 'notif_2',
    tipo: 2,
    mensagem: 'Novo compromisso criado',
    entidade: 'compromisso',
    entidadeToken: 'comp_1',
    origemNome: 'Sistema',
    dataEnvio: new Date().toISOString(),
    lida: true,
    deletedAt: null,
  });
  mockApiClient.seedNotificacao({
    notificacaoToken: 'notif_excluida',
    tipo: 1,
    mensagem: 'Convite de grupo',
    entidade: 'grupo',
    entidadeToken: 'grupo_1',
    origemNome: 'Sistema',
    dataEnvio: new Date().toISOString(),
    lida: false,
    deletedAt: '2026-01-01T00:00:00',
  });
});

describe('NotificacaoService - Listagem e contagem', () => {
  it('deve listar todas as notificações ativas', async () => {
    const notificacoes = await notificacaoService.listNotificacoes();

    expect(Array.isArray(notificacoes)).toBe(true);
    expect(notificacoes.length).toBe(2); // 2 ativas, 1 excluída filtrada
    expect(mockApiClient.get).toHaveBeenCalledWith(endpoints.notificacoes.list);
  });

  it('deve contar notificações não lidas', async () => {
    const count = await notificacaoService.countNaoLidas();

    expect(count).toBe(1); // apenas notif_1 não lida e ativa
    expect(mockApiClient.get).toHaveBeenCalledWith(
      endpoints.notificacoes.unreadCount,
    );
  });
});

describe('NotificacaoService - Marcar como lida e excluir', () => {
  it('deve marcar uma notificação como lida', async () => {
    await notificacaoService.marcarLida('notif_1');

    expect(mockApiClient.patch).toHaveBeenCalledWith(
      endpoints.notificacoes.markRead('notif_1'),
    );
  });

  it('deve marcar todas as notificações como lidas', async () => {
    await notificacaoService.marcarTodasLidas();

    expect(mockApiClient.patch).toHaveBeenCalledWith(
      endpoints.notificacoes.markAllRead,
    );
  });

  it('deve excluir uma notificação', async () => {
    await notificacaoService.excluirNotificacao('notif_1');

    expect(mockApiClient.delete).toHaveBeenCalledWith(
      endpoints.notificacoes.byToken('notif_1'),
    );
  });

  it('deve falhar se a notificação não existir ao excluir', async () => {
    await expect(notificacaoService.excluirNotificacao('notif_inexistente')).rejects.toThrow(
      'Notificação não encontrada',
    );
  });
});
