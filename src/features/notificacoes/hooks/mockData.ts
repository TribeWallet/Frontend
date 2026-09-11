import type { NotificationItem } from '../types/Notification';

export const notificationsMock: NotificationItem[] = [
  {
    id: 'notif-overdue',
    type: 'overdue_commitment',
    title: 'Compromisso vencido',
    description: 'O compromisso Internet + TV venceu.',
    group: 'Internet + TV',
    time: 'Venceu recentemente',
    status: 'pending',
  },
  {
    id: 'notif-registered',
    type: 'registered_payment',
    title: 'Pagamento registrado',
    description: 'Ana Oliveira registrou um pagamento de R$ 700,00 no Aluguel Fevereiro.',
    group: 'Aluguel Fevereiro',
    time: 'Hoje',
    status: 'partial',
  },
  {
    id: 'notif-pending',
    type: 'pending_payment',
    title: 'Pagamento pendente',
    description: 'Maria Costa ainda possui pagamentos pendentes no grupo República Universitária.',
    group: 'República Universitária',
    time: 'Ontem',
    status: 'pending',
  },
];
