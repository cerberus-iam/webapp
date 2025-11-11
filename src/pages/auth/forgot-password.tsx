import { type ReactElement, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Mail, CheckCircle2 } from 'lucide-react';
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
import { getApiErrorMessage } from '@/lib/http';
import { iamApi } from '@/lib/iam/api';
import type { NextPageWithLayout } from '@/types/page';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage: NextPageWithLayout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    try {
      setIsLoading(true);
      setSubmittedEmail(data.email);

      await iamApi.auth.forgotPassword({
        email: data.email,
      });

      setIsSuccess(true);
      toast.success('Password reset link sent to your email');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to send reset link'));
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <AuthLayout
        title="Check your email"
        description="We have sent you a password reset link"
        showBackToHome
      >
        <div className="space-y-6">
          <div className="rounded-lg border bg-muted/50 p-6 space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-3">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">We have sent a password reset link to</p>
              <p className="font-semibold">{submittedEmail}</p>
            </div>

            <div className="text-sm text-muted-foreground space-y-2">
              <p>Click the link in the email to reset your password.</p>
              <p>The link will expire in 1 hour.</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-center text-muted-foreground">
              Did not receive the email? Check your spam folder or
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setIsSuccess(false);
                form.reset();
              }}
            >
              Try another email
            </Button>
          </div>

          <div className="text-center">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-primary hover:underline transition-colors"
            >
              Back to login
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      description="Enter your email and we'll send you a reset link"
      showBackToHome
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      disabled={isLoading}
                      className="pl-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Reset Link
          </Button>

          <div className="text-center">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Back to login
            </Link>
          </div>
        </form>
      </Form>
    </AuthLayout>
  );
};

ForgotPasswordPage.getLayout = (page: ReactElement) => page;

export default ForgotPasswordPage;
