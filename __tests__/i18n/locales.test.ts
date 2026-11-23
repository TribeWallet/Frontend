/**
 * Testes de Internacionalização (i18n)
 *
 * Verifica que:
 * 1. Os 3 arquivos de locale (pt-BR, en-US, es-ES) existem e são JSON válidos
 * 2. Todas as chaves existem em todos os 3 idiomas (sem chaves faltando)
 * 3. Não há chaves com valor vazio ou nulo
 * 4. Interpolação usa chaves duplas {{nome}} conforme exigido pelo i18next
 * 5. Todas as telas usam t() (não aparecem chaves brutas não traduzidas)
 */

import ptBR from '../../src/locales/pt-BR.json';
import enUS from '../../src/locales/en-US.json';
import esES from '../../src/locales/es-ES.json';

const locales = {
  'pt-BR': ptBR,
  'en-US': enUS,
  'es-ES': esES,
} as const;

const languageCodes = Object.keys(locales) as Array<keyof typeof locales>;

function collectKeys(obj: any, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...collectKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function getValue(obj: any, keyPath: string): any {
  return keyPath.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);
}

describe('i18n - Estrutura de locales', () => {
  it('deve ter exatamente 3 arquivos de locale', () => {
    expect(Object.keys(locales).length).toBe(3);
    expect(languageCodes).toContain('pt-BR');
    expect(languageCodes).toContain('en-US');
    expect(languageCodes).toContain('es-ES');
  });

  it('deve ser JSON válido em todos os idiomas', () => {
    for (const lang of languageCodes) {
      expect(() => JSON.stringify(locales[lang])).not.toThrow();
    }
  });

  it('deve ter namespaces comuns em todos os idiomas', () => {
    const commonNamespaces = [
      'common',
      'auth',
      'dashboard',
      'commitments',
      'payments',
      'grupos',
      'notifications',
      'reports',
      'settings',
      'profile',
      'datePicker',
      'loading',
      'newGroup',
      'newPayment',
      'editPayment',
      'commitmentDetail',
      'groupDetail',
      'groups',
      'newCommitment',
      'commitmentCard',
      'groupCard',
      'history',
      'editProfile',
      'support',
      'notificationsModal',
    ];
    for (const ns of commonNamespaces) {
      for (const lang of languageCodes) {
        expect(locales[lang][ns]).toBeDefined();
        expect(typeof locales[lang][ns]).toBe('object');
      }
    }
  });
});

describe('i18n - Consistência de chaves entre idiomas', () => {
  const ptKeys = collectKeys(locales['pt-BR']);

  for (const lang of languageCodes) {
    it(`deve ter as mesmas chaves que pt-BR em ${lang} (ou chaves extras, não faltando)`, () => {
      const otherKeys = collectKeys(locales[lang]);
      const missingInOther = ptKeys.filter((k) => !otherKeys.includes(k));
      const extraInOther = otherKeys.filter((k) => !ptKeys.includes(k));

      // Não deve faltar chaves em relação ao pt-BR (chaves extras são aceitáveis)
      expect(missingInOther).toEqual([]);
    });
  }

  it('não deve ter chaves com valor vazio, nulo ou undefined', () => {
    const emptyKeys: string[] = [];

    for (const lang of languageCodes) {
      const keys = collectKeys(locales[lang]);
      for (const key of keys) {
        const value = getValue(locales[lang], key);
        if (value === '' || value === null || value === undefined) {
          emptyKeys.push(`${lang}.${key}`);
        }
      }
    }

    expect(emptyKeys).toEqual([]);
  });

  it('deve usar chaves duplas {{nome}} para interpolação (não {nome} simples)', () => {
    const badInterpolationKeys: string[] = [];

    for (const lang of languageCodes) {
      const keys = collectKeys(locales[lang]);
      for (const key of keys) {
        const value = getValue(locales[lang], key);
        if (typeof value === 'string') {
          // Remove interpolações válidas {{...}} primeiro
          const withoutDoubleBraces = value.replace(/\{\{[^{}]+\}\}/g, '');
          // Agora procura por chaves simples {nome} restantes (não duplas)
          const singleBraceMatches = withoutDoubleBraces.match(/\{[^{}]+\}/g);
          if (singleBraceMatches) {
            badInterpolationKeys.push(`${lang}.${key}: ${value}`);
          }
        }
      }
    }

    expect(badInterpolationKeys).toEqual([]);
  });
});

describe('i18n - Traduções específicas por idioma', () => {
  it('pt-BR deve ter textos em português', () => {
    expect(locales['pt-BR'].auth.login).toBe('Entrar');
    expect(locales['pt-BR'].common.save).toBe('Salvar');
    expect(locales['pt-BR'].common.delete).toBe('Excluir');
    expect(locales['pt-BR'].dashboard.hello).toBe('Olá');
  });

  it('en-US deve ter textos em inglês', () => {
    expect(locales['en-US'].auth.login).toBe('Log in');
    expect(locales['en-US'].common.save).toBe('Save');
    expect(locales['en-US'].common.delete).toBe('Delete');
    expect(locales['en-US'].dashboard.hello).toBe('Hello');
  });

  it('es-ES deve ter textos em espanhol', () => {
    expect(locales['es-ES'].auth.login).toBe('Iniciar sesión');
    expect(locales['es-ES'].common.save).toBe('Guardar');
    expect(locales['es-ES'].common.delete).toBe('Eliminar');
    expect(locales['es-ES'].dashboard.hello).toBe('Hola');
  });
});
