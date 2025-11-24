import { useCallback, useEffect, useMemo, useState } from 'react';

import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { IconAlertCircle, IconLoader2 } from '@tabler/icons-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { AuthLayout } from '@/layouts/auth';
import { apiClient } from '@/lib/api/client';
import { extractFieldErrors, getProblemMessage } from '@/lib/api/error-utils';
import type { FieldErrorMap } from '@/lib/api/error-utils';
import {
  InvitationsApi,
  type PublicInvitationDetails,
} from '@/lib/api/invitations';
import { cn } from '@/lib/utils';

interface PageProps {
  token: string;
}

interface AcceptFormState {
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
}

type InvitationState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; invitation: PublicInvitationDetails };

export default function InviteAcceptPage({
  token,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();

  // Invitation state (loaded on mount)
  const [invitationState, setInvitationState] = useState<InvitationState>({
    status: 'loading',
  });

  // Form state
  const [formState, setFormState] = useState<AcceptFormState>({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrorMap>({});

  // Fetch invitation details on mount
  useEffect(() => {
    const fetchInvitation = async () => {
      const invitationsApi = new InvitationsApi(apiClient);
      const result = await invitationsApi.validateToken(token);

      if (result.ok) {
        setInvitationState({ status: 'success', invitation: result.value });
      } else {
        const message = getProblemMessage(result.error);
        setInvitationState({
          status: 'error',
          message: message || 'This invitation is invalid or has expired.',
        });
      }
    };

    void fetchInvitation();
  }, [token]);

  const updateField = useCallback(
    <K extends keyof AcceptFormState>(field: K, value: AcceptFormState[K]) => {
      setFormState((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const resolveFieldErrors = useCallback(
    (field: keyof AcceptFormState | 'form') =>
      fieldErrors[field]?.map((message) => ({ message })),
    [fieldErrors]
  );

  const formAlert = useMemo(() => {
    if (!formError) {
      return null;
    }

    return {
      tone: 'error' as const,
      message: formError,
    };
  }, [formError]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (invitationState.status !== 'success') {
        return;
      }

      setIsSubmitting(true);
      setFormError(null);
      setFieldErrors({});

      // Client-side password confirmation validation
      if (formState.password !== formState.confirmPassword) {
        const message = 'Passwords do not match.';
        setFormError(message);
        setFieldErrors({ confirmPassword: [message] });
        setIsSubmitting(false);
        return;
      }

      const invitationsApi = new InvitationsApi(apiClient);

      try {
        const result = await invitationsApi.acceptInvitation(token, {
          email: invitationState.invitation.email,
          firstName: formState.firstName.trim(),
          lastName: formState.lastName.trim(),
          password: formState.password,
        });

        if (result.ok) {
          setFieldErrors({});
          setFormError(null);
          // Redirect to dashboard - user is now authenticated via session cookie
          void router.replace('/dashboard');
          return;
        }

        const problem = result.error;
        const errors = extractFieldErrors(problem);
        setFieldErrors(errors);

        const messageFromErrors = errors.form?.[0];
        setFormError(messageFromErrors ?? getProblemMessage(problem));
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Accept invitation request failed', error);
        }
        setFormError(
          'Unable to accept invitation right now. Please try again.'
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [invitationState, formState, token, router]
  );

  // Loading state
  if (invitationState.status === 'loading') {
    return (
      <>
        <Head>
          <title>Accept Invitation | Cerberus IAM</title>
        </Head>
        <AuthLayout>
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <IconLoader2 className="text-muted-foreground size-8 animate-spin" />
            <p className="text-muted-foreground text-sm">
              Loading invitation details...
            </p>
          </div>
        </AuthLayout>
      </>
    );
  }

  // Error state
  if (invitationState.status === 'error') {
    return (
      <>
        <Head>
          <title>Invalid Invitation | Cerberus IAM</title>
        </Head>
        <AuthLayout>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-2xl font-bold">Invalid Invitation</h1>
              <p className="text-muted-foreground text-sm text-balance">
                This invitation link is no longer valid.
              </p>
            </div>

            <Alert variant="destructive">
              <IconAlertCircle className="size-4" />
              <AlertTitle>Unable to accept invitation</AlertTitle>
              <AlertDescription>{invitationState.message}</AlertDescription>
            </Alert>

            <div className="text-center">
              <p className="text-muted-foreground text-sm">
                Already have an account?{' '}
                <Link href="/login" className="underline underline-offset-4">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </AuthLayout>
      </>
    );
  }

  // Success state - show the form
  const { invitation } = invitationState;

  return (
    <>
      <Head>
        <title>Accept Invitation | Cerberus IAM</title>
      </Head>
      <AuthLayout>
        <form className={cn('flex flex-col gap-6')} onSubmit={handleSubmit}>
          <FieldGroup>
            <div className="flex flex-col items-center gap-1 text-center">
              <h1 className="text-2xl font-bold">Accept Invitation</h1>
              <p className="text-muted-foreground text-sm text-balance">
                You&apos;ve been invited to join{' '}
                <strong>{invitation.organisation.name}</strong> as a{' '}
                <strong>{invitation.role.name}</strong>.
              </p>
            </div>

            {formAlert && (
              <div
                role="alert"
                className="border-destructive bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
              >
                {formAlert.message}
              </div>
            )}

            {/* Email field - read-only, pre-filled from invitation */}
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                value={invitation.email}
                disabled
                readOnly
                className="bg-muted cursor-not-allowed"
              />
              <FieldDescription>
                You must use this email address to accept the invitation.
              </FieldDescription>
            </Field>

            <Field data-invalid={Boolean(fieldErrors.firstName?.length)}>
              <FieldLabel htmlFor="firstName">First name</FieldLabel>
              <Input
                id="firstName"
                name="firstName"
                autoComplete="given-name"
                required
                value={formState.firstName}
                onChange={(event) =>
                  updateField('firstName', event.target.value)
                }
              />
              <FieldError
                errors={resolveFieldErrors('firstName') ?? undefined}
              />
            </Field>

            <Field data-invalid={Boolean(fieldErrors.lastName?.length)}>
              <FieldLabel htmlFor="lastName">Last name</FieldLabel>
              <Input
                id="lastName"
                name="lastName"
                autoComplete="family-name"
                required
                value={formState.lastName}
                onChange={(event) =>
                  updateField('lastName', event.target.value)
                }
              />
              <FieldError
                errors={resolveFieldErrors('lastName') ?? undefined}
              />
            </Field>

            <Field data-invalid={Boolean(fieldErrors.password?.length)}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={formState.password}
                onChange={(event) =>
                  updateField('password', event.target.value)
                }
              />
              <FieldDescription>
                Must be at least 8 characters and meet password requirements.
              </FieldDescription>
              <FieldError
                errors={resolveFieldErrors('password') ?? undefined}
              />
            </Field>

            <Field data-invalid={Boolean(fieldErrors.confirmPassword?.length)}>
              <FieldLabel htmlFor="confirmPassword">
                Confirm password
              </FieldLabel>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formState.confirmPassword}
                onChange={(event) =>
                  updateField('confirmPassword', event.target.value)
                }
              />
              <FieldError
                errors={resolveFieldErrors('confirmPassword') ?? undefined}
              />
            </Field>

            <Field>
              <Button
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? 'Creating account…' : 'Accept Invitation'}
              </Button>
            </Field>

            {invitation.invitedBy && (
              <p className="text-muted-foreground text-center text-xs">
                Invited by{' '}
                {invitation.invitedBy.name || invitation.invitedBy.email}
              </p>
            )}

            <p className="text-muted-foreground text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </FieldGroup>
        </form>
      </AuthLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  context
) => {
  const { token } = context.params as { token: string };

  if (!token || typeof token !== 'string') {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      token,
    },
  };
};
