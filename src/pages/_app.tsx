import "@/styles/globals.css";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import { type ReactElement, type ReactNode } from "react";

import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

type NextPageWithLayout<P = Record<string, unknown>> = NextPage<P> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <ThemeProvider>
      <AuthProvider>{getLayout(<Component {...pageProps} />)}</AuthProvider>
    </ThemeProvider>
  );
}
