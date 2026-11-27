import { apiClient } from '../../src/services/api/apiClient';
import {
  createCompromisso, toCommitment, toCommitmentSummary, listCompromissosByGrupo,
} from '../../src/features/compromissos/services/compromissoService';

jest.mock('../../src/services/api/apiClient', () => ({
  apiClient: { get: jest.fn(), post: jest.fn(), postForm: jest.fn() },
}));
const api = apiClient as unknown as Record<'get' | 'post' | 'postForm', jest.Mock>;

const entrada = (patch: object = {}) => ({
  groupId: 'g', name: 'TV', amount: 100, dueDate: '15/01/2027', category: 'Compras', splitMode: 'equal' as const,
  splits: [{ integranteToken: 'a', amount: 50 }, { integranteToken: 'b', amount: 50 }], ...patch,
});
const campos = (nome: string) => api.postForm.mock.calls.map((c) => c[1].get(nome) as string);

beforeEach(() => {
  api.postForm.mockResolvedValue({ compromissoFinanceiroToken: 't' });
  api.post.mockResolvedValue({ compromissoFinanceiroToken: 't' });
});

describe('Parcelamento', () => {
  it('cria uma parcela por mês com título numerado', async () => {
    await createCompromisso(entrada({ parcelas: 3 }));
    expect(campos('Titulo')).toEqual(['TV (1/3)', 'TV (2/3)', 'TV (3/3)']);
  });
  it('a soma das parcelas é igual ao total', async () => {
    await createCompromisso(entrada({ parcelas: 3 }));
    expect(campos('ValorTotal').reduce((s, v) => s + Math.round(Number(v) * 100), 0)).toBe(10000);
  });
  it.each([[0, 1], [-3, 1], [99, 24]])('limita parcelas=%i a %i', async (pedido, esperado) => {
    await createCompromisso(entrada({ parcelas: pedido }));
    expect(api.postForm).toHaveBeenCalledTimes(esperado as number);
  });
  it('sem participantes não chama a rota de participações', async () => {
    await createCompromisso(entrada({ splits: [] }));
    expect(api.post).not.toHaveBeenCalled();
  });
});

describe('Conversão da API', () => {
  const resumo = (patch: object) => toCommitmentSummary({ compromissoFinanceiroToken: 't', titulo: 'Conta de luz', grupoToken: 'g',
    nomeGrupo: 'G', dataVencimento: '2027-01-01T12:00:00Z', valorTotal: 100, valorPagoTotal: 0, valorRestanteTotal: 100,
    progressoPagamentos: 0, vencido: false, tipoDivisao: 1, ...patch } as never);
  it.each([[0, 'pending'], [40, 'partial'], [99.995, 'paid'], [100, 'paid']])('status com %d pago = %s', (pago, e) =>
    expect(resumo({ valorPagoTotal: pago }).status).toBe(e));
  it('categoria ausente vira "Outros"', () => expect(resumo({ categoria: null }).category).toBe('Outros'));
  it.each([[1, 'equal'], [2, 'equal'], [3, 'custom'], [4, 'equal']])('tipoDivisao %i = %s', (t, e) =>
    expect(resumo({ tipoDivisao: t }).splitMode).toBe(e));
  it('ignora participação excluída', () => expect(toCommitment({ compromissoFinanceiroToken: 't', titulo: 'x', data: '2027-01-01',
    valorTotal: 10, tipoDivisao: 1, participacoes: [{ deletedAt: '2026-01-01' }] } as never, { id: 'g', name: 'G' }).splits).toEqual([]));
  it('lista filtra compromissos excluídos', async () => {
    api.get.mockResolvedValue([{ deletedAt: null }, { deletedAt: '2026-01-01' }]);
    await expect(listCompromissosByGrupo('g')).resolves.toHaveLength(1);
  });
});
