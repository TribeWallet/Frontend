import { apiClient } from '../../../services/api/apiClient';
import { endpoints } from '../../../config/api';
import { TipoDivisao } from '../../../types/ApiResponse';
import type { CompromissoResponse } from '../../../types/ApiResponse';
import type { TransactionStatus } from '../../../types/transactionStatus';
import { brToISO, isoToBR } from '../../../utils/date';
import { fullName, initialsFromName } from '../../../utils/formatters';
import { toPayment } from '../../pagamentos/services/pagamentoService';
import type {
  Commitment,
  CommitmentInput,
  CommitmentSplitEntry,
  SplitMode,
} from '../types/Commitment';

const SPLIT_MODE_TO_API: Record<SplitMode, number> = {
  equal: TipoDivisao.igual,
  custom: TipoDivisao.valorExato,
};

/** Porcentagem e Proporcional ainda são rateados como Igual pelo backend. */
function toSplitMode(tipoDivisao: number): SplitMode {
  return tipoDivisao === TipoDivisao.valorExato ? 'custom' : 'equal';
}

const AVATAR_TONES = ['blue', 'teal', 'indigo'] as const;

/** Cor do avatar derivada do título, para o mesmo compromisso manter a mesma cor. */
function resolveTone(titulo: string): Commitment['avatarTone'] {
  const sum = Array.from(titulo).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_TONES[sum % AVATAR_TONES.length];
}

function resolveStatus(splits: { amount: number; paidAmount: number }[]): TransactionStatus {
  const total = splits.reduce((sum, split) => sum + split.amount, 0);
  const paid = splits.reduce((sum, split) => sum + split.paidAmount, 0);
  if (total > 0 && paid >= total - 0.01) return 'paid';
  if (paid > 0.01) return 'partial';
  return 'pending';
}

export interface CommitmentGroupInfo {
  id: string;
  name: string;
}

export function toCommitment(
  dto: CompromissoResponse,
  group: CommitmentGroupInfo,
): Commitment {
  const category = dto.categoria ?? 'Outros';
  const commitmentName = dto.titulo;

  // Primeiro as fatias sem os pagamentos: o status da fatia é o que o pagamento exibe.
  const shares = dto.participacoes
    .filter((participacao) => !participacao.deletedAt)
    .map((participacao) => {
      const usuario = participacao.integrante.usuario;
      const name = fullName(usuario.nome, usuario.sobrenome);
      const paidAmount = participacao.pagamentos.reduce(
        (sum, pagamento) => sum + pagamento.valor,
        0,
      );
      return { participacao, usuario, name, paidAmount };
    });

  const splits: CommitmentSplitEntry[] = shares.map(
    ({ participacao, usuario, name, paidAmount }) => {
      const amount = participacao.valorDevedor;
      const paid = amount > 0 && paidAmount >= amount - 0.01;
      const shareStatus: TransactionStatus = paid
        ? 'paid'
        : paidAmount > 0.01
          ? 'partial'
          : 'pending';
      return {
        shareId: participacao.integranteCompromissoToken,
        integranteToken: participacao.integrante.integranteToken,
        memberId: usuario.usuarioToken,
        name,
        amount,
        paidAmount,
        paid,
        payments: participacao.pagamentos.map((pagamento) =>
          toPayment(pagamento, {
            shareId: participacao.integranteCompromissoToken,
            commitmentId: dto.compromissoFinanceiroToken,
            commitmentName,
            groupId: group.id,
            groupName: group.name,
            category,
            payerId: usuario.usuarioToken,
            payerName: name,
            status: shareStatus,
          }),
        ),
      };
    },
  );

  return {
    id: dto.compromissoFinanceiroToken,
    initials: initialsFromName(commitmentName),
    avatarTone: resolveTone(commitmentName),
    name: commitmentName,
    status: resolveStatus(splits),
    groupId: group.id,
    groupName: group.name,
    category,
    dueDate: isoToBR(dto.data),
    date: dto.data,
    amount: dto.valorTotal,
    receiptUrl: dto.imagem ?? undefined,
    splitMode: toSplitMode(dto.tipoDivisao),
    splits,
  };
}

export async function listCompromissosByGrupo(
  grupoToken: string,
): Promise<CompromissoResponse[]> {
  const compromissos = await apiClient.get<CompromissoResponse[]>(
    `${endpoints.compromissos.byGrupo(grupoToken)}?deleted=false`,
  );
  // A exclusão é soft delete: o backend pode devolver registros já excluídos.
  return compromissos.filter((compromisso) => !compromisso.deletedAt);
}

function toParticipacoesPayload(input: CommitmentInput) {
  return input.splits.map((split) => ({
    integranteToken: split.integranteToken,
    valorDevedor: split.amount,
    valorPago: 0,
  }));
}

export function createCompromisso(input: CommitmentInput): Promise<CompromissoResponse> {
  return apiClient.post<CompromissoResponse>(
    endpoints.compromissos.byGrupo(input.groupId),
    {
      titulo: input.name,
      valorTotal: input.amount,
      data: brToISO(input.dueDate),
      tipoDivisao: SPLIT_MODE_TO_API[input.splitMode],
      categoria: input.category,
      participacoes: toParticipacoesPayload(input),
    },
  );
}

export function updateCompromisso(
  compromissoToken: string,
  input: CommitmentInput,
): Promise<CompromissoResponse> {
  return apiClient.put<CompromissoResponse>(
    endpoints.compromissos.byToken(compromissoToken),
    {
      titulo: input.name,
      valorTotal: input.amount,
      data: brToISO(input.dueDate),
      tipoDivisao: SPLIT_MODE_TO_API[input.splitMode],
      categoria: input.category,
      participacoes: toParticipacoesPayload(input),
    },
  );
}

export function deleteCompromisso(compromissoToken: string): Promise<void> {
  return apiClient.delete(endpoints.compromissos.byToken(compromissoToken));
}

/** Inclui integrantes do grupo numa divisão já existente. */
export function addParticipacoes(
  compromissoToken: string,
  participacoes: { integranteToken: string; amount: number }[],
): Promise<CompromissoResponse> {
  return apiClient.post<CompromissoResponse>(
    endpoints.compromissos.participacoes(compromissoToken),
    participacoes.map((participacao) => ({
      integranteToken: participacao.integranteToken,
      valorDevedor: participacao.amount,
      valorPago: 0,
    })),
  );
}

export function removeParticipacao(integranteCompromissoToken: string): Promise<void> {
  return apiClient.delete(
    endpoints.compromissos.participacao(integranteCompromissoToken),
  );
}
