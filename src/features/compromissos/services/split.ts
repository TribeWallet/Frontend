import type { Commitment, SplitMode } from '../types/Commitment';

export interface SplitComputation {
  mode: SplitMode;
  entries: { integranteToken: string; amount: number }[];
  total: number;
  balanced: boolean;
}

/**
 * No modo igual o backend recalcula valorTotal/participantes; o cálculo aqui serve
 * para a prévia na tela e para o modo personalizado, que o backend respeita.
 */
export function computeSplits(
  amount: number,
  members: { integranteToken: string }[],
  mode: SplitMode,
  customSplits: { integranteToken: string; amount: number }[] = [],
): SplitComputation {
  const safeAmount = Math.max(0, Number(amount) || 0);
  if (members.length === 0) {
    return { mode, entries: [], total: 0, balanced: false };
  }
  if (mode === 'equal') {
    const cents = Math.round(safeAmount * 100);
    const base = Math.floor(cents / members.length);
    const remainder = cents - base * members.length;
    const entries = members.map((member, index) => ({
      integranteToken: member.integranteToken,
      amount: Number(((base + (index < remainder ? 1 : 0)) / 100).toFixed(2)),
    }));
    const total = entries.reduce((sum, entry) => sum + entry.amount, 0);
    return { mode, entries, total, balanced: Math.abs(total - safeAmount) < 0.01 };
  }
  const entries = members.map((member) => ({
    integranteToken: member.integranteToken,
    amount:
      customSplits.find((split) => split.integranteToken === member.integranteToken)?.amount ?? 0,
  }));
  const total = entries.reduce((sum, entry) => sum + entry.amount, 0);
  return { mode, entries, total, balanced: Math.abs(total - safeAmount) < 0.01 };
}

export function summarizeCommitment(
  commitment: Commitment,
): { paid: number; remaining: number; progress: number } {
  const paid = commitment.splits.reduce((sum, split) => sum + split.paidAmount, 0);
  const remaining = Math.max(0, commitment.amount - paid);
  const progress =
    commitment.amount > 0
      ? Math.min(100, Math.round((paid / commitment.amount) * 100))
      : 0;
  return { paid, remaining, progress };
}

/** Todos os pagamentos de um compromisso, achatados a partir das fatias. */
export function commitmentPayments(commitment: Commitment) {
  return commitment.splits.flatMap((split) => split.payments);
}
