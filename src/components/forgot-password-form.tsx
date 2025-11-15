import { useCallback, useMemo, useState } from 'react';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api/client';
import { extractFieldErrors, getProblemMessage } from '@/lib/api/error-utils';
import type { FieldErrorMap } from '@/lib/api/error-utils';
import { cn } from '@/lib/utils';
import type { ForgotPasswordResponse } from '@/types/iam';

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrorMap>({});

  const resolveFieldErrors = useCallback(
    (field: 'email' | 'form') =>
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

    if (successMessage) {
      return {
        tone: 'success' as const,
        message: successMessage,
      };
    }

    return null;
  }, [formError, successMessage]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      setIsSubmitting(true);
      setFormError(null);
      setSuccessMessage(null);
      setFieldErrors({});

      try {
        const result = await apiClient.request<ForgotPasswordResponse>(
          '/v1/auth/forgot-password',
          {
            method: 'POST',
            body: { email: email.trim() },
          }
        );

        if (result.ok) {
          setSuccessMessage(
            result.value.message ||
              'If the email exists, we have sent instructions.'
          );
          setFieldErrors({});
          return;
        }

        const problem = result.error;
        const errors = extractFieldErrors(problem);
        setFieldErrors(errors);
        const messageFromErrors = errors.form?.[0];
        setFormError(messageFromErrors ?? getProblemMessage(problem));
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Forgot password request failed', error);
        }
        setFormError(
          'Unable to process your request right now. Please try again later.'
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [email]
  );

  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Forgot your password?</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email address and we&apos;ll send you a secure reset
            link.
          </p>
        </div>

        {formAlert && (
          <div
            role="alert"
            className={cn(
              'rounded-md border px-3 py-2 text-sm',
              formAlert.tone === 'error' &&
                'border-destructive text-destructive bg-destructive/10',
              formAlert.tone === 'success' &&
                'border-emerald-500 bg-emerald-500/10 text-emerald-600'
            )}
          >
            {formAlert.message}
          </div>
        )}

        <Field data-invalid={Boolean(fieldErrors.email?.length)}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <FieldDescription>
            We&apos;ll email you a link to reset your password.
          </FieldDescription>
          <FieldError errors={resolveFieldErrors('email') ?? undefined} />
        </Field>

        <Field>
          <Button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? 'Sending reset email…' : 'Send reset link'}
          </Button>
        </Field>

        <FieldDescription className="text-center">
          Remembered your password?{' '}
          <Link href="/login" className="underline underline-offset-4">
            Back to sign in
          </Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
