import type { Commitment } from '../../compromissos/types/Commitment';
import type { Payment } from '../../pagamentos/types/Payment';
import type { NotificationItem } from '../types/Notification';

function parseDateBR(value?: string): Date | null {
  if (!value) return null;
  const [day, month, year] = value.split('/');
  if (!day || !month || !year) return null;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function daysUntil(value?: string): number | null {
  const parsed = parseDateBR(value);
  if (!parsed) return null;
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((parsed.getTime() - start.getTime()) / 86400000);
}

function formatDateBR(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

export function syncDueNotifications(
  commitments: Commitment[],
  payments: Payment[],
): NotificationItem[] {
  const generated: NotificationItem[] = [];
  const today = new Date();
  commitments.forEach((commitment) => {
    if (!commitment.dueDate) return;
    const days = daysUntil(commitment.dueDate);
    if (days === null) return;
    const remaining = commitment.amount - commitment.splits.filter((s) => s.paid).reduce((sum, s) => sum + s.amount, 0);
    const open = remaining > 0.01;
    if (days < 0 && open) {
      generated.push({
        id: `due-${commitment.id}`,
        type: 'overdue_commitment',
        title: `${commitment.name} venceu`,
        description: `Compromisso vencido em ${commitment.dueDate}. Saldo em aberto: R$ ${remaining.toFixed(2)}.`,
        group: commitment.groupName,
        time: `Venceu em ${commitment.dueDate}`,
        status: 'pending',
      });
    } else if (days >= 0 && days <= 3 && open) {
      const label = days === 0 ? 'vence hoje' : days === 1 ? 'vence amanhã' : `vence em ${days} dias`;
      generated.push({
        id: `due-soon-${commitment.id}`,
        type: 'overdue_commitment',
        title: `${commitment.name} ${label}`,
        description: `Faltam ${days} dia(s) para o vencimento de ${commitment.dueDate}.`,
        group: commitment.groupName,
        time: formatDateBR(today),
        status: 'pending',
      });
    }
  });
  payments.slice(0, 4).forEach((payment) => {
    generated.push({
      id: `pay-${payment.id}`,
      type: 'registered_payment',
      title: 'Pagamento registrado',
      description: `${payment.payerName} registrou ${payment.description} no valor de R$ ${payment.amount.toFixed(2)}.`,
      group: payment.groupName,
      time: formatDateBR(today),
      status: 'partial',
    });
  });
  return generated;
}
