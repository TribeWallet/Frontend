import { apiClient } from '../../../services/api/apiClient';
import { endpoints } from '../../../config/api';
import { isoToBR } from '../../../utils/date';
import type { NotificationItem, NotificationType } from '../types/Notification';

interface NotificacaoDto {
  notificacaoToken: string;
  tipo: number;
  mensagem: string;
  entidade: string;
  entidadeToken: string | null;
  origemNome: string | null;
  dataEnvio: string;
  lida: boolean;
}

/** Espelha o enum TipoNotificacao do backend. */
const TIPOS: Record<number, { type: NotificationType; title: string }> = {
  1: { type: 'group_invite', title: 'Grupo' },
  2: { type: 'new_commitment', title: 'Novo compromisso' },
  3: { type: 'registered_payment', title: 'Pagamento registrado' },
  4: { type: 'pending_charge', title: 'Cobrança pendente' },
  5: { type: 'settled_commitment', title: 'Compromisso quitado' },
  6: { type: 'commitment_changed', title: 'Compromisso alterado' },
};

function toNotification(dto: NotificacaoDto): NotificationItem {
  const tipo = TIPOS[dto.tipo] ?? { type: 'commitment_changed' as const, title: 'Notificação' };
  return {
    id: dto.notificacaoToken,
    type: tipo.type,
    title: tipo.title,
    description: dto.mensagem,
    origin: dto.origemNome,
    time: isoToBR(dto.dataEnvio),
    read: dto.lida,
  };
}

/** Sem push (FCM), o app descobre os avisos perguntando à API. */
export async function listNotificacoes(): Promise<NotificationItem[]> {
  const items = await apiClient.get<NotificacaoDto[]>(endpoints.notificacoes.list);
  return items.map(toNotification);
}

export async function countNaoLidas(): Promise<number> {
  const { naoLidas } = await apiClient.get<{ naoLidas: number }>(endpoints.notificacoes.unreadCount);
  return naoLidas;
}

export function marcarLida(token: string): Promise<void> {
  return apiClient.patch(endpoints.notificacoes.markRead(token));
}

export function marcarTodasLidas(): Promise<void> {
  return apiClient.patch(endpoints.notificacoes.markAllRead);
}

export function excluirNotificacao(token: string): Promise<void> {
  return apiClient.delete(endpoints.notificacoes.byToken(token));
}
