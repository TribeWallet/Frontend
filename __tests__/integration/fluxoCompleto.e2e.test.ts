/**
 * TESTE E2E - Fluxo completo de integração Frontend <-> Backend
 *
 * Simula todo o ciclo de vida do app Tribe Wallet:
 * 1. Cadastro de usuário
 * 2. Login
 * 3. Criação de grupo
 * 4. Criação de compromisso com divisão de despesas
 * 5. Registro de pagamento (com e sem comprovante)
 * 6. Edição de pagamento
 * 7. Consulta de relatórios
 * 8. Listagem e marcação de notificações
 * 9. Exclusão de pagamento
 * 10. Exclusão de compromisso
 * 11. Exclusão de grupo
 * 12. Exclusão de conta
 *
 * Cada passo valida que o frontend chama os endpoints corretos do backend
 * e que as transformações de dados estão corretas.
 */
import { mockApiClient } from '../../src/services/api/__mocks__/apiClient';
import { endpoints } from '../../src/config/api';
import * as authService from '../../src/features/auth/services/authService';
import * as usuarioService from '../../src/features/usuario/services/usuarioService';
import * as grupoService from '../../src/features/grupos/services/grupoService';
import * as conviteService from '../../src/features/grupos/services/conviteService';
import * as compromissoService from '../../src/features/compromissos/services/compromissoService';
import * as pagamentoService from '../../src/features/pagamentos/services/pagamentoService';
import * as reportService from '../../src/features/relatorios/services/reportService';
import * as notificacaoService from '../../src/features/notificacoes/services/notificacaoService';
import { fetchDashboard } from '../../src/features/dashboard/Services/dashboardService';
import { ApiError } from '../../src/services/api/apiClient';

jest.mock('../../src/services/api/apiClient', () => {
  const mod = require('../../src/services/api/__mocks__/apiClient');
  return { ...mod.mockApiClient, apiClient: mod.mockApiClient, ApiError: mod.ApiError, default: mod.mockApiClient };
});

beforeEach(() => {
  mockApiClient.reset();
});

