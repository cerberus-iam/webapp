import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Favicons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />

        {/* Web App Manifest */}
        <link rel="manifest" href="/site.webmanifest" />

        {/* Theme Color - Light mode */}
        <meta name="theme-color" content="#ffffff" />
        {/* Theme Color - Dark mode */}
        <meta
          name="theme-color"
          content="#1a1a1a"
          media="(prefers-color-scheme: dark)"
        />

        {/* PWA Meta Tags */}
        <meta name="application-name" content="Cerberus IAM" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Cerberus IAM" />
        <meta name="mobile-web-app-capable" content="yes" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
