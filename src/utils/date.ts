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
  const date = parseBRDate(value ?? '');
  if (!date) return null;
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
