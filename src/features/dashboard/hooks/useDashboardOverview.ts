import { useMemo } from 'react';

import {
  useAppCommitments,
  useAppGroups,
  useAppPayments,
} from '../../../contexts/AppContext';
import { useAuthStore } from '../../auth/stores/authStore';
import { parseBRDate } from '../../../utils/date';
import type { Commitment } from '../../compromissos/types/Commitment';
import type { Group } from '../../grupos/types/Group';
import type { Payment } from '../../pagamentos/types/Payment';

export interface ChartDatum {
  label: string;
  value: number;
}

export interface DashboardInsight {
  id: string;
  title: string;
  value: string;
  meta?: string;
}

export interface DashboardOverviewData {
  user: { initials: string; name: string; notificationCount: number };
  stats: {
    id: string;
    tone: 'blue' | 'yellow' | 'green';
    label: string;
    value: string;
    meta?: string;
  }[];
  alert: { id: string; title: string; description: string };
  transactions: {
    id: string;
    initials: string;
    name: string;
    group: string;
    category: string;
    date: string;
    value: string;
    status: 'paid' | 'partial' | 'pending';
  }[];
  upcoming: {
    id: string;
    name: string;
    group: string;
    value: string;
    date: string;
    danger: boolean;
  }[];
  charts: {
    byCategory: ChartDatum[];
    byGroup: ChartDatum[];
    byMethod: ChartDatum[];
    last6Months: ChartDatum[];
    topGroups: ChartDatum[];
  };
  insights: DashboardInsight[];
  totals: { paymentsCount: number; paymentsTotal: number; openTotal: number };
}

const currency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function initialsFor(name: string): string {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || '—'
  );
}

function countBy<T>(items: T[], get: (item: T) => string): ChartDatum[] {
  const map = new Map<string, number>();
  items.forEach((item) => {
    const key = get(item);
    map.set(key, (map.get(key) ?? 0) + 1);
  });
  return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
}

function sumBy<T>(items: T[], get: (item: T) => string, value: (item: T) => number): ChartDatum[] {
  const map = new Map<string, number>();
  items.forEach((item) => {
    const key = get(item);
    map.set(key, (map.get(key) ?? 0) + value(item));
  });
  return Array.from(map.entries()).map(([label, total]) => ({ label, value: total }));
}

function buildLast6Months(payments: Payment[]): ChartDatum[] {
  const buckets: ChartDatum[] = [];
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const ref = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const total = payments
      .filter((payment) => {
        const date = parseBRDate(payment.date);
        return (
          date !== null &&
          date.getMonth() === ref.getMonth() &&
          date.getFullYear() === ref.getFullYear()
        );
      })
      .reduce((sum, payment) => sum + payment.amount, 0);
    buckets.push({
      label: ref.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
      value: Math.round(total),
    });
  }
  return buckets;
}

function daysToDue(commitment: Commitment): number | null {
  const due = parseBRDate(commitment.dueDate);
  if (!due) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / 86400000);
}

function remainingOf(commitment: Commitment): number {
  const paid = commitment.splits.reduce((sum, split) => sum + split.paidAmount, 0);
  return Math.max(0, commitment.amount - paid);
}