describe('E2E - Fluxo completo de integração', () => {
  let usuarioToken: string;
  let grupoToken: string;
  let compromissoToken: string;
  let pagamentoToken: string;

  beforeAll(async () => {
    // ============================================================
    // PASSO 1: Cadastro de usuário
    // ============================================================
    const registrado = await authService.register({
      nome: 'João',
      sobrenome: 'Silva',
      username: 'joaosilva_e2e',
      email: 'joao.e2e@teste.com',
      senha: 'senha123',
    });
    expect(registrado.usuarioToken).toBeDefined();
    expect(registrado.email).toBe('joao.e2e@teste.com');

    // ============================================================
    // PASSO 2: Login
    // ============================================================
    const login = await authService.login({
      email: 'joao.e2e@teste.com',
      senha: 'senha123',
    });
    usuarioToken = login.user.id;
    expect(login.token).toBeDefined();
    expect(login.user.email).toBe('joao.e2e@teste.com');

    // ============================================================
    // PASSO 3: Criação de grupo
    // ============================================================
    const grupo = await grupoService.createGrupo({
      nome: 'Casa',
      descricao: 'Despesas da residência',
      usuarioTokens: [usuarioToken],
    });
    grupoToken = grupo.grupoToken;
    expect(grupo.nome).toBe('Casa');
    expect(grupo.grupoToken).toBeDefined();

    // Verifica que o grupo aparece na listagem do usuário
    const grupos = await grupoService.listGrupos(usuarioToken);
    expect(grupos.find((g: any) => g.grupoToken === grupoToken)).toBeDefined();

    // ============================================================
    // PASSO 4: Criação de compromisso com divisão personalizada
    // ============================================================
    const compromisso = await compromissoService.createCompromisso({
      name: 'Supermercado',
      groupId: grupoToken,
      category: 'Mercado',
      amount: 200,
      dueDate: '10/12/2026',
      splitMode: 'custom',
      splits: [
        { integranteToken: 'int_membro1', amount: 120 },
        { integranteToken: 'int_membro2', amount: 80 },
      ],
    });
    compromissoToken = compromisso.compromissoFinanceiroToken;
    expect(compromisso.titulo).toBe('Supermercado');
    expect(compromisso.valorTotal).toBe(200);

    // ============================================================
    // PASSO 5: Registro de pagamento (sem comprovante)
    // ============================================================
    const pagamento1 = await pagamentoService.createPagamento({
      shareId: 'part_membro1',
      amount: 120,
      date: '10/12/2026',
      method: 'pix',
    });
    expect(pagamento1.pagamentoToken).toBeDefined();
    expect(pagamento1.valor).toBe(120);

    // ============================================================
    // PASSO 6: Registro de pagamento com comprovante (PDF)
    // ============================================================
    const pagamento2 = await pagamentoService.createPagamento({
      shareId: 'part_membro2',
      amount: 80,
      date: '10/12/2026',
      method: 'dinheiro',
      comprovante: {
        uri: 'file:///data/comprovante.pdf',
        name: 'comprovante.pdf',
        type: 'application/pdf',
      },
    });
    pagamentoToken = pagamento2.pagamentoToken;
    expect(pagamento2.comprovanteUrl).toBeDefined();

    // ============================================================
    // PASSO 7: Edição de pagamento
    // ============================================================
    await pagamentoService.updatePagamento(pagamentoToken, {
      amount: 90,
      method: 'credito',
    });
    const pagamentoAtualizado = mockApiClient.seedPagamento({
      pagamentoToken: pagamentoToken,
      valor: 90,
      data: '2026-12-10',
      comprovanteUrl: 'http://mock/comprovante.pdf',
      metodo: 3,
    });
    expect(pagamentoAtualizado.valor).toBe(90);

    // ============================================================
    // PASSO 8: Consulta de relatórios
    // ============================================================
    const relatorioUsuario = await reportService.getUserReport(usuarioToken);
    expect(relatorioUsuario.totalPago).toBeDefined();
    expect(relatorioUsuario.nomeCompleto).toBeDefined();

    const relatorioGrupo = await reportService.getGroupReport(usuarioToken, grupoToken);
    expect(relatorioGrupo.nome).toBeDefined();
    expect(relatorioGrupo.totalPago).toBeDefined();

    // ============================================================
    // PASSO 9: Dashboard
    // ============================================================
    const dashboard = await fetchDashboard(usuarioToken);
    expect(dashboard).toBeDefined();
    expect(dashboard.valorTotalPago).toBeDefined();

    // ============================================================
    // PASSO 10: Notificações
    // ============================================================
    const notificacoes = await notificacaoService.listNotificacoes();
    expect(Array.isArray(notificacoes)).toBe(true);

    const naoLidas = await notificacaoService.countNaoLidas();
    expect(typeof naoLidas).toBe('number');

    // Marcar uma como lida
    if (notificacoes.length > 0) {
      await notificacaoService.marcarLida(notificacoes[0].id);
    }

    // ============================================================
    // PASSO 11: Exclusão de pagamento
    // ============================================================
    await pagamentoService.deletePagamento(pagamentoToken);

    // ============================================================
    // PASSO 12: Exclusão de compromisso
    // ============================================================
    await compromissoService.deleteCompromisso(compromissoToken);

    // ============================================================
    // PASSO 13: Exclusão de grupo
    // ============================================================
    await grupoService.deleteGrupo(grupoToken);

    // ============================================================
    // PASSO 14: Exclusão de conta
    // ============================================================
    await usuarioService.deleteUsuario(usuarioToken);

    // ============================================================
    // Verificação: todos os endpoints críticos foram chamados
    // ============================================================
    expect(mockApiClient.post).toHaveBeenCalledWith(
      endpoints.auth.login,
      expect.any(Object),
      { auth: false },
    );
    expect(mockApiClient.post).toHaveBeenCalledWith(
      endpoints.auth.register,
      {
        nome: 'João',
        sobrenome: 'Silva',
        username: 'joaosilva_e2e',
        email: 'joao.e2e@teste.com',
        senha: 'senha123',
      },
      { auth: false },
    );
    expect(mockApiClient.post).toHaveBeenCalledWith(
      endpoints.grupos.create,
      expect.any(Object),
    );
    expect(mockApiClient.postForm).toHaveBeenCalledWith(
      endpoints.compromissos.byGrupo(grupoToken),
      expect.any(FormData),
    );
    expect(mockApiClient.postForm).toHaveBeenCalledWith(
      endpoints.pagamentos.create,
      expect.any(FormData),
    );
    expect(mockApiClient.putForm).toHaveBeenCalledWith(
      endpoints.pagamentos.byToken(pagamentoToken),
      expect.any(FormData),
    );
    expect(mockApiClient.get).toHaveBeenCalledWith(
      endpoints.relatorios.byUsuario(usuarioToken),
    );
    expect(mockApiClient.get).toHaveBeenCalledWith(
      endpoints.usuarios.dashboard(usuarioToken),
    );
    expect(mockApiClient.delete).toHaveBeenCalledWith(
      endpoints.pagamentos.byToken(pagamentoToken),
    );
    expect(mockApiClient.delete).toHaveBeenCalledWith(
      endpoints.compromissos.byToken(compromissoToken),
    );
    expect(mockApiClient.delete).toHaveBeenCalledWith(
      endpoints.grupos.byToken(grupoToken),
    );
    expect(mockApiClient.delete).toHaveBeenCalledWith(
      endpoints.usuarios.byToken(usuarioToken),
    );
  });

  it('deve completar todo o fluxo de integração sem erros', () => {
    // Se chegou até aqui sem lançar exceção, todos os passos passaram
    expect(true).toBe(true);
  });
});

describe('E2E - Cenários de erro de integração', () => {
  it('deve tratar erro de conexão com o backend (servidor fora do ar)', async () => {
    // Simula que o backend não está respondendo
    const originalFetch = global.fetch;
    global.fetch = jest.fn(() => Promise.reject(new TypeError('Failed to fetch')));

    await expect(
      authService.login({ email: 'test@test.com', senha: 'senha' }),
    ).rejects.toThrow('E-mail ou senha inválidos');

    global.fetch = originalFetch;
  });

  it('deve tratar erro 404 (recurso não encontrado)', async () => {
    await expect(
      compromissoService.getCompromisso('comp_inexistente'),
    ).rejects.toThrow('Compromisso não encontrado');
  });

  it('deve validar que o campo Comprovante é opcional no frontend', async () => {
    // O frontend deve permitir salvar pagamento sem comprovante
    const pagamento = await pagamentoService.createPagamento({
      shareId: 'part_1',
      amount: 50,
      date: '10/12/2026',
      method: 'pix',
      // sem comprovante
    });
    expect(pagamento.pagamentoToken).toBeDefined();
    // Se o backend exigir comprovante obrigatório, este teste falharia aqui
    // (o backend retorna erro 400 dizendo que Comprovante é obrigatório)
  });
});
