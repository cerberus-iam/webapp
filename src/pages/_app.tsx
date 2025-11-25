import type { AppProps } from 'next/app';

import { PageProgress } from '@/components/page-progress';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import '@/styles/globals.css';
import '@/styles/nprogress.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <PageProgress />
      <Component {...pageProps} />
      <Toaster />
    </ThemeProvider>
  );
}
