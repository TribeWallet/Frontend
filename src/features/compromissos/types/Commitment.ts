import type { TransactionStatus } from '../../../types/transactionStatus';
import type { Payment } from '../../pagamentos/types/Payment';

export type CommitmentStatus = TransactionStatus;

/** 'equal' = TipoDivisao.Igual, 'custom' = TipoDivisao.ValorExato. */
export type SplitMode = 'equal' | 'custom';

export interface CommitmentSplitEntry {
  /** integranteCompromissoToken: identifica a fatia no backend. */
  shareId: string;
  /** integranteToken: o vínculo usuário-grupo. */
  integranteToken: string;
  /** usuarioToken, o mesmo id usado em Group.members. */
  memberId: string;
  name: string;
  /** valorDevedor. */
  amount: number;
  /** Soma dos pagamentos registrados nesta fatia. */
  paidAmount: number;
  paid: boolean;
  payments: Payment[];
}

export interface Commitment {
  /** compromissoFinanceiroToken. */
  id: string;
  initials: string;
  avatarTone: 'blue' | 'teal' | 'indigo';
  /** titulo. */
  name: string;
  status: CommitmentStatus;
  groupId: string;
  groupName: string;
  category: string;
  /** Campo `data` do compromisso, em DD/MM/AAAA. */
  dueDate: string;
  /** Mesmo campo em ISO, para ordenação. */
  date: string;
  /** valorTotal. */
  amount: number;
  /** Campo `imagem`: URL da nota fiscal. */
  receiptUrl?: string;
  splitMode: SplitMode;
  splits: CommitmentSplitEntry[];
}

export interface CommitmentInput {
  name: string;
  groupId: string;
  category: string;
  amount: number;
  /** DD/MM/AAAA. */
  dueDate: string;
  splitMode: SplitMode;
  splits: { integranteToken: string; amount: number }[];
}
