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
