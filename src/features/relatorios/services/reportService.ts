import { apiClient } from '../../../services/api/apiClient';
import { endpoints } from '../../../config/api';

export interface ReportGroupResponse {
  grupoToken: string;
  nomeGrupo: string;
  totalPago: number;
}

export interface ReportCategoryResponse {
  categoria: string;
  valorPagoTotal: number;
}

export interface ReportMethodResponse {
  metodoPagamento: number;
  totalPago: number;
}

export interface OpenCommitmentResponse {
  nome: string;
  nomeGrupo: string;
  dataVencimento: string;
  valorEmAberto: number;
}

interface ReportResponseBase {
  tipo: number;
  dataHora: string;
  totalPago: number;
  totalDevido: number;
  totaisPagosPorCategorias: ReportCategoryResponse[];
  totaisPagosPorMetodos: ReportMethodResponse[];
  compromissosEmAberto: OpenCommitmentResponse[];
}

export interface UserReportResponse extends ReportResponseBase {
  nomeCompleto: string;
  grupos: ReportGroupResponse[];
}

export interface GroupReportResponse extends ReportResponseBase {
  nome: string;
}

export function getUserReport(usuarioToken: string): Promise<UserReportResponse> {
  return apiClient.get<UserReportResponse>(endpoints.relatorios.byUsuario(usuarioToken));
}

export function getGroupReport(
  usuarioToken: string,
  grupoToken: string,
): Promise<GroupReportResponse> {
  return apiClient.get<GroupReportResponse>(
    endpoints.relatorios.byGrupo(usuarioToken, grupoToken),
  );
}