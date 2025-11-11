import { type ReactElement, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Eye, EyeOff, Mail, User, Lock, Building2, CalendarClock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';

import { AuthLayout } from '@/components/layout/auth-layout';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/use-auth';
import { getApiErrorMessage } from '@/lib/http';
import { iamApi } from '@/lib/iam/api';
import type { InvitationValidationResponse } from '@/types/api';
import type { NextPageWithLayout } from '@/types/page';

const registerSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const calculatePasswordStrength = (pwd: string): number => {
  let strength = 0;
  if (pwd.length >= 8) strength += 25;
  if (pwd.length >= 12) strength += 25;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) strength += 25;
  if (/[0-9]/.test(pwd)) strength += 15;
  if (/[^A-Za-z0-9]/.test(pwd)) strength += 10;
  return Math.min(strength, 100);
};

const getStrengthLabel = (strength: number): string => {
  if (strength < 40) return 'Weak';
  if (strength < 70) return 'Medium';
  return 'Strong';
};

const RegisterPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [invitation, setInvitation] = useState<InvitationValidationResponse | null>(null);
  const [loadingInvitation, setLoadingInvitation] = useState(true);
  const [invitationError, setInvitationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const tokenQuery = router.query.token;
  const token = typeof tokenQuery === 'string' ? tokenQuery : undefined;

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: typeof router.query.email === 'string' ? router.query.email : '',
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = form.watch('password');
  const passwordStrength = useMemo(
    () => calculatePasswordStrength(passwordValue || ''),
    [passwordValue],
  );

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    if (!token) {
      setInvitationError(
        'Invitation token is missing. Request a new invitation from your administrator.',
      );
      setLoadingInvitation(false);
      return;
    }

    const controller = new AbortController();
    let isActive = true;

    setLoadingInvitation(true);
    setInvitationError(null);

    iamApi.auth
      .validateInvitation(token, controller.signal)
      .then((data) => {
        if (!isActive) {
          return;
        }
        setInvitation(data);
        form.reset({
          email: data.email,
          firstName: '',
          lastName: '',
          password: '',
          confirmPassword: '',
        });
      })
      .catch((error) => {
        if (!isActive && controller.signal.aborted) {
          return;
        }
        setInvitationError(getApiErrorMessage(error, 'Unable to validate invitation'));
      })
      .finally(() => {
        if (isActive) {
          setLoadingInvitation(false);
        }
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [router.isReady, token, form]);

  const handleSubmit = async (data: RegisterFormData) => {
    if (!token) {
      toast.error('Invitation token is missing. Try opening the link from your email again.');
      return;
    }

    try {
      setIsSubmitting(true);
      await iamApi.auth.register({
        token,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
      });

      toast.success('Account created successfully');
      setIsSuccess(true);

      try {
        await login({ email: data.email, password: data.password });
        router.push('/');
      } catch (loginError: unknown) {
        toast.warning(
          getApiErrorMessage(
            loginError,
            'Account created but automatic sign-in failed. Please log in manually.',
          ),
        );
        router.push('/auth/login');
      }
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to create account'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingInvitation) {
    return (
      <AuthLayout title="Checking your invitation" description="Just a moment..." showBackToHome>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AuthLayout>
    );
  }

  if (invitationError) {
    return (
      <AuthLayout
        title="Invitation cannot be used"
        description="We could not validate your invitation."
        showBackToHome
      >
        <div className="space-y-6">
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {invitationError}
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Confirm that you used the most recent invitation email sent by your organisation.</p>
            <p>
              If the link expired, ask your administrator to send a new invitation or contact
              support.
            </p>
            <Link href="/auth/forgot-password" className="text-primary hover:underline">
              Forgot your password instead?
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (!invitation) {
    return (
      <AuthLayout
        title="Invitation not found"
        description="We could not find an invitation matching this request."
        showBackToHome
      >
        <div className="space-y-6 text-sm text-muted-foreground">
          <p>The invitation may have been revoked or already used.</p>
          <p>Reach out to your administrator to request a new invitation.</p>
        </div>
      </AuthLayout>
    );
  }

  if (isSuccess) {
    return (
      <AuthLayout
        title="Account created"
        description="Your invitation is confirmed. Redirecting you to the dashboard."
        showBackToHome
      >
        <div className="space-y-6">
          <div className="rounded-lg border bg-muted/50 p-6 space-y-3 text-center">
            <p className="text-sm text-muted-foreground">
              You now have access to {invitation.organisation.name}.
            </p>
            <p className="font-semibold">Sit tight while we sign you in.</p>
          </div>
          <Button className="w-full" onClick={() => router.push('/auth/login')}>
            Go to login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  const expiresAt = new Date(invitation.expiresAt).toLocaleString();

  return (
    <AuthLayout
      title="Create your account"
      description={`Join ${invitation.organisation.name} on Cerberus IAM`}
      showBackToHome
    >
      <div className="space-y-6">
        <div className="rounded-lg border bg-muted/50 p-4 space-y-2 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <Building2 className="h-4 w-4" />
            {invitation.organisation.name}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4" />
            {invitation.email}
          </div>
          {invitation.role ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              Invited as {invitation.role.name}
            </div>
          ) : null}
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarClock className="h-4 w-4" />
            Invitation expires on {expiresAt}
          </div>
          {invitation.invitedBy ? (
            <p className="text-muted-foreground">
              Sent by{' '}
              {invitation.invitedBy.name ?? invitation.invitedBy.email ?? 'an administrator'}
            </p>
          ) : null}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="name@example.com"
                        autoComplete="email"
                        disabled={isSubmitting || Boolean(invitation)}
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Ada"
                          autoComplete="given-name"
                          disabled={isSubmitting}
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Lovelace"
                          autoComplete="family-name"
                          disabled={isSubmitting}
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        autoComplete="new-password"
                        disabled={isSubmitting}
                        className="pl-10 pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  {passwordValue ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Password strength:</span>
                        <span
                          className={
                            passwordStrength >= 70
                              ? 'text-green-600'
                              : passwordStrength >= 40
                                ? 'text-yellow-600'
                                : 'text-red-600'
                          }
                        >
                          {getStrengthLabel(passwordStrength)}
                        </span>
                      </div>
                      <Progress value={passwordStrength} />
                    </div>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Re-enter your password"
                        autoComplete="new-password"
                        disabled={isSubmitting}
                        className="pl-10 pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((value) => !value)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create account
            </Button>

            <div className="text-center text-sm">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </AuthLayout>
  );
};

RegisterPage.getLayout = (page: ReactElement) => page;

export default RegisterPage;
