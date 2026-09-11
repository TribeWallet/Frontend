import type { TransactionStatus } from '../../../types/transactionStatus';

export type CommitmentStatus = TransactionStatus;

export type SplitMode = 'equal' | 'custom';

export interface CommitmentSplitEntry {
  memberId: string;
  amount: number;
  paid: boolean;
}

export interface Commitment {
  id: string;
  initials: string;
  avatarTone: 'blue' | 'teal' | 'indigo';
  name: string;
  status: CommitmentStatus;
  description: string;
  groupId: string;
  groupName: string;
  category: string;
  dueDate?: string;
  amount: number;
  monthlyLabel?: string;
  progress?: number;
  splitMode: SplitMode;
  splits: CommitmentSplitEntry[];
  createdAt: string;
  updatedAt: string;
}
