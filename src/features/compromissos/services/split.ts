import type {
  Commitment,
  CommitmentSplitEntry,
  SplitMode,
} from '../types/Commitment';

export interface SplitComputation {
  mode: SplitMode;
  entries: { memberId: string; amount: number }[];
  total: number;
  balanced: boolean;
}

export function computeSplits(
  amount: number,
  members: { id: string }[],
  mode: SplitMode,
  customSplits: { memberId: string; amount: number }[] = [],
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
      memberId: member.id,
      amount: Number(((base + (index < remainder ? 1 : 0)) / 100).toFixed(2)),
    }));
    const total = entries.reduce((sum, e) => sum + e.amount, 0);
    return { mode, entries, total, balanced: Math.abs(total - safeAmount) < 0.01 };
  }
  const total = customSplits.reduce((sum, e) => sum + e.amount, 0);
  return {
    mode,
    entries: customSplits,
    total,
    balanced: Math.abs(total - safeAmount) < 0.01,
  };
}

export function summarizeCommitment(
  commitment: Commitment,
): { paid: number; remaining: number; progress: number } {
  const paid = commitment.splits
    .filter((split) => split.paid)
    .reduce((sum, split) => sum + split.amount, 0);
  const remaining = Math.max(0, commitment.amount - paid);
  const progress =
    commitment.amount > 0
      ? Math.min(100, Math.round((paid / commitment.amount) * 100))
      : 0;
  return { paid, remaining, progress };
}

export function applySplitPaid(
  splits: CommitmentSplitEntry[],
  memberId: string,
  paid: boolean,
): CommitmentSplitEntry[] {
  return splits.map((split) =>
    split.memberId === memberId ? { ...split, paid } : split,
  );
}
