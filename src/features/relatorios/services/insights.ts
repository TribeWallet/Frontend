import type { Commitment } from '../../compromissos/types/Commitment';
import type { Payment } from '../../pagamentos/types/Payment';

export interface FinancialInsight {
  punctuality: number;
  paidThisMonth: number;
  openThisMonth: number;
  topCategory: { label: string; total: number } | null;
  forecast: number;
  trend: number;
}

function withinThisMonth(date: string): boolean {
  const [day, month, year] = date.split('/');
  if (!day || !month || !year) return false;
  const now = new Date();
  return (
    Number(month) === now.getMonth() + 1 && Number(year) === now.getFullYear()
  );
}

export function computeInsights(
  commitments: Commitment[],
  payments: Payment[],
): FinancialInsight {
  const punctuality = commitments.length
    ? Math.round(
        (commitments.filter((c) => c.status === 'paid').length /
          commitments.length) *
          100,
      )
    : 0;

  const paidThisMonth = payments
    .filter((payment) => withinThisMonth(payment.date))
    .reduce((sum, payment) => sum + payment.amount, 0);

  const openThisMonth = commitments
    .filter((commitment) => commitment.status !== 'paid')
    .reduce((sum, commitment) => sum + commitment.amount, 0);

  const categoryMap = new Map<string, number>();
  payments.forEach((payment) => {
    categoryMap.set(
      payment.category,
      (categoryMap.get(payment.category) ?? 0) + payment.amount,
    );
  });
  const sortedCategories = Array.from(categoryMap.entries()).sort(
    (a, b) => b[1] - a[1],
  );
  const topCategory =
    sortedCategories.length > 0
      ? { label: sortedCategories[0][0], total: sortedCategories[0][1] }
      : null;

  const forecast = commitments
    .filter((commitment) => commitment.dueDate)
    .reduce((sum, commitment) => sum + commitment.amount, 0);

  const recent = payments.slice(0, 5).reduce((sum, p) => sum + p.amount, 0);
  const previous = payments.slice(5, 10).reduce((sum, p) => sum + p.amount, 0);
  const trend = previous > 0 ? Math.round(((recent - previous) / previous) * 100) : 0;

  return { punctuality, paidThisMonth, openThisMonth, topCategory, forecast, trend };
}
