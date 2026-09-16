import { useAuthStore } from '../../features/auth/stores/authStore';
import { useUserStore } from '../../features/usuario/stores/userStore';

export function getAuthToken(): string | null {
  return useAuthStore.getState().token;
}

/** Token expirado ou inválido: encerra a sessão para o app voltar ao login. */
export function handleUnauthorized(): void {
  useUserStore.getState().logout();
  useAuthStore.getState().logout();
}
