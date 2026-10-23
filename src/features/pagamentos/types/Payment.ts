import type { TransactionStatus } from '../../../types/transactionStatus';
import type { AttachedFile } from '../../../types/file';

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

export interface PaymentDraft {
  shareId: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  comprovante?: AttachedFile;
}

export interface PaymentPatch {
  amount?: number;
  date?: string;
  method?: PaymentMethod;
  comprovante?: AttachedFile;
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
