import type { GetServerSideProps, InferGetServerSidePropsType } from "next";

import { redirectIfAuthenticated } from "@/lib/auth/redirects";
import { SignupForm } from "@/components/signup-form";
import { AuthLayout } from "@/layouts/auth";

export default function SignupPage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  return (
    <AuthLayout>
      <SignupForm />
    </AuthLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) =>
  redirectIfAuthenticated(context);
