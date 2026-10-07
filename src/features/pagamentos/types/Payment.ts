import type { TransactionStatus } from '../../../types/transactionStatus';

/** Espelha o enum MetodoPagamento do backend. */
export type PaymentMethod =
  | 'pix'
  | 'dinheiro'
  | 'credito'
  | 'debito'
  | 'transferencia'
  | 'boleto';

export interface Payment {
  /** pagamentoToken. */
  id: string;
  amount: number;
  /** DD/MM/AAAA. */
  date: string;
  method: PaymentMethod;
  receiptUrl?: string;
  /** integranteCompromissoToken: a fatia do compromisso que este pagamento quita. */
  shareId: string;
  commitmentId: string;
  commitmentName: string;
  groupId: string;
  groupName: string;
  category: string;
  /** usuarioToken de quem pagou. */
  payerId: string;
  payerName: string;
  /** Situação da fatia quitada por este pagamento. */
  status: TransactionStatus;
}

/** O backend amarra todo pagamento a uma fatia (integranteCompromisso). */
export interface PaymentDraft {
  shareId: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  receiptBase64?: string;
}

export interface PaymentPatch {
  amount?: number;
  date?: string;
  method?: PaymentMethod;
  receiptBase64?: string;
}

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  pix: 'PIX',
  dinheiro: 'Dinheiro',
  credito: 'Crédito',
  debito: 'Débito',
  transferencia: 'Transferência',
  boleto: 'Boleto',
};

export const paymentMethodFullLabels: Record<PaymentMethod, string> = {
  pix: 'PIX',
  dinheiro: 'Dinheiro',
  credito: 'Cartão de crédito',
  debito: 'Cartão de débito',
  transferencia: 'Transferência bancária',
  boleto: 'Boleto bancário',
};
