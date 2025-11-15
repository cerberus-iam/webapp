import type { GetServerSideProps } from 'next'

import { LoginForm } from '@/components/login-form'
import { AuthLayout } from '@/layouts/auth'
import { redirectIfAuthenticated } from '@/lib/auth/redirects'

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) =>
  redirectIfAuthenticated(context)
