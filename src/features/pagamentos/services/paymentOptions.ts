import type {
  PaymentCategoryOption,
  PaymentGroupOption,
  PaymentMethod,
  CardBrand,
  PaymentRecurrence,
} from '../types/Payment';
import {
  cardBrandLabels,
  paymentMethodLabels,
  paymentRecurrenceLabels,
} from '../types/Payment';

export const paymentGroupsOptionsMock: PaymentGroupOption[] = [
  { id: 'rep-universitaria', label: 'República Universitária' },
  { id: 'viagem-rj', label: 'Viagem RJ - Carnaval' },
  { id: 'familia-silva', label: 'Família Silva' },
];

export const paymentCategoryOptionsMock: PaymentCategoryOption[] = [
  { id: 'aluguel', label: 'Aluguel' },
  { id: 'contas', label: 'Contas' },
  { id: 'mercado', label: 'Mercado' },
  { id: 'transporte', label: 'Transporte' },
  { id: 'lazer', label: 'Lazer' },
  { id: 'educacao', label: 'Educação' },
  { id: 'outros', label: 'Outros' },
];

export const paymentMethodsMock: { id: PaymentMethod; label: string }[] = [
  { id: 'pix', label: paymentMethodLabels.pix },
  { id: 'card', label: paymentMethodLabels.card },
  { id: 'boleto', label: paymentMethodLabels.boleto },
  { id: 'other', label: paymentMethodLabels.other },
];

export const paymentCardBrandsMock: { id: CardBrand; label: string }[] = [
  { id: 'credit', label: cardBrandLabels.credit },
  { id: 'debit', label: cardBrandLabels.debit },
];

export const paymentRecurrenceMock: { id: PaymentRecurrence; label: string }[] = (
  Object.entries(paymentRecurrenceLabels) as [PaymentRecurrence, string][]
).map(([id, label]) => ({ id, label }));
