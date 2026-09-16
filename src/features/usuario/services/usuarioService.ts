import { apiClient } from '../../../services/api/apiClient';
import { endpoints } from '../../../config/api';
import type { UsuarioResponse } from '../../../types/ApiResponse';

export interface UpdateUsuarioInput {
  nome?: string;
  sobrenome?: string;
  username?: string;
  senha?: string;
}

export async function findUsuarioByEmail(email: string): Promise<UsuarioResponse | undefined> {
  const usuarios = await apiClient.get<UsuarioResponse[]>(endpoints.usuarios.list);
  const target = email.trim().toLowerCase();
  return usuarios.find(
    (usuario) => !usuario.deletedAt && usuario.email.toLowerCase() === target,
  );
}

export function updateUsuario(
  usuarioToken: string,
  input: UpdateUsuarioInput,
): Promise<UsuarioResponse> {
  return apiClient.put<UsuarioResponse>(endpoints.usuarios.byToken(usuarioToken), input);
}
