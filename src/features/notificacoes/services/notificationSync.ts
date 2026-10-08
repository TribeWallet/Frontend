import type { Commitment } from '../../compromissos/types/Commitment';
import type { Payment } from '../../pagamentos/types/Payment';
import { formatCurrency } from '../../../utils/currency';
import { diffDays } from '../../../utils/date';
import type { NotificationItem } from '../types/Notification';

/**
 * O backend tem a entidade Notificacao, mas nenhum endpoint que a exponha. Até lá, os
 * avisos saem dos compromissos e pagamentos reais que a API devolve.
 */
export function buildNotifications(
  commitments: Commitment[],
  payments: Payment[],
): NotificationItem[] {
  const items: NotificationItem[] = [];

  commitments.forEach((commitment) => {
    const days = diffDays(commitment.dueDate);
    if (days === null) return;
    const paid = commitment.splits.reduce((sum, split) => sum + split.paidAmount, 0);
    const remaining = commitment.amount - paid;
    if (remaining <= 0.01) return;

    if (days < 0) {
      items.push({
        id: `overdue-${commitment.id}`,
        type: 'overdue_commitment',
        title: `${commitment.name} venceu`,
        description: `Venceu em ${commitment.dueDate}. Em aberto: ${formatCurrency(remaining)}.`,
        group: commitment.groupName,
        time: commitment.dueDate,
        status: 'pending',
      });
    } else if (days <= 7) {
      const label =
        days === 0 ? 'vence hoje' : days === 1 ? 'vence amanhã' : `vence em ${days} dias`;
      items.push({
        id: `due-soon-${commitment.id}`,
        type: 'overdue_commitment',
        title: `${commitment.name} ${label}`,
        description: `Vencimento em ${commitment.dueDate}. Em aberto: ${formatCurrency(remaining)}.`,
        group: commitment.groupName,
        time: commitment.dueDate,
        status: 'pending',
      });
    }
  });

  payments.forEach((payment) => {
    items.push({
      id: `payment-${payment.id}`,
      type: 'registered_payment',
      title: 'Pagamento registrado',
      description: `${payment.payerName} registrou ${formatCurrency(payment.amount)} em ${payment.commitmentName}.`,
      group: payment.groupName,
      time: payment.date,
      status: payment.status,
    });
  });

  return items;
}
