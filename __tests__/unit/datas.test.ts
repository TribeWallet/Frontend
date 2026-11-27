import { formatBR, parseBRDate, diffDays, isoToBR, brToISO, isCommitmentOverdue, todayBR } from '../../src/utils/date';

const emDias = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return formatBR(d); };

describe('Datas', () => {
  it('formatBR preenche dia e mês com zero', () => expect(formatBR(new Date(2026, 0, 5))).toBe('05/01/2026'));
  it('todayBR segue o formato DD/MM/AAAA', () => expect(todayBR()).toMatch(/^\d{2}\/\d{2}\/\d{4}$/));
  it('parseBRDate lê uma data válida', () => expect(formatBR(parseBRDate('29/02/2028')!)).toBe('29/02/2028'));
  it.each(['', '10/2026', 'aa/bb/cccc', '2026-10-12'])('parseBRDate recusa formato inválido "%s"', (v) =>
    expect(parseBRDate(v)).toBeNull());
  it.each([[0, 0], [1, 1], [-1, -1], [30, 30]])('diffDays para %i dia(s)', (n, esperado) =>
    expect(diffDays(emDias(n))).toBe(esperado));
  it.each([undefined, '', 'lixo'])('diffDays devolve null para %s', (v) => expect(diffDays(v)).toBeNull());
  it('isoToBR converte ISO', () => expect(isoToBR('2026-10-12T12:00:00Z')).toBe('12/10/2026'));
  it.each([null, undefined, '', 'lixo'])('isoToBR devolve vazio para %s', (v) => expect(isoToBR(v)).toBe(''));
  it('brToISO preserva o dia na ida e volta', () => expect(isoToBR(brToISO('01/12/2026'))).toBe('01/12/2026'));
});

describe('Vencimento', () => {
  it('pago nunca está vencido', () => expect(isCommitmentOverdue({ status: 'paid', dueDate: emDias(-10) })).toBe(false));
  it('pendente com data passada está vencido', () => expect(isCommitmentOverdue({ status: 'pending', dueDate: emDias(-1) })).toBe(true));
  it('vence hoje ainda não está vencido', () => expect(isCommitmentOverdue({ status: 'pending', dueDate: emDias(0) })).toBe(false));
  it('a data prevalece sobre a flag do backend', () =>
    expect(isCommitmentOverdue({ status: 'partial', dueDate: emDias(2), overdue: true })).toBe(false));
  it('sem data usa a flag do backend', () => expect(isCommitmentOverdue({ status: 'pending', overdue: true })).toBe(true));
});
