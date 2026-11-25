/**
 * Testes de integração - PagamentoService
 * Simula comunicação frontend <-> backend nas rotas /api/Pagamento/*
 */
import { mockApiClient } from '../../src/services/api/__mocks__/apiClient';
import { endpoints } from '../../src/config/api';
import * as pagamentoService from '../../src/features/pagamentos/services/pagamentoService';
import { ApiError } from '../../src/services/api/apiClient';

jest.mock('../../src/services/api/apiClient', () => {
  const mod = require('../../src/services/api/__mocks__/apiClient');
  return { ...mod.mockApiClient, apiClient: mod.mockApiClient, ApiError: mod.ApiError, default: mod.mockApiClient };
});

beforeEach(() => {
  mockApiClient.reset();
});

describe('PagamentoService - CRUD', () => {
  it('deve criar um pagamento sem comprovante', async () => {
    const draft = {
      shareId: 'part_1',
      amount: 150,
      date: '10/12/2026',
      method: 'pix' as const,
    };

    const resultado = await pagamentoService.createPagamento(draft);

    expect(resultado.pagamentoToken).toBeDefined();
    expect(resultado.valor).toBe(150);
    expect(mockApiClient.postForm).toHaveBeenCalledWith(
      endpoints.pagamentos.create,
      expect.any(FormData),
    );

    const call = mockApiClient.postForm.mock.calls.find((c: any) => c[0] === endpoints.pagamentos.create);
    const form = call![1];
    expect(form.get('IntegranteCompromissoToken')).toBe('part_1');
    expect(form.get('Valor')).toBe('150');
    expect(form.get('Metodo')).toBe('1'); // pix = 1
    // Comprovante não deve estar presente
    expect(form.get('Comprovante')).toBeNull();
  });

  it('deve criar um pagamento com comprovante (anexo)', async () => {
    const draft = {
      shareId: 'part_1',
      amount: 150,
      date: '10/12/2026',
      method: 'dinheiro' as const,
      comprovante: {
        uri: 'file:///data/comprovante.pdf',
        name: 'comprovante.pdf',
        type: 'application/pdf',
      },
    };

    const resultado = await pagamentoService.createPagamento(draft);

    expect(resultado.comprovanteUrl).toBe('http://mock/comprovante.pdf');
    const call = mockApiClient.postForm.mock.calls.find((c: any) => c[0] === endpoints.pagamentos.create);
    const form = call![1];
    expect(form.get('Comprovante')).toBeDefined();
  });

  it('deve atualizar um pagamento', async () => {
    mockApiClient.seedPagamento({
      pagamentoToken: 'pag_1',
      valor: 150,
      data: '2026-12-10',
      comprovanteUrl: null,
      metodo: 1,
    });

    await pagamentoService.updatePagamento('pag_1', {
      amount: 200,
      method: 'credito',
    });

    expect(mockApiClient.putForm).toHaveBeenCalledWith(
      endpoints.pagamentos.byToken('pag_1'),
      expect.any(FormData),
    );

    const call = mockApiClient.putForm.mock.calls.find((c: any) => c[0] === endpoints.pagamentos.byToken('pag_1'));
    const form = call![1];
    expect(form.get('Valor')).toBe('200');
    expect(form.get('Metodo')).toBe('3'); // credito = 3
  });

  it('deve excluir um pagamento', async () => {
    mockApiClient.seedPagamento({
      pagamentoToken: 'pag_1',
      valor: 150,
      data: '2026-12-10',
      comprovanteUrl: null,
      metodo: 1,
    });

    await pagamentoService.deletePagamento('pag_1');

    expect(mockApiClient.delete).toHaveBeenCalledWith(
      endpoints.pagamentos.byToken('pag_1'),
    );
  });

  it('deve falhar se o pagamento não existir ao excluir', async () => {
    await expect(pagamentoService.deletePagamento('pag_inexistente')).rejects.toThrow(
      'Pagamento não encontrado',
    );
  });
});

describe('PagamentoService - Conversão de métodos', () => {
  it('deve mapear método de pagamento para enum do backend', () => {
    // pix -> 1, dinheiro -> 2, credito -> 3, debito -> 4, transferencia -> 5, boleto -> 6
    expect(pagamentoService['METHOD_TO_API']['pix']).toBe(1);
    expect(pagamentoService['METHOD_TO_API']['dinheiro']).toBe(2);
    expect(pagamentoService['METHOD_TO_API']['credito']).toBe(3);
    expect(pagamentoService['METHOD_TO_API']['debito']).toBe(4);
    expect(pagamentoService['METHOD_TO_API']['transferencia']).toBe(5);
    expect(pagamentoService['METHOD_TO_API']['boleto']).toBe(6);
  });
});
