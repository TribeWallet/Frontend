import type { Language } from '../i18n';

/**
 * Categorias vêm do backend (tipicamente em português dos seeders).
 * Este mapa traduz nomes de categoria conhecidos para os 3 idiomas suportados.
 * Categorias não mapeadas são exibidas como vêm do backend.
 */
export const categoryTranslations: Record<string, Record<Language, string>> = {
  Hospedagem: {
    'pt-BR': 'Hospedagem',
    'en-US': 'Lodging',
    'es-ES': 'Alojamiento',
  },
  Transporte: {
    'pt-BR': 'Transporte',
    'en-US': 'Transportation',
    'es-ES': 'Transporte',
  },
  Moradia: {
    'pt-BR': 'Moradia',
    'en-US': 'Housing',
    'es-ES': 'Vivienda',
  },
  Mercado: {
    'pt-BR': 'Mercado',
    'en-US': 'Grocery',
    'es-ES': 'Supermercado',
  },
  Utilidades: {
    'pt-BR': 'Utilidades',
    'en-US': 'Utilities',
    'es-ES': 'Servicios públicos',
  },
  Alimentação: {
    'pt-BR': 'Alimentação',
    'en-US': 'Food',
    'es-ES': 'Alimentación',
  },
  Lazer: {
    'pt-BR': 'Lazer',
    'en-US': 'Leisure',
    'es-ES': 'Ocio',
  },
  Saúde: {
    'pt-BR': 'Saúde',
    'en-US': 'Health',
    'es-ES': 'Salud',
  },
  Educação: {
    'pt-BR': 'Educação',
    'en-US': 'Education',
    'es-ES': 'Educación',
  },
  Compras: {
    'pt-BR': 'Compras',
    'en-US': 'Shopping',
    'es-ES': 'Compras',
  },
  Salário: {
    'pt-BR': 'Salário',
    'en-US': 'Salary',
    'es-ES': 'Salario',
  },
  Outro: {
    'pt-BR': 'Outro',
    'en-US': 'Other',
    'es-ES': 'Otro',
  },
};

export function translateCategory(category: string, language: Language): string {
  const translation = categoryTranslations[category];
  if (!translation) return category;
  return translation[language] ?? category;
}
