import type { GetServerSidePropsContext } from 'next';

import { createServerApiClient } from '@/lib/auth/client-factory';
import type { MeProfile } from '@/types/iam';

interface WithUser<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  props: T & {
    user: MeProfile;
  };
}

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
    const client = createServerApiClient(context);

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const profile = await client.request<MeProfile>('/v1/me/profile', {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!profile.ok) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Profile request failed:', profile.error);
      }

      return {
        redirect: {
          destination: `/login?next=${encodeURIComponent(
            context.resolvedUrl ?? '/'
          )}`,
          permanent: false,
        },
      };
    }

    const data = await handler({ context, user: profile.value });

    return {
      props: {
        ...data,
        user: profile.value,
      },
    };
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Failed to load profile during SSR', error);
    }

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
  // Only check auth if we have cookies (basic optimization to avoid unnecessary API calls)
  const hasCookie = context.req.headers.cookie?.includes('cerberus_session');

  if (!hasCookie) {
    // No session cookie, definitely not authenticated
    return { props: {} };
  }

  try {
    const client = createServerApiClient(context);

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const profile = await client.request<MeProfile>('/v1/me/profile', {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (profile.ok) {
      return {
        redirect: {
          destination,
          permanent: false,
        },
      };
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(
        'Failed to validate session during redirectIfAuthenticated',
        error
      );
    }
  }

  return { props: {} };
};
