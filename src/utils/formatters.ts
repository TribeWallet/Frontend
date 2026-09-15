/** Até duas iniciais a partir de um nome completo. */
export function initialsFromName(name: string): string {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .slice(0, 2)
      .join('') || 'NV'
  );
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
