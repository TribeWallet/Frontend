export function maskMoney(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const cents = Math.min(Number(digits), 99999999999);
  const full = cents.toString().padStart(3, '0');
  const reais = full.slice(0, -2).replace(/^0+(?=\d)/, '');
  const centavos = full.slice(-2);
  return `${reais},${centavos}`;
}

export function parseMoney(value: string): number {
  const normalized = value.replace(/\./g, '').replace(',', '.');
  return Number(normalized) || 0;
}

export function maskDateBR(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function maskNumber(value: string, maxLength = 2): string {
  return value.replace(/\D/g, '').slice(0, maxLength);
}
