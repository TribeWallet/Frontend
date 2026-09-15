import { environment } from '../../config/environment';
import { getAuthToken, handleUnauthorized } from './interceptors';

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  body?: unknown;
  /** Envia o JWT da sessão. Desligado nas rotas de login e cadastro. */
  auth?: boolean;
}

const FALLBACK_MESSAGES: Record<number, string> = {
  401: 'Sua sessão expirou. Entre novamente.',
  404: 'Recurso não encontrado.',
  500: 'Erro no servidor. Tente novamente em instantes.',
};

// O backend responde erros como texto puro (BadRequest(e.Message)) ou, na validação
// automática do ASP.NET, como ProblemDetails em JSON.
function extractErrorMessage(body: string, status: number): string {
  const fallback = FALLBACK_MESSAGES[status] ?? 'Não foi possível concluir a operação.';
  if (!body) return fallback;
  try {
    const parsed = JSON.parse(body);
    if (parsed && typeof parsed === 'object') {
      const firstError = parsed.errors && Object.values(parsed.errors).flat()[0];
      return typeof firstError === 'string' ? firstError : parsed.title ?? fallback;
    }
    return typeof parsed === 'string' ? parsed : fallback;
  } catch {
    return body;
  }
}

async function request<T>(
  method: HttpMethod,
  path: string,
  { body, auth = true }: RequestOptions = {},
): Promise<T> {
  const token = auth ? getAuthToken() : null;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), environment.requestTimeoutMs);

  let response: Response;
  try {
    response = await fetch(`${environment.apiUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(
      'Não foi possível conectar ao servidor. Verifique se a API está rodando.',
      0,
    );
  } finally {
    clearTimeout(timeout);
  }

  const text = await response.text();

  if (!response.ok) {
    if (response.status === 401 && token) handleUnauthorized();
    throw new ApiError(extractErrorMessage(text, response.status), response.status);
  }

  return (text ? JSON.parse(text) : undefined) as T;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, { ...options, body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PUT', path, { ...options, body }),
  delete: <T = void>(path: string, options?: RequestOptions) =>
    request<T>('DELETE', path, options),
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return 'Algo deu errado. Tente novamente.';
}
