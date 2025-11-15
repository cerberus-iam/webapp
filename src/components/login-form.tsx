import { useCallback, useMemo, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/router';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api/client';
import { extractFieldErrors, getProblemMessage } from '@/lib/api/error-utils';
import type { FieldErrorMap } from '@/lib/api/error-utils';
import { cn } from '@/lib/utils';
import type { LoginResponse } from '@/types/iam';

interface FormState {
  email: string;
  password: string;
  mfaToken: string;
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const router = useRouter();

  const [formState, setFormState] = useState<FormState>({
    email: '',
    password: '',
    mfaToken: '',
  });
  const [requiresMfa, setRequiresMfa] = useState(false);
  const [enrollmentRequired, setEnrollmentRequired] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrorMap>({});

  const { email, password, mfaToken } = formState;

  const updateField = useCallback(
    <K extends keyof FormState>(field: K, value: FormState[K]) => {
      setFormState((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const resolveFieldErrors = useCallback(
    (field: keyof FormState | 'form') =>
      fieldErrors[field]?.map((message) => ({ message })),
    [fieldErrors]
  );

  const formAlert = useMemo(() => {
    if (formError) {
      return {
        tone: 'error' as const,
        message: formError,
      };
    }

    if (enrollmentRequired) {
      return {
        tone: 'warning' as const,
        message:
          'Your organisation requires multi-factor authentication. Please enrol before signing in.',
      };
    }

    if (requiresMfa && !formError) {
      return {
        tone: 'info' as const,
        message:
          'Enter the six-digit code from your authenticator app to continue.',
      };
    }

    return null;
  }, [enrollmentRequired, formError, requiresMfa]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      setIsSubmitting(true);
      setFormError(null);
      setFieldErrors({});
      setEnrollmentRequired(false);

      const payload: Record<string, string> = {
        email: email.trim(),
        password,
      };

      const trimmedMfa = mfaToken.trim();
      if ((requiresMfa || trimmedMfa) && trimmedMfa) {
        payload.mfaToken = trimmedMfa;
      }

      try {
        const result = await apiClient.request<LoginResponse>(
          '/v1/auth/login',
          {
            method: 'POST',
            body: payload,
          }
        );

        if (result.ok) {
          setFieldErrors({});
          setFormError(null);
          setRequiresMfa(false);
          setEnrollmentRequired(false);
          setFormState((prev) => ({ ...prev, password: '', mfaToken: '' }));

          // Keep loading state active during redirect
          const queryNext = router.query?.next;
          const destination =
            typeof queryNext === 'string' && queryNext
              ? queryNext
              : '/dashboard';
          void router.replace(destination);
          // Don't set isSubmitting to false - keep loading until redirect completes
          return;
        }

        const problem = result.error;
        const errors = extractFieldErrors(problem);
        setFieldErrors(errors);

        if ((problem as Record<string, unknown>).requiresMfa) {
          setRequiresMfa(true);
        }

        if ((problem as Record<string, unknown>).requiresEnrollment) {
          setEnrollmentRequired(true);
        }

        const messageFromErrors = errors.form?.[0];
        setFormError(messageFromErrors ?? getProblemMessage(problem));
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Login request failed', error);
        }
        setFormError('Unable to sign in right now. Please try again later.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, password, mfaToken, requiresMfa, router]
  );

  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your credentials to access the admin console.
          </p>
        </div>

        {formAlert && (
          <div
            role="alert"
            className={cn(
              'rounded-md border px-3 py-2 text-sm',
              formAlert.tone === 'error' &&
                'border-destructive text-destructive bg-destructive/10',
              formAlert.tone === 'warning' &&
                'border-amber-500 bg-amber-500/10 text-amber-600',
              formAlert.tone === 'info' &&
                'border-primary text-primary bg-primary/10'
            )}
          >
            {formAlert.message}
          </div>
        )}

        <Field data-invalid={Boolean(fieldErrors.email?.length)}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            value={email}
            onChange={(event) => updateField('email', event.target.value)}
          />
          <FieldError errors={resolveFieldErrors('email') ?? undefined} />
        </Field>

        <Field data-invalid={Boolean(fieldErrors.password?.length)}>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              href="/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => updateField('password', event.target.value)}
          />
          <FieldError errors={resolveFieldErrors('password') ?? undefined} />
        </Field>

        {(requiresMfa || mfaToken.length > 0) && (
          <Field data-invalid={Boolean(fieldErrors.mfaToken?.length)}>
            <FieldLabel htmlFor="mfaToken">MFA Code</FieldLabel>
            <Input
              id="mfaToken"
              name="mfaToken"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              autoComplete="one-time-code"
              placeholder="123456"
              required={requiresMfa}
              value={mfaToken}
              onChange={(event) => updateField('mfaToken', event.target.value)}
            />
            <FieldDescription>
              Enter the six-digit verification code from your authenticator app.
            </FieldDescription>
            <FieldError errors={resolveFieldErrors('mfaToken') ?? undefined} />
          </Field>
        )}

        <Field>
          <Button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? 'Signing in…' : 'Login'}
          </Button>
        </Field>

        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <Button variant="outline" type="button" disabled={isSubmitting}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                fill="currentColor"
              />
            </svg>
            Login with GitHub
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="underline underline-offset-4">
              Create one
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
