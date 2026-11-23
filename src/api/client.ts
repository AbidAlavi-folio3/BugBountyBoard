import { mockFetch } from '../mocks/server';
import type { ApiError, RemoteError } from '../types/api';
export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    public details?: Record<string, string>,
  ) {
    super(code);
    this.name = 'HttpError';
  }
}
let unauthorizedHandler: () => void = () => {};
export function onUnauthorized(handler: () => void): void {
  unauthorizedHandler = handler;
}
export function userMessage(error: unknown): string {
  if (error instanceof HttpError) {
    switch (error.status) {
      case 400:
        return 'Please check the information you entered.';
      case 401:
        return 'Please sign in again.';
      case 404:
        return 'We could not find that item.';
      case 409:
        return error.details?.productName
          ? `${error.details.productName} is out of stock.`
          : 'Some items are no longer available.';
      default:
        return 'Service unavailable. Please retry.';
    }
  }
  if (error instanceof DOMException && error.name === 'AbortError') return 'Request cancelled.';
  return 'Could not connect. Please retry.';
}
/** The one place that turns a thrown error into state a page can render. */
export function remoteError(error: unknown): RemoteError {
  const httpStatus = error instanceof HttpError ? error.status : undefined;
  return {
    status: 'error',
    message: userMessage(error),
    httpStatus,
    retryable: httpStatus === undefined || httpStatus >= 500,
  };
}
export async function request<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const base = import.meta.env.VITE_API_BASE_URL || '';
  const response =
    import.meta.env.VITE_API_MODE === 'real'
      ? await fetch(`${base}${path}`, { ...init, headers })
      : await mockFetch(path, { ...init, headers });
  if (!response.ok) {
    let payload: ApiError | undefined;
    try {
      payload = (await response.json()) as ApiError;
    } catch {
      /* malformed response */
    }
    if (response.status === 401 && token) unauthorizedHandler();
    throw new HttpError(response.status, payload?.error.code || 'UNKNOWN', payload?.error.details);
  }
  return (await response.json()) as T;
}
