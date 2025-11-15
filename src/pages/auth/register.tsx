import type { GetServerSideProps } from 'next';

import { SignupForm } from '@/components/signup-form';
import { AuthLayout } from '@/layouts/auth';
import { redirectIfAuthenticated } from '@/lib/auth/redirects';

export default function SignupPage() {
  return (
    <AuthLayout>
      <SignupForm />
    </AuthLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) =>
  redirectIfAuthenticated(context);
