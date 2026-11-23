/** Palavras que não devem gerar iniciais (preposições/artigos/símbolos). */
const IGNORE_WORDS = new Set([
  'de', 'da', 'do', 'das', 'dos',      // pt
  'del', 'la', 'las', 'los', 'el',     // es
  'e', 'y', 'and', 'of', 'the', 'a',   // en / conjunções
  '-', '–', '—', '/', '\\', '&', '+',  // símbolos
]);

/** Limpa uma parte removendo não-alfanuméricos e verifica se deve ser ignorada. */
function cleanPart(part: string): string | null {
  const cleaned = part.replace(/[^a-zA-ZÀ-ÿ0-9]/g, '').toLowerCase();
  if (!cleaned || IGNORE_WORDS.has(cleaned)) return null;
  return cleaned;
}

/** Até duas iniciais alfanuméricas a partir de um nome, ignorando preposições. */
export function initialsFromName(name: string): string {
  const parts = name
    .split(/\s+/)
    .filter(Boolean)
    .map(cleanPart)
    .filter((p): p is string => p !== null);

  if (parts.length === 0) return 'NV';

  // Se sobrou apenas uma parte, pega os dois primeiros caracteres alfanuméricos dela.
  if (parts.length === 1) {
    const alnum = parts[0].replace(/[^a-zA-ZÀ-ÿ0-9]/g, '');
    return alnum.slice(0, 2).toUpperCase() || 'NV';
  }

  // Senão pega a primeira letra da primeira e da segunda parte válida.
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function fullName(nome: string, sobrenome: string): string {
  return `${nome} ${sobrenome}`.trim();
}

/** O backend guarda nome e sobrenome separados: a primeira palavra vira nome, o resto sobrenome. */
export function splitFullName(name: string): { nome: string; sobrenome: string } {
  const [nome = '', ...rest] = name.trim().split(/\s+/);
  return { nome, sobrenome: rest.join(' ') };
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
