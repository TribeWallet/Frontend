export type TransactionStatus = 'paid' | 'partial' | 'pending';

export const statusPalette: Record<
  TransactionStatus,
  { background: string; color: string }
> = {
  paid: { background: '#E7F8F2', color: '#19B87F' },
  partial: { background: '#FFF6E2', color: '#E8A924' },
  pending: { background: '#EDF5FF', color: '#3089EF' },
};

export const statusLabel: Record<TransactionStatus, string> = {
  paid: 'Pago',
  partial: 'Pago Parcial',
  pending: 'Pendente',
};
