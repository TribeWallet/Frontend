import { apiClient } from '../../../services/api/apiClient';
import { endpoints } from '../../../config/api';
import { TipoDivisao } from '../../../types/ApiResponse';
import type {
  CompromissoResponse,
  CompromissoUsuarioResponse,
} from '../../../types/ApiResponse';
import type { TransactionStatus } from '../../../types/transactionStatus';
import type { AttachedFile } from '../../../types/file';
import { brToISO, isoToBR, formatBR, parseBRDate } from '../../../utils/date';
import { fullName, initialsFromName } from '../../../utils/formatters';
import { toPayment } from '../../pagamentos/services/pagamentoService';
import type {
  Commitment,
  CommitmentInput,
  CommitmentSplitEntry,
  CommitmentSummary,
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

export function toCommitmentSummary(dto: CompromissoUsuarioResponse): CommitmentSummary {
  const name = dto.titulo;
  return {
    id: dto.compromissoFinanceiroToken,
    initials: initialsFromName(name),
    imagem: dto.imagem,
    avatarTone: resolveTone(name),
    name,
    status: resolveStatus([{ amount: dto.valorTotal, paidAmount: dto.valorPagoTotal }]),
    groupId: dto.grupoToken,
    groupName: dto.nomeGrupo,
    category: dto.categoria ?? 'Outros',
    dueDate: isoToBR(dto.dataVencimento),
    date: dto.dataVencimento,
    amount: dto.valorTotal,
    paidAmount: dto.valorPagoTotal,
    remainingAmount: dto.valorRestanteTotal,
    progress: Math.round(dto.progressoPagamentos * 100),
    overdue: dto.vencido,
    splitMode: toSplitMode(dto.tipoDivisao),
  };
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
    imagem: dto.imagem,
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

export function getCompromisso(compromissoToken: string): Promise<CompromissoResponse> {
  return apiClient.get<CompromissoResponse>(
    endpoints.compromissos.byToken(compromissoToken),
  );
}

export async function listCompromissosByUsuario(
  usuarioToken: string,
): Promise<CommitmentSummary[]> {
  const compromissos = await apiClient.get<CompromissoUsuarioResponse[]>(
    endpoints.compromissos.byUsuario(usuarioToken),
  );
  return compromissos
    .filter((compromisso) => !compromisso.deletedAt)
    .map(toCommitmentSummary);
}

function toParticipacoesPayload(input: CommitmentInput) {
  return input.splits.map((split) => ({
    integranteToken: split.integranteToken,
    valorDevedor: split.amount,
    valorPago: 0,
  }));
}

function appendFormFile(form: FormData, field: string, file?: AttachedFile) {
  if (!file) return;
  form.append(field, { uri: file.uri, name: file.name, type: file.type } as never);
}

function splitAmountEqually(total: number, parts: number): number[] {
  if (parts <= 0) return [];
  const cents = Math.round(total * 100);
  const base = Math.floor(cents / parts);
  const remainder = cents - base * parts;
  return Array.from({ length: parts }, (_, index) => (base + (index < remainder ? 1 : 0)) / 100);
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date.getFullYear(), date.getMonth() + months, date.getDate());
  return result;
}

async function createSingleCompromisso(
  input: CommitmentInput,
  titulo: string,
  valorTotal: number,
  dueDateBR: string,
): Promise<CompromissoResponse> {
  const form = new FormData();
  form.append('Titulo', titulo);
  form.append('ValorTotal', String(valorTotal));
  form.append('Data', brToISO(dueDateBR));
  form.append('TipoDivisao', String(SPLIT_MODE_TO_API[input.splitMode]));
  form.append('Categoria', input.category);
  appendFormFile(form, 'Imagem', input.imagem);

  const created = await apiClient.postForm<CompromissoResponse>(
    endpoints.compromissos.byGrupo(input.groupId),
    form,
  );

  if (input.splits.length === 0) return created;

  return apiClient.post<CompromissoResponse>(
    endpoints.compromissos.participacoes(created.compromissoFinanceiroToken),
    toParticipacoesPayload(input),
  );
}

export async function createCompromisso(input: CommitmentInput): Promise<CompromissoResponse> {
  const parcelas = Math.max(1, Math.min(24, input.parcelas ?? 1));

  if (parcelas === 1) {
    return createSingleCompromisso(input, input.name, input.amount, input.dueDate);
  }

  const valores = splitAmountEqually(input.amount, parcelas);
  const baseDate = parseBRDate(input.dueDate) ?? new Date();

  let first: CompromissoResponse | null = null;
  for (let index = 0; index < parcelas; index++) {
    const fatias = splitAmountEqually(valores[index], input.splits.length);
    const parcelaInput: CommitmentInput = {
      ...input,
      splits: input.splits.map((split, splitIndex) => ({
        integranteToken: split.integranteToken,
        amount: fatias[splitIndex],
      })),
    };
    const created = await createSingleCompromisso(
      parcelaInput,
      `${input.name} (${index + 1}/${parcelas})`,
      valores[index],
      formatBR(addMonths(baseDate, index)),
    );
    if (!first) first = created;
  }

  return first as CompromissoResponse;
}

export async function updateCompromisso(
  compromissoToken: string,
  input: CommitmentInput,
): Promise<CompromissoResponse> {
  const form = new FormData();
  form.append('Titulo', input.name);
  form.append('ValorTotal', String(input.amount));
  form.append('Data', brToISO(input.dueDate));
  form.append('TipoDivisao', String(SPLIT_MODE_TO_API[input.splitMode]));
  form.append('Categoria', input.category);
  appendFormFile(form, 'Imagem', input.imagem);

  toParticipacoesPayload(input).forEach((participacao, index) => {
    form.append(`Participacoes[${index}].IntegranteToken`, participacao.integranteToken);
    form.append(`Participacoes[${index}].ValorDevedor`, String(participacao.valorDevedor));
    form.append(`Participacoes[${index}].ValorPago`, String(participacao.valorPago));
  });

  return apiClient.putForm<CompromissoResponse>(endpoints.compromissos.byToken(compromissoToken), form);
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
