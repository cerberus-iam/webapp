import { getDefaultOrgSlug, getIamApiBaseUrl } from '@/config/env';
import { type Result, err, ok } from '@/lib/result';

import { parseProblemDetails } from './problem';
import {
  type ApiError,
  type ProblemDetails,
  createNetworkError,
} from './types';

const CSRF_STORAGE_KEY = 'cerberus:csrf-token';

const loadStoredCsrfToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.sessionStorage.getItem(CSRF_STORAGE_KEY);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Failed to read CSRF token from sessionStorage', error);
    }
    return null;
  }
};

const storeCsrfToken = (token: string | null): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (token) {
      window.sessionStorage.setItem(CSRF_STORAGE_KEY, token);
    } else {
      window.sessionStorage.removeItem(CSRF_STORAGE_KEY);
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Failed to persist CSRF token', error);
    }
  }
};

export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS';

type Primitive = string | number | boolean | bigint;

type QueryValue =
  | Primitive
  | null
  | undefined
  | ReadonlyArray<Primitive | null | undefined>;

export type QueryParams = Record<string, QueryValue> | URLSearchParams;

export interface ApiClientConfig {
  readonly baseUrl?: string;
  readonly defaultOrgSlug?: string;
  readonly fetchImpl?: typeof fetch;
  readonly csrfToken?: string | null;
  readonly onCsrfToken?: (token: string) => void;
}

export interface ApiRequestOptions {
  method?: HttpMethod;
  headers?: HeadersInit;
  body?: unknown;
  query?: QueryParams;
  orgSlug?: string;
  csrfToken?: string | null;
  cookie?: string;
  signal?: AbortSignal;
  cache?: RequestCache;
  credentials?: RequestCredentials;
  mode?: RequestMode;
  keepalive?: boolean;
  redirect?: RequestRedirect;
  referrer?: string;
  referrerPolicy?: ReferrerPolicy;
  integrity?: string;
}

const normalizePath = (path: string): string => {
  if (!path) {
    return '/';
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return path.startsWith('/') ? path : `/${path}`;
};

const appendQuery = (url: URL, query?: QueryParams) => {
  if (!query) {
    return;
  }

  if (query instanceof URLSearchParams) {
    query.forEach((value, key) => {
      url.searchParams.append(key, value);
    });
    return;
  }

  for (const [key, rawValue] of Object.entries(query)) {
    if (rawValue === undefined || rawValue === null) {
      continue;
    }

    const values = Array.isArray(rawValue) ? rawValue : [rawValue];

    for (const value of values) {
      if (value === undefined || value === null) {
        continue;
      }

      url.searchParams.append(key, String(value));
    }
  }
};

const isJsonLikeBody = (body: unknown): body is Record<string, unknown> => {
  if (!body || typeof body !== 'object') {
    return false;
  }

  if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) {
    return false;
  }

  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    return false;
  }

  if (typeof Blob !== 'undefined' && body instanceof Blob) {
    return false;
  }

  if (
    typeof URLSearchParams !== 'undefined' &&
    body instanceof URLSearchParams
  ) {
    return false;
  }

  return true;
};

const shouldSkipContentType = (body: unknown): boolean => {
  if (!body) {
    return true;
  }

  if (typeof body === 'string') {
    return false;
  }

  if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) {
    return true;
  }

  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    return true;
  }

  if (typeof Blob !== 'undefined' && body instanceof Blob) {
    return true;
  }

  if (
    typeof URLSearchParams !== 'undefined' &&
    body instanceof URLSearchParams
  ) {
    return true;
  }

  return false;
};

export class IamApiClient {
  private readonly baseUrl: string;
  private readonly defaultOrgSlug?: string;
  private readonly fetchImpl: typeof fetch;
  private csrfToken: string | null;
  private readonly onCsrfToken?: (token: string) => void;

  constructor(config: ApiClientConfig = {}) {
    const base = config.baseUrl ?? getIamApiBaseUrl();
    this.baseUrl = base.replace(/\/+$/, '');
    this.defaultOrgSlug = config.defaultOrgSlug;
    const resolvedFetch = config.fetchImpl ?? fetch;
    this.fetchImpl = (input, init) => resolvedFetch(input, init);
    this.csrfToken = config.csrfToken ?? loadStoredCsrfToken();
    this.onCsrfToken = config.onCsrfToken;
  }

  setCsrfToken(token: string | null): void {
    this.csrfToken = token;
    storeCsrfToken(token);
    if (token) {
      this.onCsrfToken?.(token);
    }
  }

  async request<T>(
    path: string,
    options: ApiRequestOptions = {}
  ): Promise<Result<T, ApiError>> {
    return this.executeRequest(path, options, false);
  }

  async ensureFreshCsrfToken(path: string = '/v1/auth/login'): Promise<void> {
    const url = this.buildUrl(path);
    const headers = new Headers();

    if (this.defaultOrgSlug) {
      headers.set('X-Org-Domain', this.defaultOrgSlug);
    }

    await this.fetchCsrfToken(url, headers);
  }

  private buildUrl(path: string, query?: QueryParams): string {
    if (/^https?:\/\//i.test(path)) {
      const url = new URL(path);
      appendQuery(url, query);
      return url.toString();
    }

    const normalizedBase = this.baseUrl || '';
    const normalizedPath = normalizePath(path);
    const combined = `${normalizedBase}${normalizedPath}`;
    const url = new URL(combined);
    appendQuery(url, query);
    return url.toString();
  }

