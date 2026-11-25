/**
 * Testes do authStore (Zustand)
 *
 * Verifica:
 * 1. Estado inicial (não autenticado)
 * 2. Login define usuário e token
 * 3. Logout limpa tudo
 * 4. updateUser aplica patches parciais
 */

import { useAuthStore } from '../../src/features/auth/stores/authStore';

describe('authStore', () => {
  beforeEach(() => {
    // Reset do store para cada teste
    useAuthStore.setState({
      isAuthenticated: false,
      token: null,
      user: null,
    });
  });

  it('deve ter estado inicial não autenticado', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });

  it('deve fazer login e definir usuário + token', () => {
    const user = {
      id: 'user_1',
      name: 'João Silva',
      firstName: 'João',
      lastName: 'Silva',
      username: 'joaosilva',
      email: 'joao@teste.com',
      imageUrl: null,
      initials: 'JS',
      notificationCount: 0,
    };
    const token = 'jwt_token_abc123';

    useAuthStore.getState().login(user, token);

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe(token);
    expect(state.user).toEqual(user);
  });

  it('deve fazer logout e limpar estado', () => {
    // Primeiro faz login
    useAuthStore.getState().login(
      {
        id: 'user_1',
        name: 'João Silva',
        firstName: 'João',
        lastName: 'Silva',
        username: 'joaosilva',
        email: 'joao@teste.com',
        imageUrl: null,
        initials: 'JS',
        notificationCount: 0,
      },
      'token_abc',
    );

    // Depois faz logout
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });

  it('deve atualizar usuário parcialmente com updateUser', () => {
    useAuthStore.getState().login(
      {
        id: 'user_1',
        name: 'João Silva',
        firstName: 'João',
        lastName: 'Silva',
        username: 'joaosilva',
        email: 'joao@teste.com',
        imageUrl: null,
        initials: 'JS',
        notificationCount: 0,
      },
      'token_abc',
    );

    useAuthStore.getState().updateUser({
      name: 'João Atualizado',
      notificationCount: 3,
    });

    const state = useAuthStore.getState();
    expect(state.user?.name).toBe('João Atualizado');
    expect(state.user?.notificationCount).toBe(3);
    expect(state.user?.email).toBe('joao@teste.com'); // não alterado
  });

  it('updateUser não deve fazer nada se não houver usuário logado', () => {
    // Não faz login, tenta atualizar
    useAuthStore.getState().updateUser({ name: 'Qualquer' });

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
  });
});
