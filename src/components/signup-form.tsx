import { useCallback, useMemo, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'

import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api/client'
import { extractFieldErrors, getProblemMessage } from '@/lib/api/error-utils'
import type { FieldErrorMap } from '@/lib/api/error-utils'
import { cn } from '@/lib/utils'
import type { OnboardResponse } from '@/types/iam'

interface SignupState {
  organisationName: string
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const router = useRouter()

  const [formState, setFormState] = useState<SignupState>({
    organisationName: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrorMap>({})

  const updateField = useCallback(
    <K extends keyof SignupState>(field: K, value: SignupState[K]) => {
      setFormState((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  const resolveFieldErrors = useCallback(
    (field: keyof SignupState | 'form') =>
      fieldErrors[field]?.map((message) => ({ message })),
    [fieldErrors]
  )

  const formAlert = useMemo(() => {
    if (!formError) {
      return null
    }

    return {
      tone: 'error' as const,
      message: formError,
    }
  }, [formError])

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      setIsSubmitting(true)
      setFormError(null)
      setFieldErrors({})

      if (formState.password !== formState.confirmPassword) {
        const message = 'Passwords do not match.'
        setFormError(message)
        setFieldErrors({ confirmPassword: [message] })
        setIsSubmitting(false)
        return
      }

      const payload = {
        organisationName: formState.organisationName.trim(),
        email: formState.email.trim(),
        firstName: formState.firstName.trim(),
        lastName: formState.lastName.trim(),
        password: formState.password,
      }

      try {
        const result = await apiClient.request<OnboardResponse>(
          '/v1/auth/onboard',
          {
            method: 'POST',
            body: payload,
          }
        )

        if (result.ok) {
          setFieldErrors({})
          setFormError(null)
          void router.replace('/dashboard')
          return
        }

        const problem = result.error
        const errors = extractFieldErrors(problem)
        setFieldErrors(errors)

        const messageFromErrors = errors.form?.[0]
        setFormError(messageFromErrors ?? getProblemMessage(problem))
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Onboarding request failed', error)
        }
        setFormError(
          'Unable to create your organisation right now. Please try again.'
        )
      } finally {
        setIsSubmitting(false)
      }
    },
    [formState, router]
  )

  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Create your organisation</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Provision a new tenant, invite your team, and start managing access
            in minutes.
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

        <Field data-invalid={Boolean(fieldErrors.organisationName?.length)}>
          <FieldLabel htmlFor="organisationName">Organisation name</FieldLabel>
          <Input
            id="organisationName"
            name="organisationName"
            placeholder="Acme Corporation"
            required
            value={formState.organisationName}
            onChange={(event) =>
              updateField('organisationName', event.target.value)
            }
          />
          <FieldDescription>
            We&apos;ll generate a unique slug for this organisation based on the
            name.
          </FieldDescription>
          <FieldError
            errors={resolveFieldErrors('organisationName') ?? undefined}
          />
        </Field>

        <Field data-invalid={Boolean(fieldErrors.firstName?.length)}>
          <FieldLabel htmlFor="firstName">First name</FieldLabel>
          <Input
            id="firstName"
            name="firstName"
            autoComplete="given-name"
            required
            value={formState.firstName}
            onChange={(event) => updateField('firstName', event.target.value)}
          />
          <FieldError errors={resolveFieldErrors('firstName') ?? undefined} />
        </Field>

        <Field data-invalid={Boolean(fieldErrors.lastName?.length)}>
          <FieldLabel htmlFor="lastName">Last name</FieldLabel>
          <Input
            id="lastName"
            name="lastName"
            autoComplete="family-name"
            required
            value={formState.lastName}
            onChange={(event) => updateField('lastName', event.target.value)}
          />
          <FieldError errors={resolveFieldErrors('lastName') ?? undefined} />
        </Field>

        <Field data-invalid={Boolean(fieldErrors.email?.length)}>
          <FieldLabel htmlFor="email">Work email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            value={formState.email}
            onChange={(event) => updateField('email', event.target.value)}
          />
          <FieldDescription>
            We&apos;ll send administrative notifications and verification emails
            to this address.
          </FieldDescription>
          <FieldError errors={resolveFieldErrors('email') ?? undefined} />
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
            onChange={(event) => updateField('password', event.target.value)}
          />
          <FieldDescription>
            Must be at least 8 characters and meet your password policy.
          </FieldDescription>
          <FieldError errors={resolveFieldErrors('password') ?? undefined} />
        </Field>

        <Field data-invalid={Boolean(fieldErrors.confirmPassword?.length)}>
          <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
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
            {isSubmitting ? 'Creating organisation…' : 'Create account'}
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
            Sign up with GitHub
          </Button>
          <FieldDescription className="px-6 text-center">
            Already have an account?{' '}
            <Link href="/login" className="underline underline-offset-4">
              Sign in
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
