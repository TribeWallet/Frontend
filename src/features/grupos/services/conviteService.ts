import { apiClient } from '../../../services/api/apiClient';
import { endpoints } from '../../../config/api';

export interface ConviteResponse {
  conviteToken: string;
  link: string;
  grupoToken: string;
  emailConvidado: string | null;
  expiraEm: string;
  emailEnviado: boolean;
}

export interface ConviteInfo {
  grupoNome: string;
  grupoDescricao: string | null;
  convidadoPor: string;
  emailConvidado: string | null;
  expiraEm: string;
}

/** Gera o link de convite do grupo. Com e-mail, o convite fica restrito a ele e o link é enviado por e-mail. */
export function createConvite(grupoToken: string, email?: string): Promise<ConviteResponse> {
  return apiClient.post<ConviteResponse>(
    endpoints.grupos.convites(grupoToken),
    email ? { email } : {},
  );
}

export function getConvite(conviteToken: string): Promise<ConviteInfo> {
  return apiClient.get<ConviteInfo>(endpoints.convites.byToken(conviteToken));
}

export function aceitarConvite(conviteToken: string): Promise<{ grupoToken: string }> {
  return apiClient.post<{ grupoToken: string }>(endpoints.convites.aceitar(conviteToken));
}

/** Extrai o token de links no formato tribewallet://convite/{token}. */
export function parseConviteUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = /^tribewallet:\/\/convite\/([A-Za-z0-9]+)\/?(?:[?#].*)?$/.exec(url.trim());
  return match ? match[1] : null;
}
