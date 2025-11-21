import { GetServerSideProps } from 'next';

import { createServerApiClient } from '@/lib/auth/client-factory';
import type { MeProfile } from '@/types/iam';

export default function Home() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    // Check if user is authenticated
    const client = createServerApiClient(context);
    const profile = await client.request<MeProfile>('/v1/me/profile', {
      method: 'GET',
    });

    if (profile.ok) {
      // User is authenticated, redirect to dashboard
      return {
        redirect: {
          destination: '/dashboard',
          permanent: false,
        },
      };
    }
  } catch {
    // Not authenticated or error, continue to login redirect
  }

  // User is not authenticated, redirect to login
  return {
    redirect: {
      destination: '/login',
      permanent: false,
    },
  };
};
