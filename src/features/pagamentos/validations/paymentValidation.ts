import type { PaymentDraft } from '../types/Payment';

export interface PaymentValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof PaymentDraft, string>>;
}

export function validatePaymentDraft(
  draft: Partial<PaymentDraft>,
): PaymentValidationResult {
  const errors: PaymentValidationResult['errors'] = {};

  if (!draft.description || draft.description.trim().length < 3) {
    errors.description = 'Informe uma descrição';
  }

  if (
    draft.amount === undefined ||
    draft.amount === null ||
    Number.isNaN(draft.amount) ||
    draft.amount <= 0
  ) {
    errors.amount = 'Informe um valor válido';
  }

  if (!draft.groupId) {
    errors.groupId = 'Selecione um grupo';
  }

  if (!draft.category) {
    errors.category = 'Selecione uma categoria';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
