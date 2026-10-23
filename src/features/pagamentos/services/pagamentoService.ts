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
  const form = new FormData();
  form.append('IntegranteCompromissoToken', draft.shareId);
  form.append('Valor', String(draft.amount));
  form.append('Data', brToISO(draft.date));
  form.append('Metodo', String(METHOD_TO_API[draft.method]));
  if (draft.comprovante) {
    form.append('Comprovante', {
      uri: draft.comprovante.uri,
      name: draft.comprovante.name,
      type: draft.comprovante.type,
    } as never);
  }
  return apiClient.postForm<PagamentoResponse>(endpoints.pagamentos.create, form);
}

export function updatePagamento(
  pagamentoToken: string,
  patch: PaymentPatch,
): Promise<PagamentoResponse> {
  const form = new FormData();
  if (patch.amount !== undefined) form.append('Valor', String(patch.amount));
  if (patch.date) form.append('Data', brToISO(patch.date));
  if (patch.method) form.append('Metodo', String(METHOD_TO_API[patch.method]));
  if (patch.comprovante) {
    form.append('Comprovante', {
      uri: patch.comprovante.uri,
      name: patch.comprovante.name,
      type: patch.comprovante.type,
    } as never);
  }
  return apiClient.putForm<PagamentoResponse>(endpoints.pagamentos.byToken(pagamentoToken), form);
}

export function deletePagamento(pagamentoToken: string): Promise<void> {
  return apiClient.delete(endpoints.pagamentos.byToken(pagamentoToken));
}
