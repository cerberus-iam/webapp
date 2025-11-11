import { type ReactNode } from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  showBackToHome?: boolean;
}

export function AuthLayout({
  children,
  title,
  description,
  showBackToHome = false,
}: AuthLayoutProps) {
  return (
    <div className="container relative grid h-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="absolute right-4 top-4 md:right-8 md:top-8 flex items-center gap-4">
        {showBackToHome && (
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Back to Home
          </Link>
        )}
        <ThemeToggle />
      </div>

      {/* Left side - Branding/Image */}
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-primary/80" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Shield className="mr-2 h-6 w-6" />
          Cerberus IAM
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              Enterprise-grade identity and access management for modern applications.
            </p>
            <footer className="text-sm text-white/80">Secure, scalable, and simple</footer>
          </blockquote>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
          <div className="flex flex-col space-y-2 text-center">
            <div className="lg:hidden flex items-center justify-center mb-4">
              <Shield className="mr-2 h-8 w-8 text-primary" />
              <h1 className="text-2xl font-semibold tracking-tight">Cerberus IAM</h1>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>

          {children}

          <p className="px-8 text-center text-sm text-muted-foreground">
            By continuing, you agree to our{' '}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
