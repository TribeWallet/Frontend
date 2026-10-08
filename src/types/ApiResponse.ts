// Formato das respostas do backend (ASP.NET serializa em camelCase).

export interface UsuarioResponse {
  usuarioToken: string;
  nome: string;
  sobrenome: string;
  email: string;
  username: string;
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