  private async executeRequest<T>(
    path: string,
    options: ApiRequestOptions,
    hasRetried: boolean
  ): Promise<Result<T, ApiError>> {
    const {
      method = 'GET',
      headers,
      body,
      query,
      orgSlug,
      csrfToken,
      cookie,
      signal,
      cache,
      credentials,
      mode,
      keepalive,
      redirect,
      referrer,
      referrerPolicy,
      integrity,
    } = options;

    if (this.shouldIncludeCsrf(method) && !this.csrfToken) {
      await this.ensureFreshCsrfToken(path);
    }

    const url = this.buildUrl(path, query);

    const requestHeaders = new Headers(headers);

    if (!requestHeaders.has('Accept')) {
      requestHeaders.set('Accept', 'application/json');
    }

    const resolvedOrgSlug = orgSlug ?? this.defaultOrgSlug;
    if (resolvedOrgSlug && !requestHeaders.has('X-Org-Domain')) {
      requestHeaders.set('X-Org-Domain', resolvedOrgSlug);
    }

    const resolvedCsrfToken =
      csrfToken ??
      this.csrfToken ??
      requestHeaders.get('X-CSRF-Token') ??
      undefined;
    if (resolvedCsrfToken) {
      requestHeaders.set('X-CSRF-Token', resolvedCsrfToken);
    }

    if (cookie && typeof window === 'undefined') {
      requestHeaders.set('Cookie', cookie);
    }

    const init: RequestInit = {
      method,
      signal,
      cache,
      credentials: credentials ?? 'include',
      mode,
      keepalive,
      redirect,
      referrer,
      referrerPolicy,
      integrity,
      headers: requestHeaders,
    };

    if (body !== undefined && body !== null) {
      if (isJsonLikeBody(body)) {
        if (
          !requestHeaders.has('Content-Type') &&
          !shouldSkipContentType(body)
        ) {
          requestHeaders.set('Content-Type', 'application/json');
        }
        init.body = JSON.stringify(body);
      } else {
        init.body = body as BodyInit;
      }
    }

    try {
      const response = await this.fetchImpl(url, init);

      const incomingCsrf = response.headers.get('x-csrf-token');
      if (incomingCsrf) {
        this.setCsrfToken(incomingCsrf);
      }

      if (response.ok) {
        if (
          response.status === 204 ||
          response.status === 205 ||
          method === 'HEAD'
        ) {
          return ok(undefined as T);
        }

        const contentType =
          response.headers.get('content-type')?.toLowerCase() ?? '';

        if (contentType.includes('json')) {
          const data = (await response.json()) as T;
          return ok(data);
        }

        const text = (await response.text()) as unknown as T;
        return ok(text);
      }

      const problem = await parseProblemDetails(response);

      if (
        !hasRetried &&
        this.shouldAttemptCsrfRecovery(response.status, problem, method, url)
      ) {
        const recovered = await this.tryRecoverFromCsrfFailure(
          url,
          requestHeaders
        );

        if (recovered) {
          return this.executeRequest<T>(path, options, true);
        }
      }

      return err(problem);
    } catch (error) {
      return err(createNetworkError(error));
    }
  }

  private shouldAttemptCsrfRecovery(
    status: number,
    problem: ProblemDetails,
    method: HttpMethod,
    url: string
  ): boolean {
    if (status === 403 || status === 419) {
      return true;
    }

    const detail = problem.detail?.toLowerCase() ?? '';
    const title = problem.title?.toLowerCase() ?? '';

    if (detail.includes('csrf') || title.includes('csrf')) {
      return true;
    }

    if (status === 500 && method !== 'GET' && url.includes('/v1/auth/')) {
      return true;
    }

    return false;
  }

  private shouldIncludeCsrf(method: HttpMethod): boolean {
    return !['GET', 'HEAD', 'OPTIONS'].includes(method);
  }

  private async tryRecoverFromCsrfFailure(
    url: string,
    headers: Headers
  ): Promise<boolean> {
    this.setCsrfToken(null);
    return this.fetchCsrfToken(url, headers);
  }

  private async fetchCsrfToken(
    url: string,
    headers?: Headers
  ): Promise<boolean> {
    const probeHeaders = new Headers(headers);
    probeHeaders.delete('content-type');
    probeHeaders.delete('content-length');
    probeHeaders.delete('x-csrf-token');

    try {
      const attempt = async (method: HttpMethod): Promise<string | null> => {
        const response = await this.fetchImpl(url, {
          method,
          credentials: 'include',
          headers: new Headers(probeHeaders),
        });

        return response.headers.get('x-csrf-token');
      };

      const methods: HttpMethod[] = ['OPTIONS', 'GET'];

      for (const method of methods) {
        const token = await attempt(method);
        if (token) {
          this.setCsrfToken(token);
          return true;
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Failed to refresh CSRF token', error);
      }
    }

    return false;
  }
}

export const createIamApiClient = (
  config: ApiClientConfig = {}
): IamApiClient => new IamApiClient(config);

export const apiClient = new IamApiClient({
  defaultOrgSlug: getDefaultOrgSlug(),
});
