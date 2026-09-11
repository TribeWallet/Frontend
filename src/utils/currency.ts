export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function parseCurrency(value: string): number {
  const cleaned = value.replace(/\s/g, '').replace('R$', '');
  const normalized = cleaned.replace(/\./g, '').replace(',', '.');
  return Number(normalized) || 0;
}
