import { apiClient } from '../../../services/api/apiClient';
import { endpoints } from '../../../config/api';
import { MetodoPagamento } from '../../../types/ApiResponse';
import type { PagamentoResponse } from '../../../types/ApiResponse';
import type { TransactionStatus } from '../../../types/transactionStatus';
import { brToISO, isoToBR } from '../../../utils/date';
import type { Payment, PaymentDraft, PaymentMethod, PaymentPatch } from '../types/Payment';

const METHOD_TO_API: Record<PaymentMethod, number> = {
  pix: MetodoPagamento.pix,
  dinheiro: MetodoPagamento.dinheiro,
  credito: MetodoPagamento.cartaoCredito,
  debito: MetodoPagamento.cartaoDebito,
  transferencia: MetodoPagamento.transferenciaBancaria,
  boleto: MetodoPagamento.boleto,
};

const METHOD_FROM_API: Record<number, PaymentMethod> = {
  [MetodoPagamento.pix]: 'pix',
  [MetodoPagamento.dinheiro]: 'dinheiro',
  [MetodoPagamento.cartaoCredito]: 'credito',
  [MetodoPagamento.cartaoDebito]: 'debito',
  [MetodoPagamento.transferenciaBancaria]: 'transferencia',
  [MetodoPagamento.boleto]: 'boleto',
};

export function toPaymentMethod(metodo: number): PaymentMethod {
  return METHOD_FROM_API[metodo] ?? 'pix';
}

/** Dados do compromisso/fatia que o pagamento isolado não carrega. */
export interface PaymentContext {
  shareId: string;
  commitmentId: string;
  commitmentName: string;
  groupId: string;
  groupName: string;
  category: string;
  payerId: string;
  payerName: string;
  status: TransactionStatus;
}

export function toPayment(dto: PagamentoResponse, context: PaymentContext): Payment {
  return {
    id: dto.pagamentoToken,
    amount: dto.valor,
    date: isoToBR(dto.data),
    method: toPaymentMethod(dto.metodo),
    receiptUrl: dto.comprovanteUrl ?? undefined,
    ...context,
  };
}

export function createPagamento(draft: PaymentDraft): Promise<PagamentoResponse> {
  return apiClient.post<PagamentoResponse>(endpoints.pagamentos.create, {
    integranteCompromissoToken: draft.shareId,
    valor: draft.amount,
    data: brToISO(draft.date),
    comprovanteBase64: draft.receiptBase64 ?? null,
    metodo: METHOD_TO_API[draft.method],
  });
}

export function updatePagamento(
  pagamentoToken: string,
  patch: PaymentPatch,
): Promise<PagamentoResponse> {
  return apiClient.put<PagamentoResponse>(endpoints.pagamentos.byToken(pagamentoToken), {
    valor: patch.amount ?? null,
    data: patch.date ? brToISO(patch.date) : null,
    comprovanteBase64: patch.receiptBase64 ?? null,
    metodo: patch.method ? METHOD_TO_API[patch.method] : null,
  });
}

export function deletePagamento(pagamentoToken: string): Promise<void> {
  return apiClient.delete(endpoints.pagamentos.byToken(pagamentoToken));
}
