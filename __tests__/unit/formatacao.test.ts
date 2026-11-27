import { formatCurrency, parseCurrency } from '../../src/utils/currency';
import { maskMoney, parseMoney, maskDateBR, maskNumber } from '../../src/utils/masks';
import { initialsFromName, fullName, splitFullName, isValidEmail } from '../../src/utils/formatters';
import { categoryTranslations, translateCategory } from '../../src/utils/categoryTranslations';

const limpar = (s: string) => s.replace(/ /g, ' ');

describe('Moeda', () => {
  it.each([[0, 'R$ 0,00'], [1234.5, 'R$ 1.234,50'], [0.1, 'R$ 0,10']])('formata %d', (v, e) =>
    expect(limpar(formatCurrency(v))).toBe(e));
  it.each([['R$ 1.234,56', 1234.56], ['10,5', 10.5], ['', 0], ['abc', 0]])('parseCurrency("%s")', (v, e) =>
    expect(parseCurrency(v as string)).toBe(e));
});

describe('Máscaras', () => {
  it.each([['', ''], ['abc', ''], ['5', '0,05'], ['123', '1,23'], ['000150', '1,50'], ['999999999999999', '999999999,99']])(
    'maskMoney("%s")', (v, e) => expect(maskMoney(v)).toBe(e));
  it.each([['1.234,56', 1234.56], ['0,05', 0.05], ['x', 0]])('parseMoney("%s")', (v, e) => expect(parseMoney(v as string)).toBe(e));
  it.each([['1', '1'], ['123', '12/3'], ['12102026', '12/10/2026'], ['12/10/2026999', '12/10/2026']])(
    'maskDateBR("%s")', (v, e) => expect(maskDateBR(v)).toBe(e));
  it('maskNumber remove letras e respeita o limite', () => {
    expect(maskNumber('a1b2c3')).toBe('12');
    expect(maskNumber('12345', 4)).toBe('1234');
  });
});

describe('Nomes e e-mail', () => {
  it.each([['Conta de luz', 'CL'], ['Aluguel', 'AL'], ['Combustível e pedágio', 'CP'], ['  ', 'NV'], ['de - e', 'NV'], ['Água & Esgoto', 'ÁE']])(
    'iniciais de "%s"', (v, e) => expect(initialsFromName(v)).toBe(e));
  it('fullName não deixa espaço sobrando', () => expect(fullName('Ana', '')).toBe('Ana'));
  it('splitFullName separa a primeira palavra', () =>
    expect(splitFullName('  Ana  Maria Souza ')).toEqual({ nome: 'Ana', sobrenome: 'Maria Souza' }));
  it('splitFullName com nome único', () => expect(splitFullName('Ana')).toEqual({ nome: 'Ana', sobrenome: '' }));
  it.each(['a@b.com', 'a.b+c@d.com.br'])('e-mail válido: %s', (v) => expect(isValidEmail(v)).toBe(true));
  it.each(['', 'a@', '@b.com', 'a@b', 'a b@c.com'])('e-mail inválido: "%s"', (v) => expect(isValidEmail(v)).toBe(false));
});

describe('Categorias', () => {
  it.each(Object.keys(categoryTranslations))('"%s" tem os três idiomas', (c) => {
    for (const idioma of ['pt-BR', 'en-US', 'es-ES'] as const) expect(translateCategory(c, idioma)).toBeTruthy();
  });
  it('categoria desconhecida é exibida como veio', () => expect(translateCategory('Pets', 'en-US')).toBe('Pets'));
});
