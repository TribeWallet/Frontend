import { apiClient, ApiError, getErrorMessage } from '../../src/services/api/apiClient';
import { environment } from '../../src/config/environment';
import * as interceptors from '../../src/services/api/interceptors';

jest.mock('../../src/services/api/interceptors', () => ({ getAuthToken: jest.fn(), handleUnauthorized: jest.fn() }));

const fetchMock = jest.fn();
const token = interceptors.getAuthToken as jest.Mock;
const sair = interceptors.handleUnauthorized as jest.Mock;
const responder = (status: number, corpo = '') =>
  fetchMock.mockResolvedValue({ ok: status < 300, status, text: async () => corpo });
const mensagem = async (status: number, corpo: string) => {
  responder(status, corpo);
  return apiClient.get('/x').then(() => 'sem erro', (e: ApiError) => e.message);
};

beforeEach(() => { (global as any).fetch = fetchMock; fetchMock.mockReset(); token.mockReturnValue('jwt'); });

describe('apiClient (real, só o fetch é simulado)', () => {
  it('usa a URL base e manda o JWT', async () => {
    responder(200, '{"a":1}');
    await expect(apiClient.get('/x')).resolves.toEqual({ a: 1 });
    expect(fetchMock.mock.calls[0][0]).toBe(`${environment.apiUrl}/x`);
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer jwt');
  });
  it('auth:false não manda o JWT', async () => {
    responder(200, '{}');
    await apiClient.post('/x', { a: 1 }, { auth: false });
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
    expect(fetchMock.mock.calls[0][1].body).toBe('{"a":1}');
  });
  it('204 sem corpo devolve undefined', async () => {
    responder(204);
    await expect(apiClient.delete('/x')).resolves.toBeUndefined();
  });
  it('falha de rede vira ApiError status 0 com a URL', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'));
    await expect(apiClient.get('/x')).rejects.toMatchObject({ status: 0, message: expect.stringContaining(environment.apiUrl) });
  });
  it('401 com sessão encerra a sessão', async () => {
    await mensagem(401, '');
    expect(sair).toHaveBeenCalled();
  });
  it('401 sem sessão (login errado) não dispara logout', async () => {
    token.mockReturnValue(null);
    await mensagem(401, 'Usuário ou senha incorretos');
    expect(sair).not.toHaveBeenCalled();
  });
  it.each([[404, 'Recurso não encontrado.'], [500, 'Erro no servidor. Tente novamente em instantes.'], [418, 'Não foi possível concluir a operação.']])(
    'corpo vazio com %i usa a mensagem padrão', async (s, e) => expect(await mensagem(s as number, '')).toBe(e));
  it('mostra texto puro do backend', async () => expect(await mensagem(400, 'Este convite expirou.')).toBe('Este convite expirou.'));
  it('mostra o primeiro erro de validação', async () =>
    expect(await mensagem(400, JSON.stringify({ title: 't', errors: { Nome: ['Nome obrigatório'] } }))).toBe('Nome obrigatório'));
  it('getErrorMessage esconde erros inesperados', () => {
    expect(getErrorMessage(new ApiError('x', 400))).toBe('x');
    expect(getErrorMessage(new Error('interno'))).toBe('Algo deu errado. Tente novamente.');
  });
});
