/**
 * Testes de integração - UsuarioService
 * Simula comunicação frontend <-> backend nas rotas /api/usuarios/*
 */
import { mockApiClient } from '../../src/services/api/__mocks__/apiClient';
import { endpoints } from '../../src/config/api';
import * as usuarioService from '../../src/features/usuario/services/usuarioService';
import { ApiError } from '../../src/services/api/apiClient';

jest.mock('../../src/services/api/apiClient', () => {
  const mod = require('../../src/services/api/__mocks__/apiClient');
  return { ...mod.mockApiClient, apiClient: mod.mockApiClient, ApiError: mod.ApiError, default: mod.mockApiClient };
});

beforeEach(() => {
  mockApiClient.reset();

  mockApiClient.seedUsuario({
    usuarioToken: 'user_1',
    nome: 'João',
    sobrenome: 'Silva',
    email: 'joao@teste.com',
    username: 'joaosilva',
    imageUrl: null,
    deletedAt: null,
  });
  mockApiClient.seedUsuario({
    usuarioToken: 'user_2',
    nome: 'Maria',
    sobrenome: 'Santos',
    email: 'maria@teste.com',
    username: 'mariasantos',
    imageUrl: null,
    deletedAt: null,
  });
  mockApiClient.seedUsuario({
    usuarioToken: 'user_deletado',
    nome: 'Excluído',
    sobrenome: 'Usuário',
    email: 'excluido@teste.com',
    username: 'excluido',
    imageUrl: null,
    deletedAt: '2026-01-01T00:00:00',
  });
});

describe('UsuarioService - Listagem e busca', () => {
  it('deve listar todos os usuários ativos', async () => {
    const usuarios = await usuarioService.findUsuarioByEmail('joao@teste.com');

    expect(usuarios).toBeDefined();
    expect(usuarios?.email).toBe('joao@teste.com');
    expect(mockApiClient.get).toHaveBeenCalledWith(endpoints.usuarios.list);
  });

  it('deve retornar undefined para e-mail não cadastrado', async () => {
    const usuarios = await usuarioService.findUsuarioByEmail('naoexiste@teste.com');
    expect(usuarios).toBeUndefined();
  });

  it('deve buscar usuários por nome', async () => {
    const usuarios = await usuarioService.searchUsuariosByNome('Maria');
    expect(Array.isArray(usuarios)).toBe(true);
    expect(usuarios.length).toBeGreaterThan(0);
    expect(mockApiClient.get).toHaveBeenCalledWith(
      endpoints.usuarios.byNome('Maria'),
    );
  });

  it('deve filtrar usuários excluídos na busca por nome', async () => {
    const usuarios = await usuarioService.searchUsuariosByNome('Excluído');
    expect(usuarios.length).toBe(0);
  });
});

describe('UsuarioService - Atualização de perfil', () => {
  it('deve atualizar nome, sobrenome e username via PUT', async () => {
    const result = await usuarioService.updateUsuario('user_1', {
      nome: 'João Atualizado',
      sobrenome: 'Silva Atualizado',
      username: 'joaosilva_att',
    });

    expect(result.nome).toBe('João Atualizado');
    expect(mockApiClient.putForm).toHaveBeenCalledWith(
      endpoints.usuarios.byToken('user_1'),
      expect.any(FormData),
    );
  });

  it('deve atualizar senha', async () => {
    await usuarioService.updateUsuario('user_1', { senha: 'novaSenha123' });
    const call = mockApiClient.putForm.mock.calls.find(
      (c: any) => c[0] === endpoints.usuarios.byToken('user_1'),
    );
    const form = call![1];
    expect(form.get('Senha')).toBe('novaSenha123');
  });
});

describe('UsuarioService - Exclusão de conta', () => {
  it('deve excluir (soft delete) a conta do usuário', async () => {
    await usuarioService.deleteUsuario('user_1');

    expect(mockApiClient.delete).toHaveBeenCalledWith(
      endpoints.usuarios.byToken('user_1'),
    );

    // Verifica que o usuário agora está marcado como excluído
    const usuario = await usuarioService.findUsuarioByEmail('joao@teste.com');
    expect(usuario).toBeUndefined(); // filtrado por deletedAt
  });

  it('deve falhar se o usuário não existir', async () => {
    await expect(usuarioService.deleteUsuario('user_inexistente')).rejects.toThrow(
      'Usuário não encontrado',
    );
  });
});
