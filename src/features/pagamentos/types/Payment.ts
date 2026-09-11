import type { TransactionStatus } from '../../../types/transactionStatus';

export type PaymentMethod = 'pix' | 'card' | 'boleto' | 'other';

export type CardBrand = 'credit' | 'debit';

export type PaymentRecurrence = 'unique' | 'weekly' | 'monthly' | 'yearly';

export interface Payment {
  id: string;
  description: string;
  amount: number;
  groupId: string;
  groupName: string;
  commitmentId?: string;
  commitmentName?: string;
  payerId: string;
  payerName: string;
  category: string;
  method: PaymentMethod;
  cardBrand?: CardBrand;
  otherMethod?: string;
  recurrence: PaymentRecurrence;
  date: string;
  notes?: string;
  status: TransactionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentDraft {
  description: string;
  amount: number;
  groupId: string;
  groupName: string;
  commitmentId?: string;
  commitmentName?: string;
  payerId: string;
  payerName: string;
  category: string;
  method: PaymentMethod;
  cardBrand?: CardBrand;
  otherMethod?: string;
  recurrence: PaymentRecurrence;
  date: string;
  notes?: string;
  status?: TransactionStatus;
}

export interface PaymentGroupOption {
  id: string;
  label: string;
}

export interface PaymentCategoryOption {
  id: string;
  label: string;
}

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  pix: 'PIX',
  card: 'Cartão',
  boleto: 'Boleto',
  other: 'Outro',
};

export const paymentMethodFullLabels: Record<PaymentMethod, string> = {
  pix: 'PIX',
  card: 'Cartão',
  boleto: 'Boleto bancário',
  other: 'Outra forma',
};

export const cardBrandLabels: Record<CardBrand, string> = {
  credit: 'Crédito',
  debit: 'Débito',
};

export const paymentRecurrenceLabels: Record<PaymentRecurrence, string> = {
  unique: 'Única',
  weekly: 'Semanal',
  monthly: 'Mensal',
  yearly: 'Anual',
};
