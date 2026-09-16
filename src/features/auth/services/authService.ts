import { apiClient, ApiError } from '../../../services/api/apiClient';
import { endpoints } from '../../../config/api';
import { fullName, initialsFromName } from '../../../utils/formatters';
import type { LoginResponse, UsuarioResponse } from '../../../types/ApiResponse';
import type { AuthUser } from '../stores/authStore';
import type { LoginInput, RegisterInput } from '../types/Auth';

export function toAuthUser(usuario: UsuarioResponse): AuthUser {
  const name = fullName(usuario.nome, usuario.sobrenome);
  return {
    id: usuario.usuarioToken,
    name,
    firstName: usuario.nome,
    lastName: usuario.sobrenome,
    username: usuario.username,
    email: usuario.email,
    initials: initialsFromName(name),
    notificationCount: 0,
  };
}

export async function login(input: LoginInput): Promise<{ user: AuthUser; token: string }> {
  const response = await apiClient.post<LoginResponse>(endpoints.auth.login, input, {
    auth: false,
  });
  // O backend não bloqueia login de conta excluída (soft delete); o app bloqueia.
  if (response.usuarioResponseDto.deletedAt) {
    throw new ApiError('Esta conta foi excluída.', 401);
  }
  return { user: toAuthUser(response.usuarioResponseDto), token: response.jwtToken };
}

export async function register(input: RegisterInput): Promise<UsuarioResponse> {
  try {
    return await apiClient.post<UsuarioResponse>(endpoints.auth.register, input, {
      auth: false,
    });
  } catch (error) {
    // E-mail e username são únicos no banco; a violação chega como erro genérico do EF Core.
    if (error instanceof ApiError && error.status === 400 && error.message.includes('saving the entity')) {
      throw new ApiError('E-mail ou nome de usuário já cadastrado.', 400);
    }
    throw error;
  }
}
