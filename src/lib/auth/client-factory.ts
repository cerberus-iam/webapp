import type { GetServerSidePropsContext, NextApiRequest } from 'next';

import { getDefaultOrgSlug, getIamApiBaseUrl } from '@/config/env';
import { type ApiClientConfig, IamApiClient } from '@/lib/api/client';
import { getCookieHeader, getCsrfTokenFromCookies } from '@/lib/auth/cookies';

export interface CreateClientOptions {
  defaultOrgSlug?: string;
  csrfToken?: string | null;
}

const resolveOrgSlug = (
  headers?: Record<string, unknown>
): string | undefined => {
  const headerValue = headers?.['x-org-domain'];
  if (typeof headerValue === 'string' && headerValue.trim()) {
    return headerValue.trim();
  }
  return getDefaultOrgSlug();
};

const buildConfig = (options: CreateClientOptions = {}): ApiClientConfig => ({
  baseUrl: getIamApiBaseUrl(),
  defaultOrgSlug: options.defaultOrgSlug ?? getDefaultOrgSlug(),
  csrfToken: options.csrfToken ?? null,
});

export const createApiClient = (
  options: CreateClientOptions = {}
): IamApiClient => new IamApiClient(buildConfig(options));

export const createServerApiClient = (
  context: Pick<GetServerSidePropsContext, 'req' | 'res'>,
  options: CreateClientOptions = {}
): IamApiClient => {
  const { req } = context;
  const cookie = getCookieHeader(req.headers);
  // Prefer explicit defaultOrgSlug option, then fall back to header resolution
  const orgSlug =
    options.defaultOrgSlug ??
    resolveOrgSlug(req.headers as Record<string, unknown>);
  const csrfToken = getCsrfTokenFromCookies(req.headers);

  console.log('[createServerApiClient] Creating client:', {
    baseUrl: getIamApiBaseUrl(),
    hasCookie: !!cookie,
    cookieLength: cookie?.length,
    cookies: cookie?.split(';').map((c) => c.trim().split('=')[0]),
    orgSlug,
    orgSlugSource: options.defaultOrgSlug ? 'explicit' : 'resolved',
    csrfToken: csrfToken ? `${csrfToken.substring(0, 8)}...` : null,
  });

  const config: ApiClientConfig = {
    ...buildConfig({ ...options, csrfToken }),
    fetchImpl: async (input, init) => {
      const headers = new Headers(init?.headers ?? {});
      if (cookie && !headers.has('cookie')) {
        headers.set('cookie', cookie);
      }

      if (orgSlug && !headers.has('x-org-domain')) {
        headers.set('x-org-domain', orgSlug);
      }

      console.log('[createServerApiClient.fetch] Making request:', {
        url:
          typeof input === 'string'
            ? input
            : input instanceof URL
              ? input.toString()
              : input.url,
        method: init?.method || 'GET',
        headers: Object.fromEntries(headers.entries()),
      });

      const response = await fetch(input, { ...init, headers });

      console.log('[createServerApiClient.fetch] Response received:', {
        url:
          typeof input === 'string'
            ? input
            : input instanceof URL
              ? input.toString()
              : input.url,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      return response;
    },
  };

  return new IamApiClient(config);
};

export const createApiClientFromRequest = (
  req: NextApiRequest,
  options: CreateClientOptions = {}
): IamApiClient => {
  const cookie = getCookieHeader(req.headers);
  const orgSlug = resolveOrgSlug(req.headers as Record<string, unknown>);
  const csrfToken = getCsrfTokenFromCookies(req.headers);

  const config: ApiClientConfig = {
    ...buildConfig({ ...options, csrfToken }),
    fetchImpl: async (input, init) => {
      const headers = new Headers(init?.headers ?? {});
      if (cookie && !headers.has('cookie')) {
        headers.set('cookie', cookie);
      }

      if (orgSlug && !headers.has('x-org-domain')) {
        headers.set('x-org-domain', orgSlug);
      }

      return fetch(input, { ...init, headers });
    },
  };

  return new IamApiClient(config);
};
