import { useState, type ReactElement } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
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
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/use-auth';
import { ApiError, getApiErrorMessage } from '@/lib/http';
import type { NextPageWithLayout } from '@/types/page';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

const mfaSchema = z.object({
  mfaToken: z.string().length(6, 'MFA token must be 6 digits'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type MfaFormData = z.infer<typeof mfaSchema>;

const LoginPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [requiresMfa, setRequiresMfa] = useState(false);
  const [credentials, setCredentials] = useState<LoginFormData | null>(null);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const mfaForm = useForm<MfaFormData>({
    resolver: zodResolver(mfaSchema),
    defaultValues: {
      mfaToken: '',
    },
  });

  async function onLoginSubmit(data: LoginFormData) {
    try {
      setIsLoading(true);
      setCredentials(data);

      await login({
        email: data.email,
        password: data.password,
      });

      // Successful login
      toast.success('Welcome back!');
      setCredentials(null);
      setRequiresMfa(false);

      // Redirect to return URL or dashboard
      const returnTo = (router.query.returnTo as string) || '/';
      router.push(returnTo);
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        const payload =
          typeof error.payload === 'object' && error.payload !== null
            ? (error.payload as Record<string, unknown>)
            : undefined;

        const requiresEnrollment = Boolean(payload?.requiresEnrollment);
        const requiresMfa = Boolean(payload?.requiresMfa);

        if (requiresEnrollment) {
          setCredentials(null);
          toast.error('You must complete MFA enrollment before logging in.');
          return;
        }

        if (requiresMfa) {
          setRequiresMfa(true);
          toast.info('Please enter your 6-digit MFA code');
          mfaForm.reset();
          return;
        }

        setCredentials(null);
        toast.error(getApiErrorMessage(error, 'Invalid email or password'));
        return;
      }

      setCredentials(null);
      toast.error('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  }

  async function onMfaSubmit(data: MfaFormData) {
    if (!credentials) return;

    try {
      setIsLoading(true);

      await login({
        email: credentials.email,
        password: credentials.password,
        mfaToken: data.mfaToken,
      });

      toast.success('Welcome back!');
      setCredentials(null);
      setRequiresMfa(false);
      mfaForm.reset();

      const returnTo = (router.query.returnTo as string) || '/';
      router.push(returnTo);
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        toast.error(getApiErrorMessage(error, 'Invalid MFA code'));
        setRequiresMfa(true);
      } else {
        toast.error('Invalid MFA code');
      }

      mfaForm.setError('mfaToken', {
        message: 'Invalid MFA code. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleBackToLogin() {
    setRequiresMfa(false);
    setCredentials(null);
    mfaForm.reset();
  }

  if (requiresMfa) {
    return (
      <AuthLayout
        title="Two-Factor Authentication"
        description="Enter the 6-digit code from your authenticator app"
      >
        <Form {...mfaForm}>
          <form onSubmit={mfaForm.handleSubmit(onMfaSubmit)} className="space-y-4">
            <FormField
              control={mfaForm.control}
              name="mfaToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Authentication Code</FormLabel>
                  <FormControl>
                    <div className="flex justify-center">
                      <InputOTP maxLength={6} {...field}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify and Continue
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={handleBackToLogin}
              disabled={isLoading}
            >
              Back to Login
            </Button>
          </form>
        </Form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Welcome back" description="Enter your credentials to access your account">
      <Form {...loginForm}>
        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
          <FormField
            control={loginForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    autoComplete="email"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={loginForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={loginForm.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-normal">Remember me for 30 days</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <div className="text-center text-sm">
            Don&apos;t have an organization?{' '}
            <Link
              href="/auth/register"
              className="font-medium text-primary hover:underline transition-colors"
            >
              Create one
            </Link>
          </div>
        </form>
      </Form>
    </AuthLayout>
  );
};

LoginPage.getLayout = (page: ReactElement) => page;

export default LoginPage;