export function buildDashboardData(
  groups: Group[],
  commitments: Commitment[],
  payments: Payment[],
): DashboardOverviewData {
  const settled = commitments.filter((commitment) => commitment.status === 'paid').length;
  const punctuality = commitments.length
    ? Math.round((settled / commitments.length) * 100)
    : 0;

  const overdue = commitments.filter((commitment) => {
    const days = daysToDue(commitment);
    return days !== null && days < 0 && remainingOf(commitment) > 0.01;
  }).length;

  const dueSoon = commitments.filter((commitment) => {
    const days = daysToDue(commitment);
    return days !== null && days >= 0 && days <= 7 && remainingOf(commitment) > 0.01;
  }).length;

  const openCommitments = commitments.filter(
    (commitment) => commitment.status !== 'paid',
  ).length;

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const openTotal = commitments.reduce((sum, commitment) => sum + remainingOf(commitment), 0);
  const months = buildLast6Months(payments);
  const monthlyAverage = months.length
    ? months.reduce((sum, month) => sum + month.value, 0) / months.length
    : 0;

  const stats = [
    {
      id: 'stat-groups',
      tone: 'blue' as const,
      label: 'Grupos',
      value: String(groups.length),
      meta: groups.length === 1 ? 'grupo ativo' : 'grupos ativos',
    },
    {
      id: 'stat-due-soon',
      tone: 'yellow' as const,
      label: 'Vencendo em breve',
      value: String(dueSoon),
      meta: 'próximos 7 dias',
    },
    {
      id: 'stat-open',
      tone: 'blue' as const,
      label: 'Compromissos em aberto',
      value: String(openCommitments),
      meta: currency(openTotal),
    },
    {
      id: 'stat-punctuality',
      tone: 'green' as const,
      label: 'Compromissos quitados',
      value: `${punctuality}%`,
      meta: `${settled} de ${commitments.length}`,
    },
  ];

  const alert =
    overdue > 0
      ? {
          id: 'alert-overdue',
          title: `${overdue} compromisso${overdue === 1 ? '' : 's'} vencido${overdue === 1 ? '' : 's'}`,
          description: 'Regularize para evitar pendências no grupo.',
        }
      : {
          id: 'alert-ok',
          title: 'Tudo em dia',
          description: 'Você não possui compromissos vencidos.',
        };

  const transactions = payments.slice(0, 5).map((payment) => ({
    id: payment.id,
    initials: initialsFor(payment.payerName),
    name: payment.commitmentName,
    group: payment.groupName,
    category: payment.category,
    date: payment.date,
    value: currency(payment.amount),
    status: payment.status,
  }));

  const upcoming = commitments
    .filter((commitment) => remainingOf(commitment) > 0.01)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4)
    .map((commitment) => {
      const days = daysToDue(commitment);
      return {
        id: commitment.id,
        name: commitment.name,
        group: commitment.groupName,
        value: currency(commitment.amount),
        date: commitment.dueDate,
        danger: days !== null && days < 0,
      };
    });

  const byGroup = sumBy(payments, (payment) => payment.groupName, (payment) => payment.amount);

  const charts = {
    byCategory: sumBy(payments, (payment) => payment.category, (payment) => payment.amount).sort(
      (a, b) => b.value - a.value,
    ),
    byGroup,
    byMethod: countBy(payments, (payment) => payment.method),
    last6Months: months,
    topGroups: [...byGroup].sort((a, b) => b.value - a.value).slice(0, 5),
  };

  const topGroup = charts.topGroups[0];

  const insights: DashboardInsight[] = [
    {
      id: 'i-month',
      title: 'Média mensal de pagamentos',
      value: currency(monthlyAverage),
      meta: 'Últimos 6 meses',
    },
    {
      id: 'i-open',
      title: 'Total em aberto',
      value: currency(openTotal),
      meta: `${openCommitments} compromissos`,
    },
    {
      id: 'i-paid',
      title: 'Total pago no histórico',
      value: currency(totalPaid),
      meta: `${payments.length} pagamentos`,
    },
    {
      id: 'i-group',
      title: 'Grupo com mais gastos',
      value: topGroup?.label ?? '—',
      meta: topGroup ? `Total ${currency(topGroup.value)}` : 'Sem dados',
    },
  ];

  return {
    totals: { paymentsCount: payments.length, paymentsTotal: totalPaid, openTotal },
    user: { initials: '', name: '', notificationCount: overdue + dueSoon },
    stats,
    alert,
    transactions,
    upcoming,
    charts,
    insights,
  };
}

export function useDashboardOverview() {
  const { groups, groupsLoading, groupsError, refetchGroups } = useAppGroups();
  const { commitments, commitmentsLoading, commitmentsError } = useAppCommitments();
  const { payments } = useAppPayments();
  const user = useAuthStore((state) => state.user);

  const data = useMemo(() => {
    const overview = buildDashboardData(groups, commitments, payments);
    return {
      ...overview,
      user: {
        ...overview.user,
        initials: user?.initials ?? '',
        name: user?.name ?? '',
      },
    };
  }, [groups, commitments, payments, user]);

  return {
    data,
    isLoading: groupsLoading || commitmentsLoading,
    isError: Boolean(groupsError || commitmentsError),
    error: groupsError ?? commitmentsError,
    refetch: refetchGroups,
  };
}
