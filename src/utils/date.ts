export function todayBR(): string {
  const today = new Date();
  return formatBR(today);
}

export function formatBR(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

export function parseBRDate(value: string): Date | null {
  const [day, month, year] = value.split('/');
  if (!day || !month || !year) return null;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function diffDays(value?: string): number | null {
  let date = parseBRDate(value ?? '');
  // Aceita também ISO (ex.: "2026-10-12T00:00:00Z") quando não está no formato DD/MM/AAAA.
  if (!date && value) date = new Date(value);
  if (!date || Number.isNaN(date.getTime())) return null;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return Math.round((date.getTime() - start.getTime()) / 86400000);
}

/** DateTime do backend (ISO) para o formato DD/MM/AAAA exibido no app. */
export function isoToBR(value: string | null | undefined): string {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return formatBR(parsed);
}

/**
 * Determina se um compromisso está vencido, de forma consistente em todo o app.
 * - Se já está pago, não considera vencido (mesmo que a data tenha passado).
 * - Usa diffDays da dueDate (DD/MM/AAAA) como fonte da verdade.
 * - Fallback para o campo `overdue` do backend quando diffDays não puder calcular.
 */
export function isCommitmentOverdue(commitment: {
  status: string;
  dueDate?: string | null;
  overdue?: boolean;
}): boolean {
  if (commitment.status === 'paid') return false;

  const days = commitment.dueDate ? diffDays(commitment.dueDate) : null;
  if (days !== null) return days < 0;

  return Boolean(commitment.overdue);
}

/**
 * DD/MM/AAAA digitado no app para o ISO em UTC que o backend espera (as colunas são
 * `timestamp with time zone`). A hora vai ao meio-dia para o fuso não mudar o dia.
 */
export function brToISO(value: string): string {
  const parsed = parseBRDate(value) ?? new Date();
  const atNoon = new Date(
    parsed.getFullYear(),
    parsed.getMonth(),
    parsed.getDate(),
    12,
    0,
    0,
  );
  return atNoon.toISOString();
}
