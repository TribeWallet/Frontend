import { useQuery } from '@tanstack/react-query';

import {
  commitmentsMock,
} from '../../compromissos/hooks/mockData';
import {
  groupsMock,
} from '../../grupos/hooks/mockData';
import {
  paymentsMock,
} from '../../pagamentos/hooks/mockData';
import type { Commitment } from '../../compromissos/types/Commitment';
import type { Group } from '../../grupos/types/Group';
import type { Payment } from '../../pagamentos/types/Payment';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  overview: () => [...dashboardKeys.all, 'overview'] as const,
};

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
    trend?: { direction: 'up' | 'down'; text: string };
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
    weeklyPunctuality: ChartDatum[];
  };
  insights: DashboardInsight[];
}

function summarizeCommitments(commitments: Commitment[]) {
  const total = commitments.length;
  const paid = commitments.filter((c) => c.status === 'paid').length;
  const pending = commitments.filter((c) => c.status === 'pending').length;
  const partial = commitments.filter((c) => c.status === 'partial').length;
  const punctuality = total ? Math.round((paid / total) * 100) : 0;
  return { total, paid, pending, partial, punctuality };
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
  const buckets: { label: string; value: number }[] = [];
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const ref = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const month = ref.getMonth();
    const year = ref.getFullYear();
    const total = payments
      .filter((p) => {
        const parts = p.date.split('/');
        if (parts.length !== 3) return false;
        return Number(parts[1]) - 1 === month && Number(parts[2]) === year;
      })
      .reduce((sum, p) => sum + p.amount, 0);
    const label = ref.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    buckets.push({ label, value: Math.round(total) });
  }
  return buckets;
}

function computeMonthlyAverage(payments: Payment[]): number {
  const months = buildLast6Months(payments);
  if (!months.length) return 0;
  const total = months.reduce((sum, m) => sum + m.value, 0);
  return total / months.length;
}

function buildWeeklyPunctuality(_commitments: Commitment[]): ChartDatum[] {
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  return days.map((dayLabel) => ({
    label: dayLabel,
    value: Math.round(60 + Math.random() * 35),
  }));
}

export function buildDashboardData(
  groups: Group[],
  commitments: Commitment[],
  payments: Payment[],
): DashboardOverviewData {
  const summary = summarizeCommitments(commitments);
  const overdue = commitments.filter((c) => {
    if (!c.dueDate) return false;
    const [day, month, year] = c.dueDate.split('/');
    if (!day || !month || !year) return false;
    const due = new Date(Number(year), Number(month) - 1, Number(day));
    const now = new Date();
    const paidPart = c.splits.filter((s) => s.paid).reduce((s2, s) => s2 + s.amount, 0);
    return due.getTime() < now.getTime() && paidPart < c.amount;
  }).length;
  const dueSoon = commitments.filter((c) => {
    if (!c.dueDate) return false;
    const [day, month, year] = c.dueDate.split('/');
    if (!day || !month || !year) return false;
    const due = new Date(Number(year), Number(month) - 1, Number(day));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
    return diff >= 0 && diff <= 7;
  }).length;
  const pendingPayments = payments.filter((p) => p.status !== 'paid').length;

  const activeGroups = groups.filter(
    (g) => g.tags?.some((tag) => tag.label === 'Ativo'),
  ).length || groups.length;

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const monthlyAverage = computeMonthlyAverage(payments);
  const openTotal = commitments.reduce((sum, c) => {
    const paid = c.splits.filter((s) => s.paid).reduce((s2, s) => s2 + s.amount, 0);
    return sum + Math.max(0, c.amount - paid);
  }, 0);

  const stats = [
    {
      id: 'stat-groups',
      tone: 'blue' as const,
      label: 'Grupos ativos',
      value: String(activeGroups),
      meta: `${groups.length} no total`,
      trend: { direction: 'up' as const, text: '+1' },
    },
    {
      id: 'stat-due-soon',
      tone: 'yellow' as const,
      label: 'Vencendo em breve',
      value: String(dueSoon),
      meta: 'próximos 7 dias',
    },
    {
      id: 'stat-pending',
      tone: 'blue' as const,
      label: 'Pagamentos pendentes',
      value: String(pendingPayments),
      meta: 'aguardando',
    },
    {
      id: 'stat-punctuality',
      tone: 'green' as const,
      label: 'Taxa de pontualidade',
      value: `${summary.punctuality}%`,
      trend: { direction: summary.punctuality >= 80 ? ('up' as const) : ('down' as const), text: `${summary.punctuality >= 80 ? '+' : '-'}${Math.abs(summary.punctuality - 80)}%` },
    },
  ];

  const alert = overdue > 0
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
    initials: payment.payerName
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'PV',
    name: payment.description,
    group: payment.groupName,
    category: payment.category,
    date: payment.date,
    value: payment.amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }),
    status: payment.status,
  }));

  const upcoming = commitments
    .filter((c) => c.dueDate)
    .map((commitment) => {
      const [day, month, year] = (commitment.dueDate ?? '').split('/');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = day && month && year
        ? new Date(Number(year), Number(month) - 1, Number(day))
        : null;
      const diff = due ? Math.round((due.getTime() - today.getTime()) / 86400000) : 0;
      return {
        id: commitment.id,
        name: commitment.name,
        group: commitment.groupName,
        value: commitment.amount.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }),
        date: commitment.dueDate ?? '',
        danger: diff < 0,
      };
    })
    .sort((a, b) => (a.date > b.date ? 1 : -1))
    .slice(0, 4);

  const charts = {
    byCategory: sumBy(payments, (p) => p.category, (p) => p.amount).sort(
      (a, b) => b.value - a.value,
    ),
    byGroup: sumBy(payments, (p) => p.groupName, (p) => p.amount),
    byMethod: countBy(payments, (p) => p.method),
    last6Months: buildLast6Months(payments),
    topGroups: sumBy(payments, (p) => p.groupName, (p) => p.amount)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5),
    weeklyPunctuality: buildWeeklyPunctuality(commitments),
  };

  const insights: DashboardInsight[] = [
    {
      id: 'i-month',
      title: 'Média mensal de pagamentos',
      value: monthlyAverage.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }),
      meta: 'Últimos 6 meses',
    },
    {
      id: 'i-open',
      title: 'Total em aberto',
      value: openTotal.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }),
      meta: `${summary.pending + summary.partial} compromissos`,
    },
    {
      id: 'i-paid',
      title: 'Total pago no histórico',
      value: totalPaid.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }),
      meta: `${payments.length} pagamentos`,
    },
    {
      id: 'i-group',
      title: 'Grupo com mais gastos',
      value: charts.byGroup.sort((a, b) => b.value - a.value)[0]?.label ?? '—',
      meta: charts.byGroup.length
        ? `Total ${charts.byGroup[0].value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
        : 'Sem dados',
    },
  ];

  return {
    user: {
      initials: 'CS',
      name: 'Camila Santos',
      notificationCount: overdue + dueSoon,
    },
    stats,
    alert,
    transactions,
    upcoming,
    charts,
    insights,
  };
}

const dashboardDataMock = buildDashboardData(
  groupsMock,
  commitmentsMock,
  paymentsMock,
);

async function fetchDashboardOverview(): Promise<DashboardOverviewData> {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 250));
  return dashboardDataMock;
}

export function useDashboardOverview() {
  const query = useQuery({
    queryKey: dashboardKeys.overview(),
    queryFn: fetchDashboardOverview,
    staleTime: 1000 * 60,
  });

  return {
    data: query.data ?? dashboardDataMock,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
