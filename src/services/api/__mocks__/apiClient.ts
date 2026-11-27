/**
 * Mock do apiClient para testes de integração frontend-backend.
 * Simula as respostas do backend ASP.NET Core (porta 5049).
 * Nao importa do modulo real para evitar dependencias circulares.
 */

export class ApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Banco de dados em memoria para simular o backend
const DB: Record<string, any> = {
  usuarios: [],
  grupos: [],
  compromissos: [],
  pagamentos: [],
  notificacoes: [],
};

let authToken: string | null = null;
let currentUserId: string | null = null;

function generateToken(): string {
  return `token_${Math.random().toString(36).slice(2)}`;
}

// ============================================================
// Mock das funcoes do apiClient
// ============================================================

export const mockApiClient = {
  get: jest.fn(async <T>(path: string): Promise<T> => {
    await new Promise((r) => setTimeout(r, 50));
    if (!path.startsWith('/api/')) throw new ApiError('Caminho invalido', 400);

    // Auth / usuarios
    if (path === '/api/usuarios') {
      return DB.usuarios.filter((u: any) => !u.deletedAt) as T;
    }
    if (path.startsWith('/api/usuarios/') && path.endsWith('/dashboard')) {
      const token = path.split('/')[3];
      const user = DB.usuarios.find((u: any) => u.usuarioToken === token);
      if (!user) throw new ApiError('Usuário não encontrado', 404);
      return {
        tipo: 1,
        dataHora: new Date().toISOString(),
        totalPago: 100,
        valorTotalPago: 100,
        gruposAtivosCount: 0,
        pagamentosPendentesCount: 0,
        pagamentosCountTotal: 0,
        compromissosAVencerCount: 0,
        compromissosVencidosCount: 0,
        compromissosCountTotal: 0,
        taxaDePontualidade: 0,
        transacoesEVencimentos: [],
        nomeCompleto: `${user.nome} ${user.sobrenome}`,
        grupos: [],
      } as T;
    }
    if (path.startsWith('/api/usuarios/') && !path.endsWith('/dashboard')) {
      const token = path.split('/')[3];
      const user = DB.usuarios.find((u: any) => u.usuarioToken === token);
      if (user) return user as T;
      // Busca por nome: filtra ativos cujo nome ou sobrenome contém o termo
      const termo = token.toLowerCase();
      return DB.usuarios.filter(
        (u: any) =>
          !u.deletedAt &&
          (u.nome?.toLowerCase().includes(termo) || u.sobrenome?.toLowerCase().includes(termo)),
      ) as T;
    }

    // Grupos
    if (path.startsWith('/api/grupos/usuario/')) {
      const token = path.split('/')[4];
      return DB.grupos.filter(
        (g: any) => !g.deletedAt && g.integrantes.some((i: any) => i.usuario?.usuarioToken === token),
      ) as T;
    }
    if (path.startsWith('/api/grupos/') && path.endsWith('?deleted=false')) {
      const token = path.split('/')[3].split('?')[0];
      const grupo = DB.grupos.find((g: any) => g.grupoToken === token && !g.deletedAt);
      if (!grupo) throw new ApiError('Grupo não encontrado', 404);
      return grupo as T;
    }
    if (path.startsWith('/api/grupos/') && path.includes('/integrantes')) {
      const parts = path.split('/');
      const grupoToken = parts[3];
      const grupo = DB.grupos.find((g: any) => g.grupoToken === grupoToken);
      if (!grupo) throw new ApiError('Grupo não encontrado', 404);
      if (parts.length === 5) {
        return grupo.integrantes.filter((i: any) => !i.deletedAt) as T;
      }
      if (parts.length === 7) {
        const integranteToken = parts[5];
        const integrante = grupo.integrantes.find((i: any) => i.integranteToken === integranteToken);
        if (!integrante) throw new ApiError('Integrante não encontrado', 404);
        return integrante as T;
      }
    }
    if (path.startsWith('/api/grupos/') && path.includes('/convites')) {
      const token = path.split('/')[3];
      const grupo = DB.grupos.find((g: any) => g.grupoToken === token);
      if (!grupo) throw new ApiError('Grupo não encontrado', 404);
      return [] as T;
    }

    // Convites
    if (path.startsWith('/api/convites/')) {
      const token = path.split('/')[3];
      if (path.endsWith('/aceitar')) {
        return { grupoToken: 'grupo_existente_1' } as T;
      }
      return {
        conviteToken: token,
        grupoToken: 'grupo_existente_1',
        emailConvidado: null,
        expiraEm: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      } as T;
    }

    // Compromissos
    if (path.startsWith('/api/compromissos/usuario/')) {
      const token = path.split('/')[4];
      return DB.compromissos.filter(
        (c: any) => !c.deletedAt && c.grupo?.integrantes.some((i: any) => i.usuarioToken === token),
      ) as T;
    }
    if (path.startsWith('/api/compromissos/') && path.includes('/integrantes') === false) {
      const parts = path.split('/');
      const token = parts[3].split('?')[0];
      const hasQuery = path.includes('?');

      if (hasQuery) {
        // Listar compromissos por grupo: /api/compromissos/{grupoToken}?deleted=false
        return DB.compromissos.filter(
          (c: any) => !c.deletedAt && c.grupo?.grupoToken === token,
        ) as T;
      }
      // Buscar compromisso único por token
      const compromisso = DB.compromissos.find((c: any) => c.compromissoFinanceiroToken === token);
      if (!compromisso) throw new ApiError('Compromisso não encontrado', 404);
      return compromisso as T;
    }
    if (path.startsWith('/api/compromissos/') && path.includes('/integrantes')) {
      const parts = path.split('/');
      const compromissoToken = parts[3];
      const compromisso = DB.compromissos.find(
        (c: any) => c.compromissoFinanceiroToken === compromissoToken,
      );
      if (!compromisso) throw new ApiError('Compromisso não encontrado', 404);
      if (parts.length === 5) {
        return compromisso.participacoes || [] as T;
      }
      if (parts.length === 7) {
        const token = parts[5];
        const part = (compromisso.participacoes || []).find(
          (p: any) => p.integranteCompromissoToken === token,
        );
        if (!part) throw new ApiError('Participação não encontrada', 404);
        return part as T;
      }
    }

    // Relatorios
    if (path.startsWith('/api/relatorios/usuario/') && path.includes('/grupo/')) {
      return {
        tipo: 1,
        dataHora: new Date().toISOString(),
        totalPago: 200,
        valorTotalPago: 200,
        gruposAtivosCount: 0,
        pagamentosPendentesCount: 0,
        pagamentosCountTotal: 0,
        compromissosAVencerCount: 0,
        compromissosVencidosCount: 0,
        compromissosCountTotal: 0,
        taxaDePontualidade: 0,
        transacoesEVencimentos: [],
        nome: 'Grupo Teste',
        nomeCompleto: 'Grupo Teste',
        grupos: [],
      } as T;
    }
    if (path.startsWith('/api/relatorios/usuario/')) {
      const token = path.split('/')[4];
      return {
        tipo: 1,
        dataHora: new Date().toISOString(),
        totalPago: 150,
        valorTotalPago: 150,
        gruposAtivosCount: 0,
        pagamentosPendentesCount: 0,
        pagamentosCountTotal: 0,
        compromissosAVencerCount: 0,
        compromissosVencidosCount: 0,
        compromissosCountTotal: 0,
        taxaDePontualidade: 0,
        transacoesEVencimentos: [],
        nomeCompleto: 'Usuario Teste',
        grupos: [],
      } as T;
    }

    // Pagamentos
    if (path.startsWith('/api/Pagamento/')) {
      const token = path.split('/')[3];
      const pagamento = DB.pagamentos.find((p: any) => p.pagamentoToken === token);
      if (!pagamento) throw new ApiError('Pagamento não encontrado', 404);
      return pagamento as T;
    }

    // Notificacoes
    if (path === '/api/notificacoes') {
      return DB.notificacoes.filter((n: any) => !n.deletedAt) as T;
    }
    if (path === '/api/notificacoes/nao-lidas/contagem') {
      return {
        naoLidas: DB.notificacoes.filter((n: any) => !n.lida && !n.deletedAt).length,
      } as T;
    }
    if (path.startsWith('/api/notificacoes/') && path.endsWith('/lida')) {
      const token = path.split('/')[3];
      const notif = DB.notificacoes.find((n: any) => n.notificacaoToken === token);
      if (!notif) throw new ApiError('Notificação não encontrada', 404);
      return {} as T;
    }
    if (path === '/api/notificacoes/lidas') {
      return {} as T;
    }

    throw new ApiError('Endpoint nao mockado: ' + path, 404);
  }),

  post: jest.fn(async <T>(path: string, body: any): Promise<T> => {
    await new Promise((r) => setTimeout(r, 50));

    // Auth login
    if (path === '/api/auth/login') {
      const user = DB.usuarios.find(
        (u: any) => u.email === body.email && u.senha === body.senha,
      );
      if (!user) throw new ApiError('E-mail ou senha inválidos', 401);
      authToken = generateToken();
      currentUserId = user.usuarioToken;
      return { usuarioResponseDto: user, jwtToken: authToken } as T;
    }

    if (path === '/api/auth/register') {
      const existing = DB.usuarios.find(
        (u: any) => u.email === body.email || u.username === body.username,
      );
      if (existing) throw new ApiError('E-mail ou nome de usuário já cadastrado.', 400);
      const usuario = {
        usuarioToken: `user_${Date.now()}`,
        nome: body.nome,
        sobrenome: body.sobrenome,
        email: body.email,
        username: body.username,
        senha: body.senha,
        imageUrl: null,
        deletedAt: null,
      };
      DB.usuarios.push(usuario);
      return usuario as T;
    }

    // Grupos - create
    if (path === '/api/grupos') {
      const grupoToken = `grupo_${Date.now()}`;
      const grupo = {
        grupoToken,
        nome: body.nome,
        descricao: body.descricao,
        deletedAt: null,
        integrantes: (body.integrantes || []).map((it: any) => ({
          integranteToken: `int_${Date.now()}_${Math.random()}`,
          usuario: DB.usuarios.find((u: any) => u.usuarioToken === it.usuarioToken),
          grupoToken,
          deletedAt: null,
        })),
        compromissos: [],
      };
      DB.grupos.push(grupo);
      return grupo as T;
    }

    // Compromissos - create
    if (path.startsWith('/api/compromissos/') && !path.includes('/integrantes')) {
      const grupoToken = path.split('/')[3];
      const grupo = DB.grupos.find((g: any) => g.grupoToken === grupoToken);
      if (!grupo) throw new ApiError('Grupo não encontrado', 404);
      const compromissoToken = `comp_${Date.now()}`;
      const compromisso = {
        compromissoFinanceiroToken: compromissoToken,
        titulo: body.Titulo || body.name,
        valorTotal: Number(body.ValorTotal || body.amount),
        data: body.Data || body.dueDate,
        tipoDivisao: Number(body.TipoDivisao || 1),
        imagem: null,
        categoria: body.Categoria || body.category,
        deletedAt: null,
        grupo,
        participacoes: [],
      };
      DB.compromissos.push(compromisso);
      return compromisso as T;
    }
    if (path.startsWith('/api/compromissos/') && path.includes('/integrantes')) {
      const compromissoToken = path.split('/')[3];
      const compromisso = DB.compromissos.find(
        (c: any) => c.compromissoFinanceiroToken === compromissoToken,
      );
      if (!compromisso) throw new ApiError('Compromisso não encontrado', 404);
      const novasParticipacoes = (body || []).map((p: any) => ({
        integranteCompromissoToken: `part_${Date.now()}_${Math.random()}`,
        integrante: { integranteToken: p.integranteToken, usuario: {} },
        valorDevedor: p.valorDevedor || p.amount,
        valorPago: p.valorPago || 0,
        deletedAt: null,
        pagamentos: [],
      }));
      compromisso.participacoes = [...(compromisso.participacoes || []), ...novasParticipacoes];
      return compromisso as T;
    }

    // Pagamentos - create
    if (path === '/api/Pagamento') {
      const pagamentoToken = `pag_${Date.now()}`;
      const pagamento = {
        pagamentoToken,
        valor: Number(body.Valor || 0),
        data: body.Data || new Date().toISOString(),
        comprovanteUrl: null,
        metodo: Number(body.Metodo || 1),
      };
      DB.pagamentos.push(pagamento);
      return pagamento as T;
    }

    // Convites - create
    if (path.startsWith('/api/grupos/') && path.endsWith('/convites')) {
      const grupoToken = path.split('/')[3];
      const conviteToken = `convite_${Date.now()}`;
      return {
        conviteToken,
        link: `tribewallet://convite/${conviteToken}`,
        grupoToken,
        emailConvidado: body.email ?? null,
        expiraEm: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        emailEnviado: false,
      } as T;
    }

    // Convites - aceitar
    if (path.startsWith('/api/convites/') && path.endsWith('/aceitar')) {
      return { grupoToken: 'grupo_existente_1' } as T;
    }

    // Notificacoes - marcar todas lidas
    if (path === '/api/notificacoes/lidas') {
      DB.notificacoes.forEach((n: any) => {
        n.lida = true;
      });
      return {} as T;
    }

    throw new ApiError('POST nao mockado: ' + path, 404);
  }),

  postForm: jest.fn(async <T>(path: string, form: any): Promise<T> => {
    await new Promise((r) => setTimeout(r, 50));

    // Compromissos - create (via form)
    if (path.startsWith('/api/compromissos/') && !path.includes('/integrantes')) {
      const grupoToken = path.split('/')[3];
      const grupo = DB.grupos.find((g: any) => g.grupoToken === grupoToken);
      if (!grupo) throw new ApiError('Grupo não encontrado', 404);
      const compromissoToken = `comp_${Date.now()}`;
      const compromisso = {
        compromissoFinanceiroToken: compromissoToken,
        titulo: form.get('Titulo'),
        valorTotal: Number(form.get('ValorTotal')),
        data: form.get('Data'),
        tipoDivisao: Number(form.get('TipoDivisao')),
        imagem: null,
        categoria: form.get('Categoria'),
        deletedAt: null,
        grupo,
        participacoes: [],
      };
      DB.compromissos.push(compromisso);
      return compromisso as T;
    }

    // Pagamentos - create (via form)
    if (path === '/api/Pagamento') {
      const pagamentoToken = `pag_${Date.now()}`;
      const pagamento = {
        pagamentoToken,
        valor: Number(form.get('Valor')),
        data: form.get('Data'),
        comprovanteUrl: form.get('Comprovante') ? 'http://mock/comprovante.pdf' : null,
        metodo: Number(form.get('Metodo')),
      };
      DB.pagamentos.push(pagamento);
      return pagamento as T;
    }

    throw new ApiError('POST form nao mockado: ' + path, 404);
  }),

  put: jest.fn(async <T>(path: string, body: any): Promise<T> => {
    await new Promise((r) => setTimeout(r, 50));

    // Grupos - update
    if (path.startsWith('/api/grupos/') && !path.includes('/integrantes') && !path.includes('/convites')) {
      const token = path.split('/')[3];
      const grupo = DB.grupos.find((g: any) => g.grupoToken === token);
      if (!grupo) throw new ApiError('Grupo não encontrado', 404);
      grupo.nome = body.nome || grupo.nome;
      grupo.descricao = body.descricao || grupo.descricao;
      return grupo as T;
    }
    if (path.startsWith('/api/grupos/') && path.includes('/integrantes')) {
      const token = path.split('/')[3];
      const grupo = DB.grupos.find((g: any) => g.grupoToken === token);
      if (!grupo) throw new ApiError('Grupo não encontrado', 404);
      const novos = (body || []).map((it: any) => ({
        integranteToken: `int_${Date.now()}_${Math.random()}`,
        usuario: DB.usuarios.find((u: any) => u.usuarioToken === it.usuarioToken),
        grupoToken: token,
        deletedAt: null,
      }));
      grupo.integrantes = [...grupo.integrantes, ...novos];
      return {} as T;
    }

    // Usuario - update
    if (path.startsWith('/api/usuarios/') && !path.endsWith('/dashboard')) {
      const token = path.split('/')[3];
      const user = DB.usuarios.find((u: any) => u.usuarioToken === token);
      if (!user) throw new ApiError('Usuário não encontrado', 404);
      if (body.Nome) user.nome = body.Nome;
      if (body.Sobrenome) user.sobrenome = body.Sobrenome;
      if (body.Username) user.username = body.Username;
      return user as T;
    }

    throw new ApiError('PUT nao mockado: ' + path, 404);
  }),

  putForm: jest.fn(async <T>(path: string, form: any): Promise<T> => {
    await new Promise((r) => setTimeout(r, 50));

    // Usuario - update (via form)
    if (path.startsWith('/api/usuarios/') && !path.endsWith('/dashboard')) {
      const token = path.split('/')[3];
      const user = DB.usuarios.find((u: any) => u.usuarioToken === token);
      if (!user) throw new ApiError('Usuário não encontrado', 404);
      if (form.get('Nome')) user.nome = form.get('Nome');
      if (form.get('Sobrenome')) user.sobrenome = form.get('Sobrenome');
      if (form.get('Username')) user.username = form.get('Username');
      if (form.get('Senha')) user.senha = form.get('Senha');
      return user as T;
    }

    // Compromissos - update (via form)
    if (path.startsWith('/api/compromissos/') && !path.includes('/integrantes')) {
      const token = path.split('/')[3];
      const compromisso = DB.compromissos.find(
        (c: any) => c.compromissoFinanceiroToken === token,
      );
      if (!compromisso) throw new ApiError('Compromisso não encontrado', 404);
      compromisso.titulo = form.get('Titulo');
      compromisso.valorTotal = Number(form.get('ValorTotal'));
      compromisso.data = form.get('Data');
      compromisso.tipoDivisao = Number(form.get('TipoDivisao'));
      compromisso.categoria = form.get('Categoria');
      return compromisso as T;
    }

    // Pagamentos - update (via form)
    if (path.startsWith('/api/Pagamento/')) {
      const token = path.split('/')[3];
      const pagamento = DB.pagamentos.find((p: any) => p.pagamentoToken === token);
      if (!pagamento) throw new ApiError('Pagamento não encontrado', 404);
      if (form.get('Valor')) pagamento.valor = Number(form.get('Valor'));
      if (form.get('Data')) pagamento.data = form.get('Data');
      if (form.get('Metodo')) pagamento.metodo = Number(form.get('Metodo'));
      return pagamento as T;
    }

    throw new ApiError('PUT form nao mockado: ' + path, 404);
  }),

  patch: jest.fn(async <T>(path: string): Promise<T> => {
    await new Promise((r) => setTimeout(r, 50));

    // Notificacoes - marcar como lida
    if (path.startsWith('/api/notificacoes/') && path.endsWith('/lida')) {
      const token = path.split('/')[3];
      const notif = DB.notificacoes.find((n: any) => n.notificacaoToken === token);
      if (!notif) throw new ApiError('Notificação não encontrada', 404);
      notif.lida = true;
      return {} as T;
    }

    // Notificacoes - marcar todas como lidas
    if (path === '/api/notificacoes/lidas') {
      DB.notificacoes.forEach((n: any) => {
        n.lida = true;
      });
      return {} as T;
    }

    throw new ApiError('PATCH nao mockado: ' + path, 404);
  }),

  delete: jest.fn(async <T>(path: string): Promise<T> => {
    await new Promise((r) => setTimeout(r, 50));

    // Grupos - delete
    if (path.startsWith('/api/grupos/') && !path.includes('/integrantes') && !path.includes('/convites')) {
      const token = path.split('/')[3];
      const grupo = DB.grupos.find((g: any) => g.grupoToken === token);
      if (!grupo) throw new ApiError('Grupo não encontrado', 404);
      grupo.deletedAt = new Date().toISOString();
      return {} as T;
    }
    if (path.startsWith('/api/grupos/') && path.includes('/integrantes')) {
      const parts = path.split('/');
      const grupoToken = parts[3];
      const integranteToken = parts[5];
      const grupo = DB.grupos.find((g: any) => g.grupoToken === grupoToken);
      if (!grupo) throw new ApiError('Grupo não encontrado', 404);
      const integrante = grupo.integrantes.find((i: any) => i.integranteToken === integranteToken);
      if (!integrante) throw new ApiError('Integrante não encontrado', 404);
      integrante.deletedAt = new Date().toISOString();
      return {} as T;
    }

    // Usuario - delete (soft delete)
    if (path.startsWith('/api/usuarios/') && !path.endsWith('/dashboard')) {
      const token = path.split('/')[3];
      const user = DB.usuarios.find((u: any) => u.usuarioToken === token);
      if (!user) throw new ApiError('Usuário não encontrado', 404);
      user.deletedAt = new Date().toISOString();
      return {} as T;
    }

    // Compromissos - delete
    if (path.startsWith('/api/compromissos/') && !path.includes('/integrantes')) {
      const token = path.split('/')[3];
      const compromisso = DB.compromissos.find(
        (c: any) => c.compromissoFinanceiroToken === token,
      );
      if (!compromisso) throw new ApiError('Compromisso não encontrado', 404);
      compromisso.deletedAt = new Date().toISOString();
      return {} as T;
    }
    if (path.startsWith('/api/compromissos/') && path.includes('/integrantes')) {
      const parts = path.split('/');
      const token = parts[4];
      const compromisso = DB.compromissos.find((c: any) =>
        (c.participacoes || []).some((p: any) => p.integranteCompromissoToken === token),
      );
      if (!compromisso) throw new ApiError('Compromisso não encontrado', 404);
      const part = compromisso.participacoes.find(
        (p: any) => p.integranteCompromissoToken === token,
      );
      if (!part) throw new ApiError('Participação não encontrada', 404);
      part.deletedAt = new Date().toISOString();
      return {} as T;
    }

    // Pagamentos - delete
    if (path.startsWith('/api/Pagamento/')) {
      const token = path.split('/')[3];
      const pagamento = DB.pagamentos.find((p: any) => p.pagamentoToken === token);
      if (!pagamento) throw new ApiError('Pagamento não encontrado', 404);
      DB.pagamentos = DB.pagamentos.filter((p: any) => p.pagamentoToken !== token);
      return {} as T;
    }

    // Notificacoes - delete
    if (path.startsWith('/api/notificacoes/') && !path.endsWith('/lida') && !path.includes('/lidas')) {
      const token = path.split('/')[3];
      const notif = DB.notificacoes.find((n: any) => n.notificacaoToken === token);
      if (!notif) throw new ApiError('Notificação não encontrada', 404);
      notif.deletedAt = new Date().toISOString();
      return {} as T;
    }

    throw new ApiError('DELETE nao mockado: ' + path, 404);
  }),

  downloadPdf: jest.fn(async (path: string, filename: string): Promise<any> => {
    await new Promise((r) => setTimeout(r, 50));
    return {
      uri: `file:///cache/${filename}`,
      path: '/cache',
      filename,
      write: jest.fn(async () => {}),
    };
  }),

  // Helpers de teste
  reset: () => {
    DB.usuarios = [];
    DB.grupos = [];
    DB.compromissos = [];
    DB.pagamentos = [];
    DB.notificacoes = [];
    authToken = null;
    currentUserId = null;
  },
  setAuthToken: (token: string | null) => {
    authToken = token;
  },
  getAuthToken: () => authToken,
  getCurrentUserId: () => currentUserId,
  seedUsuario: (usuario: any) => {
    DB.usuarios.push(usuario);
    return usuario;
  },
  seedGrupo: (grupo: any) => {
    DB.grupos.push(grupo);
    return grupo;
  },
  seedCompromisso: (compromisso: any) => {
    DB.compromissos.push(compromisso);
    return compromisso;
  },
  seedPagamento: (pagamento: any) => {
    DB.pagamentos.push(pagamento);
    return pagamento;
  },
  seedNotificacao: (notificacao: any) => {
    DB.notificacoes.push(notificacao);
    return notificacao;
  },
};

export default mockApiClient;

// Alias para compatibilidade com imports que usam 'apiClient' (named export)
export const apiClient = mockApiClient;

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return 'Erro desconhecido';
}
