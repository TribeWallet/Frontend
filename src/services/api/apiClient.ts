import { environment } from '../../config/environment';
import { File as ExpoFile } from 'expo-file-system';
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
  auth?: boolean;
}

const FALLBACK_MESSAGES: Record<number, string> = {
  401: 'Sua sessão expirou. Entre novamente.',
  404: 'Recurso não encontrado.',
  415: 'Formato de envio não aceito pelo servidor.',
  500: 'Erro no servidor. Tente novamente em instantes.',
};

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

function normalizeFormData(form: FormData): FormData {
  const normalizedForm = new FormData();
  for (const [field, value] of form.entries()) {
    if (typeof value === 'object' && value !== null && 'uri' in value) {
      const filePart = value as { uri: string; name: string; type: string };
      const file = new ExpoFile(filePart.uri);
      normalizedForm.append(field, {
        name: filePart.name,
        type: filePart.type,
        bytes: () => file.bytes(),
      } as unknown as Blob);
    } else {
      normalizedForm.append(field, value);
    }
  }
  return normalizedForm;
}

async function request<T>(
  method: HttpMethod,
  path: string,
  { body, auth = true }: RequestOptions = {},
): Promise<T> {
  const token = auth ? getAuthToken() : null;
  const isFormData = body instanceof FormData;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined && !isFormData) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), environment.requestTimeoutMs);

  let response: Response;
  try {
    response = await fetch(`${environment.apiUrl}${path}`, {
      method,
      headers,
      body:
        body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(
      'Não foi possível conectar ao servidor. Verifique se a API está rodando: ' + environment.apiUrl,
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

async function requestForm<T>(
  method: HttpMethod,
  path: string,
  form: FormData,
  { auth = true }: { auth?: boolean } = {},
): Promise<T> {
  const token = auth ? getAuthToken() : null;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120000);

  let response: Response;
  try {
    response = await fetch(`${environment.apiUrl}${path}`, {
      method,
      headers,
      body: normalizeFormData(form),
      signal: controller.signal,
    });
  } catch (error) {
    console.error('[upload] fetch failed', {
      name: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw new ApiError(
      'Não foi possível conectar ao servidor. Verifique se a API está rodando: ' + environment.apiUrl,
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
  postForm: <T>(path: string, form: FormData, options?: { auth?: boolean }) =>
    requestForm<T>('POST', path, form, options),
  putForm: <T>(path: string, form: FormData, options?: { auth?: boolean }) =>
    requestForm<T>('PUT', path, form, options),
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return 'Algo deu errado. Tente novamente.';
}
