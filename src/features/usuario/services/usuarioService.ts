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

/** Busca por nome: o backend casa pelo primeiro nome do usuário. */
export async function searchUsuariosByNome(nome: string): Promise<UsuarioResponse[]> {
  const usuarios = await apiClient.get<UsuarioResponse[]>(
    endpoints.usuarios.byNome(nome.trim()),
  );
  return usuarios.filter((usuario) => !usuario.deletedAt);
}

export function updateUsuario(
  usuarioToken: string,
  input: UpdateUsuarioInput,
): Promise<UsuarioResponse> {
  return apiClient.put<UsuarioResponse>(endpoints.usuarios.byToken(usuarioToken), input);
}

/** Exclusão da própria conta (soft delete no backend). */
export function deleteUsuario(usuarioToken: string): Promise<void> {
  return apiClient.delete(endpoints.usuarios.byToken(usuarioToken));
}
