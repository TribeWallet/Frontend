// Formato das respostas do backend (ASP.NET serializa em camelCase).

export interface UsuarioResponse {
  usuarioToken: string;
  nome: string;
  sobrenome: string;
  email: string;
  username: string;
  imageUrl?: string | null;
  deletedAt: string | null;
}

export interface LoginResponse {
  usuarioResponseDto: UsuarioResponse;
  jwtToken: string;
}

export interface IntegranteResponse {
  integranteToken: string;
  usuario: UsuarioResponse;
  grupoToken: string;
  deletedAt: string | null;
}

export interface GrupoResponse {
  grupoToken: string;
  nome: string;
  descricao: string | null;
  deletedAt: string | null;
  integrantes: IntegranteResponse[];
  /** Vem vazio na listagem por usuário: use GET /api/compromissos/{grupoToken}. */
  compromissos: CompromissoResponse[];
}

export interface GrupoUsuarioIntegranteResponse {
  integranteToken: string;
  usuarioToken?: string;
  nome: string;
  sobrenome: string;
  email: string;
  imagemUrl: string | null;
  deletedAt: string | null;
}

export interface GrupoUsuarioCompromissoResponse {
  compromissoFinanceiroToken: string;
  titulo: string;
  imagemUrl: string;
  categoria: string | null;
  valorTotal: number;
  data: string;
  deletedAt: string | null;
}

export interface GrupoUsuarioResponse {
  grupoToken: string;
  nome: string;
  descricao: string | null;
  integrantesCount: number;
  compromissosCount: number;
  totalEmAberto: number;
  totalPago: number;
  deletedAt: string | null;
  integrantes: GrupoUsuarioIntegranteResponse[];
  compromissos: GrupoUsuarioCompromissoResponse[];
}

/** TipoDivisao do backend (Domain/Entities/Enums.cs). */
export const TipoDivisao = {
  igual: 1,
  porcentagem: 2,
  valorExato: 3,
  proporcional: 4,
} as const;

/** MetodoPagamento do backend (Domain/Entities/Enums.cs). */
export const MetodoPagamento = {
  pix: 1,
  dinheiro: 2,
  cartaoCredito: 3,
  cartaoDebito: 4,
  transferenciaBancaria: 5,
  boleto: 6,
} as const;

export interface PagamentoResponse {
  pagamentoToken: string;
  valor: number;
  data: string;
  comprovanteUrl: string | null;
  metodo: number;
}

/** Fatia de um compromisso atribuída a um integrante. */
export interface IntegranteCompromissoResumoResponse {
  integranteCompromissoToken: string;
  valorDevedor: number;
  valorPago: number;
  deletedAt: string | null;
  integrante: IntegranteResponse;
  pagamentos: PagamentoResponse[];
}

export interface CompromissoResponse {
  compromissoFinanceiroToken: string;
  titulo: string;
  valorTotal: number;
  data: string;
  tipoDivisao: number;
  imagem: string | null;
  categoria: string | null;
  deletedAt: string | null;
  grupo: GrupoResponse | null;
  participacoes: IntegranteCompromissoResumoResponse[];
}

export interface CompromissoUsuarioIntegranteResponse {
  integranteToken: string;
  usuarioToken: string;
  nome: string;
  sobrenome: string;
  email: string;
  imagemUrl: string | null;
  valorPago: number;
  valorDevedor: number;
  valorRestante: number;
  somaPagamentosPorMetodo: Record<string, number>;
  quitado: boolean;
  deletedAt: string | null;
}

export interface CompromissoUsuarioResponse {
  compromissoFinanceiroToken: string;
  grupoToken: string;
  titulo: string;
  imagem: string | null;
  situacaoPagamento: number;
  dataVencimento: string;
  diasParaVencimento: number;
  vencido: boolean;
  tipoDivisao: number;
  valorTotal: number;
  valorPagoTotal: number;
  valorRestanteTotal: number;
  progressoPagamentos: number;
  categoria: string | null;
  nomeGrupo: string;
  integrantesQuitadosCount: number;
  integrantesDevendoCount: number;
  integrantesTotalCount: number;
  integrantes: CompromissoUsuarioIntegranteResponse[];
  deletedAt: string | null;
}
