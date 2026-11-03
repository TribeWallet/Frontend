import type { Commitment } from '../../compromissos/types/Commitment';
import type { Group } from '../../grupos/types/Group';
import type { Payment } from '../../pagamentos/types/Payment';
import { paymentMethodLabels } from '../../pagamentos/types/Payment';

export interface ReportSummary {
  totalPaid: number;
  totalOpen: number;
  commitmentsCount: number;
  paymentsCount: number;
  groupsCount: number;
  byCategory: { label: string; total: number }[];
  byGroup: { groupName: string; total: number }[];
  byMethod: { label: string; total: number }[];
  upcoming: { name: string; dueDate: string; amount: number; groupName: string }[];
}

function sumInto(map: Map<string, number>, key: string, value: number) {
  map.set(key, (map.get(key) ?? 0) + value);
}

export function buildReport(
  groups: Group[],
  commitments: Commitment[],
  payments: Payment[],
  usuarioToken: string,
): ReportSummary {
  const userCommitments = commitments.filter((commitment) =>
    commitment.splits.some((split) => split.memberId === usuarioToken),
  );
  const userPayments = payments.filter((payment) => payment.payerId === usuarioToken);

  const totalPaid = userPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalOpen = userCommitments.reduce((sum, commitment) => {
    const userSplit = commitment.splits.find((split) => split.memberId === usuarioToken);
    if (!userSplit) return sum;
    return sum + Math.max(0, userSplit.amount - userSplit.paidAmount);
  }, 0);

  const categoryMap = new Map<string, number>();
  const groupMap = new Map<string, number>();
  const methodMap = new Map<string, number>();
  userPayments.forEach((payment) => {
    sumInto(categoryMap, payment.category, payment.amount);
    sumInto(groupMap, payment.groupName, payment.amount);
    sumInto(methodMap, paymentMethodLabels[payment.method], payment.amount);
  });

  const upcoming = userCommitments
    .flatMap((commitment) => {
      const userSplit = commitment.splits.find((split) => split.memberId === usuarioToken);
      if (!userSplit) return [];
      const remaining = Math.max(0, userSplit.amount - userSplit.paidAmount);
      return remaining > 0.01 ? [{ commitment, remaining }] : [];
    })
    .sort((a, b) => a.commitment.date.localeCompare(b.commitment.date))
    .slice(0, 5)
    .map(({ commitment, remaining }) => ({
      name: commitment.name,
      dueDate: commitment.dueDate,
      amount: remaining,
      groupName: commitment.groupName,
    }));

  return {
    totalPaid,
    totalOpen,
    commitmentsCount: userCommitments.length,
    paymentsCount: userPayments.length,
    groupsCount: groups.length,
    byCategory: Array.from(categoryMap.entries())
      .map(([label, total]) => ({ label, total }))
      .sort((a, b) => b.total - a.total),
    byGroup: Array.from(groupMap.entries())
      .map(([groupName, total]) => ({ groupName, total }))
      .sort((a, b) => b.total - a.total),
    byMethod: Array.from(methodMap.entries())
      .map(([label, total]) => ({ label, total }))
      .sort((a, b) => b.total - a.total),
    upcoming,
  };
}

export function reportToMarkdown(summary: ReportSummary): string {
  const today = new Date().toLocaleDateString('pt-BR');
  let md = `# Relatório Financeiro - TribeWallet\n\nGerado em ${today}\n\n`;
  md += `## Resumo Geral\n\n`;
  md += `- Total pago: R$ ${summary.totalPaid.toFixed(2)}\n`;
  md += `- Total em aberto: R$ ${summary.totalOpen.toFixed(2)}\n`;
  md += `- Grupos: ${summary.groupsCount}\n`;
  md += `- Compromissos: ${summary.commitmentsCount}\n`;
  md += `- Pagamentos: ${summary.paymentsCount}\n\n`;

  md += `## Pagamentos por Categoria\n\n`;
  summary.byCategory.forEach(({ label, total }) => {
    md += `- ${label}: R$ ${total.toFixed(2)}\n`;
  });

  md += `\n## Pagamentos por Grupo\n\n`;
  summary.byGroup.forEach(({ groupName, total }) => {
    md += `- ${groupName}: R$ ${total.toFixed(2)}\n`;
  });

  md += `\n## Pagamentos por Forma\n\n`;
  summary.byMethod.forEach(({ label, total }) => {
    md += `- ${label}: R$ ${total.toFixed(2)}\n`;
  });

  md += `\n## Compromissos em aberto\n\n`;
  summary.upcoming.forEach(({ name, dueDate, amount, groupName }) => {
    md += `- ${name} (${groupName}) - ${dueDate} - R$ ${amount.toFixed(2)}\n`;
  });
  return md;
}

export function reportToText(summary: ReportSummary): string {
  return reportToMarkdown(summary);
}

export function reportToHtml(summary: ReportSummary): string {
  const today = new Date().toLocaleDateString('pt-BR');
  const rows = (entries: { label: string; total: number }[]) =>
    entries
      .map(({ label, total }) => `<tr><td>${label}</td><td>R$ ${total.toFixed(2)}</td></tr>`)
      .join('');

  let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Relatório TribeWallet</title>`;
  html += `<style>body{font-family:-apple-system,Segoe UI,sans-serif;color:#171717;background:#fff;padding:24px;}h1{color:#0071DF;}table{width:100%;border-collapse:collapse;margin-bottom:24px;}th,td{border:1px solid #DFE4E7;padding:8px;text-align:left;}th{background:#E8F1FF;color:#0071DF;}</style></head><body>`;
  html += `<h1>Relatório Financeiro</h1><p>Gerado em ${today}</p>`;
  html += `<h2>Resumo Geral</h2>`;
  html += `<p>Total pago: <strong>R$ ${summary.totalPaid.toFixed(2)}</strong></p>`;
  html += `<p>Total em aberto: <strong>R$ ${summary.totalOpen.toFixed(2)}</strong></p>`;
  html += `<p>Grupos: ${summary.groupsCount} • Compromissos: ${summary.commitmentsCount} • Pagamentos: ${summary.paymentsCount}</p>`;
  html += `<h2>Por Categoria</h2><table><thead><tr><th>Categoria</th><th>Total</th></tr></thead><tbody>${rows(summary.byCategory)}</tbody></table>`;
  html += `<h2>Por Grupo</h2><table><thead><tr><th>Grupo</th><th>Total</th></tr></thead><tbody>${rows(
    summary.byGroup.map(({ groupName, total }) => ({ label: groupName, total })),
  )}</tbody></table>`;
  html += `<h2>Por Forma de Pagamento</h2><table><thead><tr><th>Forma</th><th>Total</th></tr></thead><tbody>${rows(summary.byMethod)}</tbody></table>`;
  html += `<h2>Compromissos em aberto</h2><table><thead><tr><th>Compromisso</th><th>Grupo</th><th>Vencimento</th><th>Valor</th></tr></thead><tbody>`;
  summary.upcoming.forEach(({ name, dueDate, amount, groupName }) => {
    html += `<tr><td>${name}</td><td>${groupName}</td><td>${dueDate}</td><td>R$ ${amount.toFixed(2)}</td></tr>`;
  });
  html += `</tbody></table></body></html>`;
  return html;
}
