import type { GetServerSidePropsContext, NextApiRequest } from 'next';

import { getDefaultOrgSlug, getIamApiBaseUrl } from '@/config/env';
import { type ApiClientConfig, IamApiClient } from '@/lib/api/client';
import { getCookieHeader } from '@/lib/auth/cookies';

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
  const orgSlug = resolveOrgSlug(req.headers as Record<string, unknown>);

  const config: ApiClientConfig = {
    ...buildConfig(options),
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

export const createApiClientFromRequest = (
  req: NextApiRequest,
  options: CreateClientOptions = {}
): IamApiClient => {
  const cookie = getCookieHeader(req.headers);
  const orgSlug = resolveOrgSlug(req.headers as Record<string, unknown>);

  const config: ApiClientConfig = {
    ...buildConfig(options),
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
