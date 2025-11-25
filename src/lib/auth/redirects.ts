import type { GetServerSidePropsContext } from 'next';

import { IamApiClient } from '@/lib/api/client';
import { createServerApiClient } from '@/lib/auth/client-factory';
import type { MeProfile } from '@/types/iam';

interface WithUser<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  props: T & {
    user: MeProfile;
  };
}

/**
 * Creates an authenticated API client using the user's organisation slug.
 * Use this in requireAuth handlers for making additional API requests.
 */
export const createAuthenticatedClient = (
  context: GetServerSidePropsContext,
  user: MeProfile
): IamApiClient => {
  return createServerApiClient(context, {
    defaultOrgSlug: user.organisation.slug,
  });
};

interface RedirectResponse {
  redirect: {
    destination: string;
    permanent: boolean;
  };
}

export type AuthenticatedGsspResult<T extends Record<string, unknown>> =
  | WithUser<T>
  | RedirectResponse;

export const requireAuth = async <
  T extends Record<string, unknown> = Record<string, unknown>,
>(
  context: GetServerSidePropsContext,
  handler: (args: {
    context: GetServerSidePropsContext;
    user: MeProfile;
  }) => Promise<T>
): Promise<AuthenticatedGsspResult<T>> => {
  try {
    console.log('[requireAuth] Starting auth check', {
      url: context.resolvedUrl,
      hasCookies: !!context.req.headers.cookie,
      cookies: context.req.headers.cookie
        ?.split(';')
        .map((c) => c.trim().split('=')[0]),
    });

    const client = createServerApiClient(context);

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    console.log('[requireAuth] Making /v1/me/profile request');
    const profile = await client.request<MeProfile>('/v1/me/profile', {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!profile.ok) {
      console.error('[requireAuth] Profile request failed:', {
        error: profile.error,
        status: profile.error.status,
        detail: profile.error.detail,
      });

      return {
        redirect: {
          destination: `/login?next=${encodeURIComponent(
            context.resolvedUrl ?? '/'
          )}`,
          permanent: false,
        },
      };
    }

    console.log('[requireAuth] Profile request succeeded:', {
      userId: profile.value.id,
      email: profile.value.email,
    });

    const data = await handler({ context, user: profile.value });

    return {
      props: {
        ...data,
        user: profile.value,
      },
    };
  } catch (error) {
    console.error('[requireAuth] Exception caught:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
    });

    return {
      redirect: {
        destination: `/login?next=${encodeURIComponent(
          context.resolvedUrl ?? '/'
        )}`,
        permanent: false,
      },
    };
  }
};

export const redirectIfAuthenticated = async (
  context: GetServerSidePropsContext,
  destination: string = '/dashboard'
): Promise<RedirectResponse | { props: Record<string, never> }> => {
  console.log('[redirectIfAuthenticated] Starting check', {
    url: context.resolvedUrl,
    destination,
    hasCookies: !!context.req.headers.cookie,
  });

  // Only check auth if we have cookies (basic optimization to avoid unnecessary API calls)
  const hasCookie = context.req.headers.cookie?.includes('cerb_sid');

  console.log('[redirectIfAuthenticated] Cookie check:', {
    hasCookie,
    cookieHeader: context.req.headers.cookie,
  });

  if (!hasCookie) {
    console.log(
      '[redirectIfAuthenticated] No session cookie found, staying on page'
    );
    // No session cookie, definitely not authenticated
    return { props: {} };
  }

  try {
    const client = createServerApiClient(context);

    console.log('[redirectIfAuthenticated] Making /v1/me/profile request');

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const profile = await client.request<MeProfile>('/v1/me/profile', {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (profile.ok) {
      console.log(
        '[redirectIfAuthenticated] User is authenticated, redirecting to:',
        destination
      );
      return {
        redirect: {
          destination,
          permanent: false,
        },
      };
    }

    console.log(
      '[redirectIfAuthenticated] Profile request failed, staying on page:',
      {
        error: profile.error,
        status: profile.error.status,
      }
    );

    return { props: {} };
  } catch (error) {
    console.error('[redirectIfAuthenticated] Exception caught:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
    });

    return { props: {} };
  }
};
