'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/router';
import { type ReactNode, useEffect } from 'react';

import { useAuth } from '@/hooks/use-auth';

type RequireAuthProps = {
  children: ReactNode;
};

export function RequireAuth({ children }: RequireAuthProps) {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === 'unauthenticated') {
      const returnTo = router.asPath || '/';
      void router.replace(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
    }
  }, [router, status]);

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="flex min-h-[400px] flex-1 items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          <span>Checking your session…</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
