import type { GetServerSideProps, InferGetServerSidePropsType } from "next";

import { redirectIfAuthenticated } from "@/lib/auth/redirects";
import { LoginForm } from "@/components/login-form";
import { AuthLayout } from "@/layouts/auth";

export default function LoginPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) =>
  redirectIfAuthenticated(context);
