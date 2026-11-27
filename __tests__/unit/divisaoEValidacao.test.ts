import { computeSplits, summarizeCommitment } from '../../src/features/compromissos/services/split';
import { paymentFormSchema } from '../../src/features/pagamentos/validations/paymentSchema';

const membros = (n: number) => Array.from({ length: n }, (_, i) => ({ integranteToken: `i${i}` }));

describe('Divisão', () => {
  it.each([[100, 3], [0.01, 3], [10, 7], [99.99, 2], [1000, 24]])('igual: %d entre %i não perde centavos', (valor, n) => {
    const r = computeSplits(valor, membros(n), 'equal');
    expect(r.entries.reduce((s, e) => s + Math.round(e.amount * 100), 0)).toBe(Math.round(valor * 100));
    expect(r.balanced).toBe(true);
  });
  it('sem membros não é balanceado', () => expect(computeSplits(100, [], 'equal').balanced).toBe(false));
  it('valor negativo vira zero', () => expect(computeSplits(-5, membros(2), 'equal').total).toBe(0));
  it('personalizada balanceada', () => expect(computeSplits(100, membros(2), 'custom',
    [{ integranteToken: 'i0', amount: 30 }, { integranteToken: 'i1', amount: 70 }]).balanced).toBe(true));
  it('personalizada com soma errada não é balanceada', () =>
    expect(computeSplits(100, membros(2), 'custom', [{ integranteToken: 'i0', amount: 30 }]).balanced).toBe(false));
  it.each([[0, 100, 0], [50, 50, 50], [150, 0, 100]])('resumo com %d pago', (pago, resta, progresso) =>
    expect(summarizeCommitment({ amount: 100, splits: [{ paidAmount: pago }] } as never))
      .toEqual({ paid: pago, remaining: resta, progress: progresso }));
  it('resumo de valor zero não divide por zero', () =>
    expect(summarizeCommitment({ amount: 0, splits: [] } as never).progress).toBe(0));
});

describe('Formulário de pagamento', () => {
  const base = { groupId: 'g', commitmentId: 'c', amount: '10,50', date: '12/10/2026', method: 'pix' };
  const valido = (patch: object) => paymentFormSchema.safeParse({ ...base, ...patch }).success;
  it('aceita um formulário correto', () => expect(valido({})).toBe(true));
  it.each([['groupId', ''], ['commitmentId', ''], ['amount', ''], ['amount', '0'], ['amount', '-1'],
    ['amount', '10,555'], ['amount', 'dez'], ['date', '2026-10-12'], ['method', 'cheque']])(
    'recusa %s = "%s"', (campo, v) => expect(valido({ [campo]: v })).toBe(false));
});
