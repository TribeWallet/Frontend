import { apiClient } from '../../../services/api/apiClient';
import { endpoints } from '../../../config/api';
import type { AttachedFile } from '../../../types/file';
import type { UsuarioResponse } from '../../../types/ApiResponse';

export interface UpdateUsuarioInput {
  nome?: string;
  sobrenome?: string;
  username?: string;
  senha?: string;
  imagem?: AttachedFile;
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
  const form = new FormData();
  if (input.nome !== undefined) form.append('Nome', input.nome);
  if (input.sobrenome !== undefined) form.append('Sobrenome', input.sobrenome);
  if (input.username !== undefined) form.append('Username', input.username);
  if (input.senha) form.append('Senha', input.senha);
  if (input.imagem) {
    form.append('Imagem', {
      uri: input.imagem.uri,
      name: input.imagem.name,
      type: input.imagem.type,
    } as never);
  }
  return apiClient.putForm<UsuarioResponse>(endpoints.usuarios.byToken(usuarioToken), form);
}

/** Exclusão da própria conta (soft delete no backend). */
export function deleteUsuario(usuarioToken: string): Promise<void> {
  return apiClient.delete(endpoints.usuarios.byToken(usuarioToken));
}
