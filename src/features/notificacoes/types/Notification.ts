import type { TransactionStatus } from '../../../types/transactionStatus';

export type NotificationStatus = TransactionStatus;

export type NotificationType =
  | 'overdue_commitment'
  | 'registered_payment'
  | 'pending_payment'
  | 'new_commitment';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  group: string;
  time: string;
  status?: TransactionStatus;
}
