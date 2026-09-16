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
}

export interface GrupoResponse {
  grupoToken: string;
  nome: string;
  descricao: string | null;
  deletedAt: string | null;
  integrantes: IntegranteResponse[];
}
