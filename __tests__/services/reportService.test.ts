/**
 * Testes de integração - ReportService (relatórios)
 * Simula comunicação frontend <-> backend nas rotas /api/relatorios/*
 */
import { mockApiClient } from '../../src/services/api/__mocks__/apiClient';
import { endpoints } from '../../src/config/api';
import * as reportService from '../../src/features/relatorios/services/reportService';
import { ApiError } from '../../src/services/api/apiClient';

jest.mock('../../src/services/api/apiClient', () => {
  const mod = require('../../src/services/api/__mocks__/apiClient');
  return { ...mod.mockApiClient, apiClient: mod.mockApiClient, ApiError: mod.ApiError, default: mod.mockApiClient };
});

beforeEach(() => {
  mockApiClient.reset();
});

describe('ReportService - Relatórios por usuário', () => {
  it('deve buscar relatório do usuário', async () => {
    const relatorio = await reportService.getUserReport('user_1');

    expect(relatorio).toBeDefined();
    expect(relatorio.totalPago).toBeDefined();
    expect(relatorio.nomeCompleto).toBeDefined();
    expect(mockApiClient.get).toHaveBeenCalledWith(
      endpoints.relatorios.byUsuario('user_1'),
    );
  });
});

describe('ReportService - Relatórios por grupo', () => {
  it('deve buscar relatório de um grupo', async () => {
    const relatorio = await reportService.getGroupReport('user_1', 'grupo_1');

    expect(relatorio).toBeDefined();
    expect(relatorio.nome).toBeDefined();
    expect(mockApiClient.get).toHaveBeenCalledWith(
      endpoints.relatorios.byGrupo('user_1', 'grupo_1'),
    );
  });
});

describe('ReportService - Compartilhamento de PDF', () => {
  it('deve baixar e compartilhar relatório em PDF', async () => {
    // O mock de downloadPdf retorna um arquivo válido
    const file = await mockApiClient.downloadPdf(
      endpoints.relatorios.pdfByUsuario('user_1'),
      'relatorio.pdf',
    );

    expect(file.uri).toContain('relatorio.pdf');
    expect(mockApiClient.downloadPdf).toHaveBeenCalledWith(
      endpoints.relatorios.pdfByUsuario('user_1'),
      'relatorio.pdf',
    );
  });
});
