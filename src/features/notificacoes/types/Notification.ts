export type NotificationType =
  | 'group_invite'
  | 'new_commitment'
  | 'registered_payment'
  | 'pending_charge'
  | 'settled_commitment'
  | 'commitment_changed';

export interface NotificationItem {
  /** notificacaoToken devolvido pela API. */
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  /** Quem gerou o aviso; nulo quando veio do sistema. */
  origin: string | null;
  time: string;
  read: boolean;
}
